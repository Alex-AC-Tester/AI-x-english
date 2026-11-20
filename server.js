'use strict';

/**
 * WordWise AI - 零依赖 Node 服务端
 * 1) 静态托管 PWA
 * 2) AI 请求代理（支持服务端默认 Key / 客户端自带 Key）
 * 3) 学习数据落盘（JSON + 自动快照备份）
 * 4) 图片上传落盘
 * 5) Web Push 订阅与每日定时提醒（VAPID 自签发）
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { URL } = require('url');
const nlp = require('./nlp-client');
const dict = require('./dict');
const mdx = require('./mdx');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const CONFIG_FILE = path.join(ROOT, 'config.json');
const VAPID_FILE = path.join(DATA_DIR, 'vapid.json');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');

[DATA_DIR, UPLOAD_DIR, BACKUP_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4'
};

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJsonAtomic(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

let config = readJson(CONFIG_FILE, {});
const DEFAULT_CONFIG = {
  port: 8787,
  apiBase: 'https://developer.amd.com.cn/radeon/api/v1',
  apiKey: '',
  textModel: 'DeepSeek-V4.1-Flash',
  visionModel: 'MiniCPM-V-4.7-1B',
  gradingModel: 'DeepSeek-V4.1-Flash',
  dailyQuestionCount: 10,
  reminderTime: '20:00'
};
config = Object.assign({}, DEFAULT_CONFIG, config);

// 监听参数：默认 0.0.0.0，局域网内其它设备可直接访问
const PORT = Number(process.env.PORT || config.port || 8787);
const HOST = String(process.env.HOST || config.host || '0.0.0.0');
const LAN_ENABLED = HOST === '0.0.0.0' || HOST === '::' || HOST === '';

/* ---------------- 局域网地址探测 ---------------- */

// 常见虚拟网卡（VMware / Hyper-V / Docker / WSL / VPN），排序时靠后
const VIRTUAL_IFACE = /(vmware|vmnet|virtualbox|vbox|hyper-?v|vethernet|loopback|docker|wsl|tailscale|zerotier|wireguard|tap|tun|ppp|bluetooth)/i;

function isPrivateIp(ip) {
  return /^10\./.test(ip)
    || /^192\.168\./.test(ip)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
}

function lanAddresses() {
  const out = [];
  let ifaces = {};
  try { ifaces = os.networkInterfaces() || {}; } catch (_) { return out; }
  Object.keys(ifaces).forEach((name) => {
    (ifaces[name] || []).forEach((n) => {
      const family = n.family;
      if (family !== 'IPv4' && family !== 4) return;      // IPv6 暂不列出，避免地址过长
      if (n.internal) return;
      const ip = String(n.address || '');
      if (!ip || /^169\.254\./.test(ip)) return;           // 链路本地地址无意义
      out.push({
        name,
        ip,
        url: `http://${ip}:${PORT}`,
        private: isPrivateIp(ip),
        virtual: VIRTUAL_IFACE.test(name)
      });
    });
  });
  out.sort((a, b) => (Number(a.virtual) - Number(b.virtual))
    || (Number(b.private) - Number(a.private))
    || a.ip.localeCompare(b.ip, 'en'));
  return out;
}

function primaryLanUrl() {
  const list = lanAddresses();
  const hit = list.find((a) => !a.virtual && a.private) || list.find((a) => !a.virtual) || list[0];
  return hit ? hit.url : null;
}

function emptyStore() {
  return { version: 1, words: [], quizzes: [], attempts: [], activity: [], settings: {}, updatedAt: null };
}

function loadStore() {
  const s = readJson(STORE_FILE, null);
  if (!s || typeof s !== 'object') return emptyStore();
  return Object.assign(emptyStore(), s);
}

function saveStore(store) {
  if (fs.existsSync(STORE_FILE)) {
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(STORE_FILE, path.join(BACKUP_DIR, `store-${stamp}.json`));
      const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith('store-')).sort();
      while (files.length > 20) fs.unlinkSync(path.join(BACKUP_DIR, files.shift()));
    } catch (_) { /* 备份失败不阻断写入 */ }
  }
  store.updatedAt = new Date().toISOString();
  writeJsonAtomic(STORE_FILE, store);
}

