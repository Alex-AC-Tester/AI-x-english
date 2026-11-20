'use strict';
/**
 * NLP 服务管理器：Node 自动拉起 Python spaCy 服务，含健康检查与降级。
 * 如果 Python/spaCy 不可用，所有调用安全降级为 null，不影响主应用。
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const NLP_PORT = Number(process.env.NLP_PORT || 8791);
const NLP_URL = `http://127.0.0.1:${NLP_PORT}`;
const SCRIPT = path.join(__dirname, 'nlp', 'server.py');

let child = null;
let startAttempted = false;
let lastHealthCheck = 0;
let healthy = null;

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

/** 检测 NLP 服务是否可用（带短缓存） */
async function checkHealth(force = false) {
  const now = Date.now();
  if (!force && healthy !== null && now - lastHealthCheck < 5000) return healthy;
  lastHealthCheck = now;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 1200);
    const res = await fetch(`${NLP_URL}/health`, { signal: ctl.signal });
    clearTimeout(timer);
    healthy = res.ok;
    return healthy;
  } catch (_) {
    healthy = false;
    return false;
  }
}

/** 自动启动 Python NLP 服务（幂等） */
function ensureStarted() {
  if (startAttempted) return;
  startAttempted = true;
  if (!fs.existsSync(SCRIPT)) return;
  try {
    const python = resolvePython();
    child = spawn(python, [SCRIPT], {
      env: Object.assign({}, process.env, { NLP_PORT: String(NLP_PORT) }),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });
    child.stdout?.on('data', (d) => process.stdout.write(`[nlp] ${d}`));
    child.stderr?.on('data', (d) => process.stderr.write(`[nlp] ${d}`));
    child.on('exit', (code) => {
      healthy = false;
      if (code && code !== 0) process.stderr.write(`[nlp] 服务退出(code=${code})，AI 讲解将降级为无句法参考模式\n`);
      child = null;
    });
    child.on('error', (e) => {
      healthy = false;
      process.stderr.write(`[nlp] 启动失败: ${e.message}，将降级为无句法参考模式\n`);
    });
  } catch (e) {
    process.stderr.write(`[nlp] 无法启动: ${e.message}\n`);
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

/**
 * 调用 NLP 分析句子。返回完整结构或 null（降级）。
 */
async function analyzeSentence(text, timeoutMs = 15000) {
  if (!await checkHealth()) {
    if (!await waitReady(5000)) return null;
  }
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(`${NLP_URL}/analyze-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, preview: true }),
      signal: ctl.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? data : null;
  } catch (_) {
    healthy = false;
    return null;
  }
}

/** 批量分析文章句子 */
async function analyzeText(text, maxSentences = 80, timeoutMs = 30000) {
  if (!await checkHealth()) {
    if (!await waitReady(5000)) return null;
  }
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(`${NLP_URL}/analyze-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, maxSentences }),
      signal: ctl.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? data : null;
  } catch (_) {
    healthy = false;
    return null;
  }
}

/** 关闭 NLP 子进程 */
function shutdown() {
  if (child) {
    try { child.kill(); } catch (_) {}
    child = null;
  }
}

module.exports = {
  NLP_PORT, ensureStarted, waitReady, checkHealth,
  analyzeSentence, analyzeText, shutdown,
  get available() { return healthy === true; }
};
