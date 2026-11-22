'use strict';

/**
 * NLP 服务管理器：Node 自动拉起 Python spaCy 服务，含健康检查、崩溃自动重启与降级。
 * 如果 Python/spaCy 不可用，所有调用安全降级为 null，不影响主应用。
 *
 * 策略：
 * - 崩溃自动重启：指数退避（1s/2s/4s），连续 3 次仍失败进入降级态（不再重试，
 *   重启 Node 进程可重新尝试），避免反复拉起失败的服务
 * - 快速失败：启动失败后的 5 秒冷却期内，分析请求直接返回 null，
 *   不再每个请求都阻塞在 waitReady 上
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const NLP_PORT = Number(process.env.NLP_PORT || 8791);
const NLP_URL = `http://127.0.0.1:${NLP_PORT}`;
const SCRIPT = path.join(__dirname, 'nlp', 'server.py');

const MAX_CONSECUTIVE_FAILURES = 3; // 连续启动失败上限，超过进入降级态
const FAIL_COOLDOWN_MS = 5000;      // 启动失败后的快速失败冷却期

let child = null;
let startAttempted = false;
let lastHealthCheck = 0;
let healthy = null;
let consecutiveFailures = 0;
let lastFailAt = 0;                 // 上一次确认「服务不可用」的时间
let restarting = false;
let shuttingDown = false;

/** 解析可用的 Python 解释器：环境变量 > 项目 .venv > 系统 python */
function resolvePython() {
  if (process.env.PYTHON_BIN) return process.env.PYTHON_BIN;
  const candidates = [
    path.join(__dirname, '.venv', 'Scripts', 'python.exe'),
    path.join(__dirname, '.venv', 'bin', 'python')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'python';
}

/** 检测 NLP 服务是否可用（带 5 秒短缓存） */
async function checkHealth(force = false) {
  const now = Date.now();
  if (!force && healthy !== null && now - lastHealthCheck < 5000) return healthy;
  lastHealthCheck = now;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 1200);
  try {
    const res = await fetch(`${NLP_URL}/health`, { signal: ctl.signal });
    healthy = res.ok;
    return healthy;
  } catch (_) {
    healthy = false;
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** 拉起 Python 子进程（内部） */
function spawnChild() {
  const python = resolvePython();
  child = spawn(python, [SCRIPT], {
    env: Object.assign({}, process.env, { NLP_PORT: String(NLP_PORT) }),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  child.stdout?.on('data', (d) => process.stdout.write(`[nlp] ${d}`));
  child.stderr?.on('data', (d) => process.stderr.write(`[nlp] ${d}`));
  child.on('exit', (code) => {
    child = null;
    if (shuttingDown) return;
    healthy = false;
    if (code && code !== 0) process.stderr.write(`[nlp] 服务退出(code=${code})\n`);
    scheduleRestart();
  });
  child.on('error', (e) => {
    child = null;
    healthy = false;
    process.stderr.write(`[nlp] 启动失败: ${e.message}\n`);
    scheduleRestart();
  });
}

/** 崩溃自动重启：指数退避 1s/2s/4s，连续 3 次失败进入降级态 */
function scheduleRestart() {
  if (restarting || shuttingDown) return;
  consecutiveFailures += 1;
  if (consecutiveFailures > MAX_CONSECUTIVE_FAILURES) {
    lastFailAt = Date.now();
    process.stderr.write(`[nlp] 连续 ${MAX_CONSECUTIVE_FAILURES} 次启动失败，进入降级态（重启 Node 后可重新尝试）\n`);
    return;
  }
  restarting = true;
  const delay = 1000 * Math.pow(2, consecutiveFailures - 1);
  process.stderr.write(`[nlp] ${delay}ms 后自动重启（第 ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES} 次）\n`);
  setTimeout(() => {
    restarting = false;
    if (shuttingDown) return;
    startAttempted = true;
    try {
      spawnChild();
    } catch (e) {
      process.stderr.write(`[nlp] 无法启动: ${e.message}\n`);
      scheduleRestart();
    }
  }, delay);
}

/** 自动启动 Python NLP 服务（幂等） */
function ensureStarted() {
  if (startAttempted || shuttingDown) return;
  startAttempted = true;
  if (!fs.existsSync(SCRIPT)) return;
  try {
    spawnChild();
  } catch (e) {
    process.stderr.write(`[nlp] 无法启动: ${e.message}\n`);
    scheduleRestart();
  }
}

/** 等待服务就绪（最多 waitMs） */
async function waitReady(waitMs = 8000) {
  ensureStarted();
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    if (await checkHealth(true)) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

/** 分析请求的前置检查：健康直通；降级态/冷却期内快速失败；否则短暂等待 */
async function ensureAvailable() {
  if (healthy === true) return true;
  if (shuttingDown) return false;
  if (consecutiveFailures > MAX_CONSECUTIVE_FAILURES) return false;            // 降级态
  if (lastFailAt && Date.now() - lastFailAt < FAIL_COOLDOWN_MS) return false;  // 冷却期
  if (await waitReady(5000)) {
    consecutiveFailures = 0;
    return true;
  }
  lastFailAt = Date.now();
  return false;
}

/** 统一的 NLP 分析请求；任何失败一律返回 null（降级） */
async function analyzeRequest(endpoint, payload, timeoutMs) {
  if (!await ensureAvailable()) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${NLP_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctl.signal
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? data : null;
  } catch (_) {
    healthy = false;
    lastFailAt = Date.now();
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 调用 NLP 分析句子。返回完整结构或 null（降级）。 */
function analyzeSentence(text, timeoutMs = 15000) {
  return analyzeRequest('analyze-sentence', { text, preview: true }, timeoutMs);
}

/** 批量分析文章句子（maxSentences 夹取 1-200） */
function analyzeText(text, maxSentences = 80, timeoutMs = 30000) {
  const n = Math.max(1, Math.min(200, Math.floor(Number(maxSentences) || 80)));
  return analyzeRequest('analyze-text', { text, maxSentences: n }, timeoutMs);
}

/** 关闭 NLP 子进程（Node 退出时调用；之后的重启请求全部忽略） */
function shutdown() {
  shuttingDown = true;
  if (child) {
    try { child.kill(); } catch (_) {}
    child = null;
  }
}

module.exports = {
  NLP_PORT, ensureStarted, waitReady, checkHealth,
  analyzeSentence, analyzeText, shutdown,
  get available() { return healthy === true && !shuttingDown; }
};