function send(res, status, data, extraHeaders = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, Object.assign({
    'Content-Type': typeof data === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  }, extraHeaders));
  res.end(body);
}

function readBody(req, limit = 16 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('请求体过大')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJsonBody(req, limit) {
  const buf = await readBody(req, limit);
  if (!buf.length) return {};
  try { return JSON.parse(buf.toString('utf8')); }
  catch (_) { throw new Error('JSON 解析失败'); }
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '/index.html') rel = '/index.html';
  const target = path.resolve(PUBLIC_DIR, `.${rel}`);
  if (!target.startsWith(PUBLIC_DIR)) { send(res, 403, 'Forbidden'); return; }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    // SPA 回退
    const fallback = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(fallback) && !path.extname(rel)) {
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
      fs.createReadStream(fallback).pipe(res);
      return;
    }
    send(res, 404, 'Not found');
    return;
  }
  const ext = path.extname(target).toLowerCase();
  // 代码类资源必须每次校验，否则改了代码用户拿不到新版；静态资源可长缓存
  const isCode = ['.js', '.mjs', '.css', '.html', '.webmanifest'].includes(ext);
  const cache = target.endsWith('sw.js') || isCode ? 'no-cache' : 'public, max-age=300';
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache });
  fs.createReadStream(target).pipe(res);
}

/* ---------------- AI 代理 ---------------- */

let modelsCache = { at: 0, data: null };

async function callUpstream(apiBase, apiKey, body, timeoutMs = 120000) {
  const url = `${String(apiBase || '').replace(/\/$/, '')}/chat/completions`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    const text = await r.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = { raw: text }; }
    if (!r.ok) return { ok: false, status: r.status, error: parsed };
    return { ok: true, data: parsed };
  } catch (e) {
    return { ok: false, status: 502, error: { message: e.message } };
  } finally {
    clearTimeout(timer);
  }
}

async function handleAI(req, res) {
  const body = await readJsonBody(req);
  const apiKey = (req.headers['x-api-key'] || process.env.WORDWISE_API_KEY || config.apiKey || '').toString();
  const apiBase = (req.headers['x-api-base'] || config.apiBase || '').toString();
  if (!apiKey) { send(res, 400, { error: '未配置 API Key，请在设置中填写' }); return; }
  if (!body.messages || !Array.isArray(body.messages)) { send(res, 400, { error: 'messages 格式不正确' }); return; }
  const payload = {
    model: body.model || config.textModel,
    messages: body.messages,
    temperature: typeof body.temperature === 'number' ? body.temperature : 0.2,
    max_tokens: body.max_tokens || 2048
  };
  if (body.response_format && body.response_format.type) payload.response_format = body.response_format;
  const result = await callUpstream(apiBase, apiKey, payload);
  send(res, result.ok ? 200 : result.status || 502, result.ok ? result.data : { error: result.error });
}

async function handleModels(req, res) {
  const apiKey = (req.headers['x-api-key'] || process.env.WORDWISE_API_KEY || config.apiKey || '').toString();
  const apiBase = (req.headers['x-api-base'] || config.apiBase || '').toString();
  if (Date.now() - modelsCache.at < 10 * 60 * 1000 && modelsCache.data && !req.headers['x-api-key']) {
    send(res, 200, modelsCache.data); return;
  }
  try {
    const r = await fetch(`${String(apiBase).replace(/\/$/, '')}/models`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }, signal: AbortSignal.timeout(20000)
    });
    const data = await r.json();
    if (r.ok) modelsCache = { at: Date.now(), data };
    send(res, r.ok ? 200 : 502, data);
  } catch (e) {
    send(res, 502, { error: { message: e.message } });
  }
}

/* ---------------- Web Push（VAPID 自签发） ---------------- */

function ensureVapid() {
  let v = readJson(VAPID_FILE, null);
  if (v && v.privateKeyPem && v.publicKey && v.publicKey.x) return v;
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  v = {
    publicKey: publicKey.export({ format: 'jwk' }),
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' })
  };
  writeJsonAtomic(VAPID_FILE, v);
  return v;
}

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function derSignatureToRaw(sig) {
  let i = 0;
  const readLen = () => {
    let len = sig[i++];
    if (len & 0x80) {
      const n = len & 0x7f;
      len = 0;
      for (let j = 0; j < n; j++) len = (len << 8) | sig[i++];
    }
    return len;
  };
  if (sig[i++] !== 0x30) throw new Error('invalid signature');
  readLen();
  const readInt = () => {
    if (sig[i++] !== 0x02) throw new Error('invalid signature integer');
    let len = readLen();
    let v = sig.subarray(i, i + len);
    i += len;
    while (v.length > 1 && v[0] === 0) v = v.subarray(1);
    if (v.length < 32) v = Buffer.concat([Buffer.alloc(32 - v.length), v]);
    return v.subarray(0, 32);
  };
  return Buffer.concat([readInt(), readInt()]);
}

function vapidAuthorization(endpoint) {
  const vapid = ensureVapid();
  const aud = new URL(endpoint).origin;
  const header = b64url(JSON.stringify({ alg: 'ES256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    aud,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: 'mailto:wordwise@local.app'
  }));
  const unsigned = `${header}.${payload}`;
  const der = crypto.createSign('SHA256').update(unsigned).sign(vapid.privateKeyPem);
  const jwt = `${unsigned}.${b64url(derSignatureToRaw(der))}`;
  const x = Buffer.from(vapid.publicKey.x, 'base64url');
  const y = Buffer.from(vapid.publicKey.y, 'base64url');
  const key = b64url(Buffer.concat([Buffer.from([0x04]), x, y]));
  return `vapid t=${jwt}, k=${key}`;
}

function loadSubs() { return readJson(SUBS_FILE, []); }
function saveSubs(subs) { writeJsonAtomic(SUBS_FILE, subs); }

async function sendPush(sub) {
  try {
    const r = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': vapidAuthorization(sub.endpoint),
        'TTL': '86400',
        'Urgency': 'high'
      },
      body: '',
      signal: AbortSignal.timeout(15000)
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function localHM(offsetMinutes) {
  const d = new Date(Date.now() + (offsetMinutes || 0) * 60000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}
function localDateKey(offsetMinutes) {
  const d = new Date(Date.now() + (offsetMinutes || 0) * 60000);
  return d.toISOString().slice(0, 10);
}

let schedulerRunning = false;
function startReminderScheduler() {
  if (schedulerRunning) return;
  schedulerRunning = true;
  setInterval(async () => {
    const subs = loadSubs();
    if (!subs.length) return;
    let changed = false;
    for (const sub of subs) {
      const s = sub.settings || {};
      if (!s.enabled) continue;
      const nowHM = localHM(s.offsetMinutes || 0);
      const today = localDateKey(s.offsetMinutes || 0);
      if (nowHM !== (s.time || '20:00')) continue;
      if (sub.lastSentDate === today) continue;
      const r = await sendPush(sub);
      if (r.ok || r.status === 201 || String(r.error || '').includes('410')) {
        sub.lastSentDate = today;
        changed = true;
      }
    }
    if (changed) saveSubs(subs);
  }, 30000);
}

/* ---------------- 路由 ---------------- */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  try {
    if (req.method === 'GET' && p === '/api/health') {
      send(res, 200, { ok: true, time: new Date().toISOString(), dataFile: fs.existsSync(STORE_FILE), nlp: nlp.available });
      return;
    }

    // 局域网访问信息：地址、端口、是否已对内网开放
    if (req.method === 'GET' && p === '/api/net') {
      const addresses = LAN_ENABLED ? lanAddresses() : [];
      send(res, 200, {
        ok: true,
        port: PORT,
        host: HOST,
        lan: LAN_ENABLED,
        hostname: os.hostname(),
        localUrl: `http://localhost:${PORT}`,
        primary: LAN_ENABLED ? primaryLanUrl() : null,
        addresses
      });
      return;
    }

    // 内置词典（ECDICT，本地离线查询）
    if (req.method === 'GET' && p === '/api/dict/status') {
      send(res, 200, { ok: dict.available(), meta: dict.meta() });
      return;
    }
    if (req.method === 'GET' && p === '/api/dict') {
      const q = String(url.searchParams.get('q') || '').slice(0, 80);
      const found = dict.lookup(q);
      if (!found) { send(res, 200, { ok: false, term: q, suggestions: dict.suggest(q) }); return; }
      send(res, 200, Object.assign({ ok: true }, found));
      return;
    }

    /* ---------- MDX / MDD 词典（用户导入） ---------- */
    if (req.method === 'GET' && p === '/api/mdx/status') {
      send(res, 200, { ok: true, dicts: mdx.listDicts(), available: mdx.mdictAvailable() });
      return;
    }
    if (req.method === 'GET' && p === '/api/mdx/lookup') {
      const q = String(url.searchParams.get('q') || '').slice(0, 80);
      const hit = mdx.lookup(q);
      if (!hit) { send(res, 200, { ok: false, term: q, suggestions: mdx.suggest(q) }); return; }
      send(res, 200, Object.assign({ ok: true }, hit));
      return;
    }
    if (req.method === 'GET' && p === '/api/mdx/suggest') {
      send(res, 200, { ok: true, list: mdx.suggest(String(url.searchParams.get('q') || '').slice(0, 40)) });
      return;
    }
    if (req.method === 'POST' && p === '/api/mdx/upload') {
      const kind = String(url.searchParams.get('kind') || 'mdx').toLowerCase();
      if (kind !== 'mdx' && kind !== 'mdd') { send(res, 400, { error: '只支持 .mdx / .mdd 文件' }); return; }
      let token = String(url.searchParams.get('token') || '');
      if (!/^[a-z0-9]+$/i.test(token)) token = mdx.newToken();
      let name = path.basename(String(url.searchParams.get('name') || '').trim()) || `dict.${kind}`;
      name = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 180);
      if (!new RegExp(`\\.${kind}$`, 'i').test(name)) name = `${name}.${kind}`;

      const dir = mdx.tmpDir(token);
      fs.mkdirSync(dir, { recursive: true });
      try {
        const size = await mdx.saveStream(req, path.join(dir, name));
        send(res, 200, { ok: true, token, name, size });
      } catch (e) {
        send(res, 400, { ok: false, error: e.message });
      }
      return;
    }
    if (req.method === 'POST' && p === '/api/mdx/import') {
      const body = await readJsonBody(req, 1024 * 1024);
      const token = String(body.token || '');
      const name = String(body.name || '').slice(0, 120);
      try {
        const meta = mdx.finishImport({ token, name });
        send(res, 200, { ok: true, meta });
      } catch (e) {
        send(res, 400, { ok: false, error: e.message });
      }
      return;
    }
    if (req.method === 'POST' && p === '/api/mdx/delete') {
      const body = await readJsonBody(req, 64 * 1024);
      const ok = mdx.removeDict(body.id);
      send(res, 200, { ok });
      return;
    }
    if (req.method === 'GET' && p.startsWith('/api/mdx/res/')) {
      const rest = p.slice('/api/mdx/res/'.length);
      const slash = rest.indexOf('/');
      const id = slash < 0 ? rest : rest.slice(0, slash);
      const rel = slash < 0 ? '' : rest.slice(slash + 1);
      let hit = null;
      try {
        hit = mdx.readRes(id, rel);
      } catch (e) {
        console.warn('[mdx] 资源读取失败', rel, e.message);
      }
      if (!hit) { send(res, 404, 'Not found'); return; }
      const ext = hit.ext;
      const type = hit.text
        ? `${(MIME[ext] || 'text/plain').split(';')[0]}; charset=utf-8`
        : (MIME[ext] || 'application/octet-stream');
      res.writeHead(200, {
        'Content-Type': type,
        'Content-Length': hit.buf.length,
        'Cache-Control': 'public, max-age=604800'
      });
      res.end(hit.text ? Buffer.from(hit.body, 'utf8') : hit.buf);
      return;
    }
    if (req.method === 'GET' && p === '/api/mdx/res/') { send(res, 404, 'Not found'); return; }


    // 本地 NLP 句法分析（自动拉起 Python 服务，失败则降级）
    if (req.method === 'GET' && p === '/api/nlp/status') {
      const ok = await nlp.checkHealth(true);
      send(res, 200, { ok, available: ok });
      return;
    }
    if (req.method === 'POST' && p === '/api/nlp/analyze-sentence') {
      const body = await readJsonBody(req, 2 * 1024 * 1024);
      const text = String(body.text || '').slice(0, 8000);
      if (!text.trim()) { send(res, 400, { ok: false, error: '缺少 text' }); return; }
      const result = await nlp.analyzeSentence(text);
      if (!result) { send(res, 503, { ok: false, error: '本地 NLP 服务不可用' }); return; }
      send(res, 200, result);
      return;
    }
    if (req.method === 'POST' && p === '/api/nlp/analyze-text') {
      const body = await readJsonBody(req, 6 * 1024 * 1024);
      const text = String(body.text || '').slice(0, 30000);
      if (!text.trim()) { send(res, 400, { ok: false, error: '缺少 text' }); return; }
      const result = await nlp.analyzeText(text, body.maxSentences || 80);
      if (!result) { send(res, 503, { ok: false, error: '本地 NLP 服务不可用' }); return; }
      send(res, 200, result);
      return;
    }

    if (req.method === 'GET' && p === '/api/config') {
      send(res, 200, {
        apiBase: config.apiBase,
        hasServerKey: !!config.apiKey,
        textModel: config.textModel,
        visionModel: config.visionModel,
        gradingModel: config.gradingModel,
        dailyQuestionCount: config.dailyQuestionCount,
        reminderTime: config.reminderTime
      });
      return;
    }

    if (req.method === 'POST' && p === '/api/config') {
      const body = await readJsonBody(req);
      const allowed = ['apiBase', 'apiKey', 'textModel', 'visionModel', 'gradingModel', 'dailyQuestionCount', 'reminderTime'];
      allowed.forEach((k) => { if (body[k] !== undefined) config[k] = body[k]; });
      writeJsonAtomic(CONFIG_FILE, config);
      modelsCache = { at: 0, data: null };
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && p === '/api/models') { await handleModels(req, res); return; }
    if (req.method === 'POST' && p === '/api/ai') { await handleAI(req, res); return; }

    if (req.method === 'GET' && p === '/api/data') { send(res, 200, loadStore()); return; }
    if (req.method === 'POST' && p === '/api/data') {
      const body = await readJsonBody(req, 32 * 1024 * 1024);
      if (!body || !Array.isArray(body.words)) { send(res, 400, { error: '数据格式不正确' }); return; }
      saveStore(body);
      send(res, 200, { ok: true, updatedAt: loadStore().updatedAt });
      return;
    }

    if (req.method === 'POST' && p === '/api/upload') {
      const body = await readJsonBody(req, 20 * 1024 * 1024);
      const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(body.dataUrl || '');
      if (!m) { send(res, 400, { error: '图片格式不正确' }); return; }
      const buf = Buffer.from(m[2], 'base64');
      if (!buf.length || buf.length > 15 * 1024 * 1024) { send(res, 400, { error: '图片过大或为空' }); return; }
      const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
      const ext = extMap[m[1].toLowerCase()] || '.jpg';
      const id = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, `${id}${ext}`), buf);
      send(res, 200, { ok: true, id, url: `/api/image/${id}${ext}`, size: buf.length });
      return;
    }

    if (req.method === 'GET' && p.startsWith('/api/image/')) {
      const name = path.basename(p);
      const target = path.join(UPLOAD_DIR, name);
      if (!fs.existsSync(target)) { send(res, 404, 'Not found'); return; }
      const ext = path.extname(name).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(target).pipe(res);
      return;
    }

    if (req.method === 'GET' && p === '/api/vapid-public') {
      const vapid = ensureVapid();
      const x = Buffer.from(vapid.publicKey.x, 'base64url');
      const y = Buffer.from(vapid.publicKey.y, 'base64url');
      send(res, 200, { key: b64url(Buffer.concat([Buffer.from([0x04]), x, y])) });
      return;
    }

    if (req.method === 'POST' && p === '/api/subscribe') {
      const body = await readJsonBody(req);
      if (!body.subscription || !body.subscription.endpoint) { send(res, 400, { error: '订阅信息不完整' }); return; }
      const subs = loadSubs();
      const idx = subs.findIndex((s) => s.endpoint === body.subscription.endpoint);
      const entry = { endpoint: body.subscription.endpoint, keys: body.subscription.keys || {}, settings: body.settings || {}, updatedAt: new Date().toISOString() };
      if (idx >= 0) { entry.lastSentDate = subs[idx].lastSentDate; subs[idx] = entry; }
      else subs.push(entry);
      saveSubs(subs);
      send(res, 200, { ok: true, count: subs.length });
      return;
    }

    if (req.method === 'DELETE' && p === '/api/subscribe') {
      const body = await readJsonBody(req);
      saveSubs(loadSubs().filter((s) => s.endpoint !== body.endpoint));
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && p === '/api/push-test') {
      const subs = loadSubs();
      const results = await Promise.all(subs.map(async (s) => ({ endpoint: s.endpoint.slice(0, 50), ...(await sendPush(s)) })));
      send(res, 200, { ok: true, results });
      return;
    }

    if (req.method === 'GET' && (p.startsWith('/api/'))) { send(res, 404, { error: 'Not found' }); return; }

    if (req.method === 'GET' || req.method === 'HEAD') { serveStatic(req, res, p); return; }
    send(res, 405, 'Method not allowed');
  } catch (e) {
    console.error('[server]', e);
    if (!res.headersSent) send(res, 500, { error: e.message || '服务器错误' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`WordWise AI 已启动: http://localhost:${PORT}`);
  if (LAN_ENABLED) {
    const lan = primaryLanUrl();
    if (lan) {
      console.log(`局域网访问: ${lan}  （手机/平板连同一 Wi-Fi 即可打开）`);
      const others = lanAddresses().filter((a) => a.url !== lan && !a.virtual);
      if (others.length) console.log(`其它网卡: ${others.map((a) => a.url).join('  ')}`);
    } else {
      console.log('局域网访问: 未检测到可用的内网地址（可能未连接 Wi-Fi / 网线）');
    }
    console.log('提示: 其它设备打不开请先双击 lan-firewall.bat 放行端口');
  } else {
    console.log(`仅本机访问（HOST=${HOST}），如需局域网访问请把 config.json 的 host 改成 0.0.0.0`);
  }
  console.log(`数据文件: ${STORE_FILE}`);
  console.log(`AI 网关: ${config.apiBase}`);
  console.log(mdx.mdictAvailable()
    ? `MDX 词典: js-mdict 就绪（已导入 ${mdx.listDicts().length} 本）`
    : 'MDX 词典: 未安装 js-mdict，请在项目目录执行 npm install');
  startReminderScheduler();
  // 本地 NLP 服务：延迟启动，避免阻塞主服务；失败会自动降级
  setTimeout(() => {
    nlp.ensureStarted();
    nlp.waitReady(20000).then((ok) => {
      console.log(ok ? '本地 NLP 句法服务: 就绪（句法参考已启用）' : '本地 NLP 句法服务: 不可用（AI 讲解降级为纯 LLM 模式）');
    });
  }, 300);
});

// 优雅关闭时一并关闭 NLP 子进程
['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => { nlp.shutdown(); server.close(() => process.exit(0)); });
});
