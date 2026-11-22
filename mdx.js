'use strict';

/**
 * MDX / MDD 词典（基于开源库 js-mdict 7.x，AGPL-3.0）
 *
 * 设计要点：
 *  - 不再「解包导入」：上传后原始 .mdx/.mdd 直接留在 data/mdx/<id>/，查询时按需读取，
 *    导入瞬间完成（无需 entries.bin / index.json / 资源提取）。
 *  - js-mdict 用 fd + 随机读，不整文件载入内存；实例按词典缓存，最多同时开 4 本。
 *  - 资源（CSS/图片）走 MDD，URL 形如 /api/mdx/res/<id>/CollinsEC.css，
 *    词典自带 CSS 里的相对 url() 也能正确落到同一前缀上。
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const MDX_DIR = path.join(DATA_DIR, 'mdx');
const TMP_ROOT = path.join(MDX_DIR, '_tmp');

[MDX_DIR, TMP_ROOT].forEach((d) => fs.mkdirSync(d, { recursive: true }));

/** 清理上次没走完的上传临时目录（超过 1 小时） */
(function cleanTmp() {
  try {
    const now = Date.now();
    fs.readdirSync(TMP_ROOT, { withFileTypes: true }).forEach((d) => {
      if (!d.isDirectory()) return;
      const p = path.join(TMP_ROOT, d.name);
      try {
        if (now - fs.statSync(p).mtimeMs > 3600 * 1000) fs.rmSync(p, { recursive: true, force: true });
      } catch (_) { /* ignore */ }
    });
  } catch (_) { /* ignore */ }
})();

/* ---------------- js-mdict 载入 ---------------- */

let lib = null;
function libOrThrow() {
  if (lib) return lib;
  const m = require('js-mdict'); // eslint-disable-line global-require
  lib = { MDX: m.MDX, MDD: m.MDD };
  return lib;
}

function mdictAvailable() {
  try {
    libOrThrow();
    return true;
  } catch (_) {
    return false;
  }
}

/* ---------------- 实例缓存 ---------------- */

const OPEN = new Map(); // id -> { mdx, mdd, lowerKeys }
const MAX_OPEN = 4;

function closeEntry(entry) {
  if (!entry) return;
  [entry.mdx, entry.mdd].forEach((d) => {
    try { if (d && d.scanner) d.scanner.close(); } catch (_) { /* ignore */ }
  });
}

function touch(id, entry) {
  if (OPEN.has(id)) OPEN.delete(id);
  OPEN.set(id, entry);
  while (OPEN.size > MAX_OPEN) {
    const first = OPEN.entries().next().value;
    if (!first) break;
    OPEN.delete(first[0]);
    closeEntry(first[1]);
  }
}

function evict(id) {
  const entry = OPEN.get(id);
  if (!entry) return;
  OPEN.delete(id);
  closeEntry(entry);
}

/* ---------------- 目录 / 元数据 ---------------- */

function dictId() {
  return Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
}

function newToken() {
  return crypto.randomBytes(8).toString('hex');
}

function tmpDir(token) {
  if (!/^[a-z0-9]+$/i.test(String(token || ''))) throw new Error('无效的上传标识');
  return path.join(TMP_ROOT, token);
}

function readMeta(id) {
  if (!/^[a-z0-9]+$/i.test(String(id || ''))) return null;
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(MDX_DIR, id, 'meta.json'), 'utf8'));
    meta.id = id;
    return meta;
  } catch (_) {
    return null;
  }
}

function listDicts() {
  let names = [];
  try {
    names = fs.readdirSync(MDX_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== '_tmp')
      .map((d) => d.name);
  } catch (_) {
    return [];
  }
  const out = [];
  for (const id of names) {
    const meta = readMeta(id);
    if (!meta) continue;
    if (!fs.existsSync(path.join(MDX_DIR, id, meta.file || 'dict.mdx'))) continue;
    out.push({
      id,
      name: meta.name || '未命名词典',
      title: meta.title || meta.name || '未命名词典',
      description: meta.description || '',
      entries: Number(meta.entries) || 0,
      bytes: Number(meta.bytes) || 0,
      hasMdd: !!meta.hasMdd,
      mddBytes: Number(meta.mddBytes) || 0,
      encoding: meta.encoding || '',
      createdAt: meta.createdAt || ''
    });
  }
  out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return out;
}

/* ---------------- 打开词典 ---------------- */

function openDict(id) {
  if (OPEN.has(id)) {
    const hit = OPEN.get(id);
    touch(id, hit);
    return hit;
  }
  const meta = readMeta(id);
  if (!meta) return null;
  const file = path.join(MDX_DIR, id, meta.file || 'dict.mdx');
  if (!fs.existsSync(file)) return null;

  const { MDX, MDD } = libOrThrow();
  const mdx = new MDX(file, { resort: true, isStripKey: true, isCaseSensitive: false });

  let mdd = null;
  const mddFile = path.join(MDX_DIR, id, meta.mddFile || 'dict.mdd');
  if (meta.hasMdd && fs.existsSync(mddFile)) {
    try {
      mdd = new MDD(mddFile, { resort: true, isStripKey: false, isCaseSensitive: false });
    } catch (e) {
      console.warn('[mdx] MDD 打开失败:', e.message);
    }
  }

  const entry = { id, meta, mdx, mdd, lowerKeys: null };
  touch(id, entry);
  return entry;
}

/** 小写词头 → KeyWordItem（懒建，大小写不敏感兜底查询用） */
function lowerIndex(entry) {
  if (entry.lowerKeys) return entry.lowerKeys;
  const map = new Map();
  const list = entry.mdx.keywordList || [];
  for (let i = 0; i < list.length; i++) {
    const kB = String(list[i].keyText).toLowerCase();
    if (!map.has(kB)) map.set(kB, list[i]);
  }
  entry.lowerKeys = map;
  return map;
}

const BIG_DICT = 400000; // 超过此词条数不建全量小写索引，省内存

/* ---------------- 查询 ---------------- */

const EDGE_JUNK = /^[^0-9A-Za-z\u00C0-\u024F\u4e00-\u9fa5]+|[^0-9A-Za-z\u00C0-\u024F\u4e00-\u9fa5]+$/g;

function cleanTerm(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

/** 去掉标签，用于词典 Description（不少词典这里是整页 HTML 封面） */
function plainText(s) {
  return cleanTerm(String(s == null ? '' : s)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&[a-z#0-9]+;/gi, ' '));
}

/** 英文词形还原（只覆盖常见规则，够句子点词用） */
function morphVariants(word) {
  const w = word.toLowerCase();
  const out = new Set([w]);
  const add = (x) => { if (x && x.length > 1) out.add(x); };
  if (w.endsWith('ies') && w.length > 4) add(`${w.slice(0, -3)}y`);
  if (w.endsWith('ves') && w.length > 4) { add(`${w.slice(0, -3)}f`); add(`${w.slice(0, -3)}fe`); }
  if (w.endsWith('es') && w.length > 3) add(w.slice(0, -2));
  if (w.endsWith('s') && w.length > 2) add(w.slice(0, -1));
  if (w.endsWith('ied') && w.length > 4) add(`${w.slice(0, -3)}y`);
  if (w.endsWith('ed') && w.length > 3) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
    if (/([b-df-hj-np-tv-z])\1ed$/.test(w)) add(w.slice(0, -3));
  }
  if (w.endsWith('ing') && w.length > 4) {
    add(w.slice(0, -3));
    add(`${w.slice(0, -3)}e`);
    if (/([b-df-hj-np-tv-z])\1ing$/.test(w)) add(w.slice(0, -4));
  }
  if (w.endsWith('er') && w.length > 4) { add(w.slice(0, -2)); add(w.slice(0, -1)); }
  if (w.endsWith('est') && w.length > 5) { add(w.slice(0, -3)); add(w.slice(0, -2)); }
  if (w.endsWith('ly') && w.length > 4) add(w.slice(0, -2));
  add(w.replace(/'s$/, ''));
  return [...out];
}

function candidates(raw) {
  const term = cleanTerm(raw).replace(EDGE_JUNK, '');
  if (!term) return [];
  const list = [];
  const push = (x) => { if (x && !list.includes(x)) list.push(x); };
  push(term);
  push(term.toLowerCase());
  if (/^[a-z]/.test(term)) push(term[0].toUpperCase() + term.slice(1).toLowerCase());
  morphVariants(term.toLowerCase()).forEach(push);
  return list;
}

function findInDict(entry, word) {
  const { mdx } = entry;
  try {
    const r = mdx.lookup(word);
    if (r && r.definition) return r;
  } catch (_) { /* ignore */ }
  const total = (mdx.keywordList || []).length;
  if (total && total <= BIG_DICT) {
    const item = lowerIndex(entry).get(word.toLowerCase());
    if (item) {
      try {
        return mdx.fetch(item);
      } catch (_) { /* ignore */ }
    }
  }
  return null;
}

/** 拆出 <head> 里的样式引用，正文单独交给 iframe */
function splitHeadBody(html) {
  let head = '';
  let body = String(html || '');
  const m = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(body);
  if (m) {
    head = m[1];
    body = body.slice(0, m.index) + body.slice(m.index + m[0].length);
  }
  const bodyTag = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(body);
  if (bodyTag) body = bodyTag[1];
  return { head: head.trim(), body: body.trim() };
}

/**
 * 去掉会干扰渲染或引发跳转的内容（脚本 / meta / 嵌入框架 / 事件属性 / js 链接）。
 * 词典 HTML 是第三方不可信输入；前端 iframe 沙箱（mdx 渲染处）永远不要加 allow-scripts。
 */
function sanitize(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<(iframe|object|embed)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed)\b[^>]*>/gi, '')
    .replace(/\shref\s*=\s*("|')sound:\/\/[^"']*\1/gi, '')
    .replace(/\shref\s*=\s*("|')entry:\/\/([^"']*)\1/gi, ' data-entry="$2"')
    .replace(/\shref\s*=\s*("|')\s*javascript\s*:[^"']*\1/gi, '')
    .replace(/\shref\s*=\s*javascript\s*:[^\s>]*/gi, '')
    .replace(/\son\w+\s*=\s*("|')[^"']*\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '');
}

function packHit(entry, hit, term) {
  const { head, body } = splitHeadBody(hit.definition || '');
  return {
    dict: {
      id: entry.id,
      name: entry.meta.name || 'MDX 词典',
      title: entry.meta.title || entry.meta.name || 'MDX 词典'
    },
    key: hit.keyText || term,
    term,
    head: sanitize(head),
    body: sanitize(body)
  };
}

function lookup(raw) {
  const list = candidates(raw);
  if (!list.length) return null;
  for (const d of listDicts()) {
    let entry;
    try {
      entry = openDict(d.id);
    } catch (e) {
      console.warn('[mdx] 打开失败', d.name, e.message);
      continue;
    }
    if (!entry) continue;
    for (const cand of list) {
      const hit = findInDict(entry, cand);
      if (hit) return packHit(entry, hit, cleanTerm(raw));
    }
  }
  return null;
}

function suggest(raw, limit = 8) {
  const list = candidates(raw);
  const term = list[0] || '';
  if (!term) return [];
  const out = [];
  for (const d of listDicts()) {
    let entry;
    try {
      entry = openDict(d.id);
    } catch (_) {
      continue;
    }
    if (!entry) continue;
    try {
      const near = entry.mdx.suggest(term, 2) || [];
      near.slice(0, limit).forEach((it) => {
        const k = String(it.keyText || '');
        if (k && !out.includes(k)) out.push(k);
      });
    } catch (_) { /* ignore */ }
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

/* ---------------- 资源（MDD） ---------------- */

const TEXT_EXT = new Set(['.css', '.js', '.txt', '.html', '.htm', '.xml', '.json', '.csv', '.md']);

function decodeText(buf) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch (_) {
    try {
      return new TextDecoder('gb18030').decode(buf);
    } catch (__) {
      return buf.toString('utf8');
    }
  }
}

function mddIndex(mdd) {
  if (!mdd) return null;
  if (mdd.__lowerIndex) return mdd.__lowerIndex;
  const map = new Map();
  const list = mdd.keywordList || [];
  for (let i = 0; i < list.length; i++) {
    const kB = String(list[i].keyText).replace(/\//g, '\\').toLowerCase();
    if (!map.has(kB)) map.set(kB, list[i]);
  }
  Object.defineProperty(mdd, '__lowerIndex', { value: map, enumerable: false });
  return map;
}

/**
 * 读取词典资源（CSS / 图片 / 字体…）
 * @returns {{buf:Buffer, ext:string, text:boolean, body:string|null}|null}
 */
function readRes(id, rel) {
  const entry = openDict(id);
  if (!entry || !entry.mdd) return null;

  let key = String(rel || '').split('?')[0].split('#')[0];
  try { key = decodeURIComponent(key); } catch (_) { /* 保留原样 */ }
  key = key.replace(/^sound:\/\//i, '').replace(/^\/+/, '');
  if (!key) return null;

  const norm = `\\${key.replace(/\//g, '\\')}`;
  const ext = path.extname(key).toLowerCase();
  let buf = null;

  try {
    const hit = entry.mdd.locate(norm);
    if (hit && hit.definition) buf = Buffer.from(hit.definition, 'base64');
  } catch (_) { /* ignore */ }

  if (!buf) {
    // 大小写/斜杠不一致时按小写索引兜底（词典资源常见 CollinsEC.css vs collinse.css）
    const idx = mddIndex(entry.mdd);
    const item = idx && idx.get(norm.toLowerCase());
    if (item) {
      try {
        const raw = entry.mdd.lookupRecordByKeyBlock(item);
        if (raw && raw.length) buf = Buffer.from(raw);
      } catch (_) { /* ignore */ }
    }
  }
  if (!buf) return null;

  const text = TEXT_EXT.has(ext);
  return { buf, ext, text, body: text ? decodeText(buf) : null };
}

/* ---------------- 导入 / 删除 ---------------- */

function rmrf(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) { /* ignore */ }
}

/** 把已上传到临时目录的文件落成一本词典（即写即用，无二次解包） */
function finishImport({ token, name } = {}) {
  const dir = tmpDir(token);
  if (!fs.existsSync(dir)) throw new Error('上传内容已失效，请重新选择文件');

  const files = fs.readdirSync(dir);
  const mdxName = files.find((f) => /\.mdx$/i.test(f));
  const mddName = files.find((f) => /\.mdd$/i.test(f));
  if (!mdxName) throw new Error('没有找到 .mdx 文件');

  const id = dictId();
  const dest = path.join(MDX_DIR, id);
  fs.mkdirSync(dest, { recursive: true });
  const mdxDest = path.join(dest, 'dict.mdx');
  fs.renameSync(path.join(dir, mdxName), mdxDest);

  let hasMdd = false;
  let mddBytes = 0;
  if (mddName) {
    const mddDest = path.join(dest, 'dict.mdd');
    fs.renameSync(path.join(dir, mddName), mddDest);
    hasMdd = true;
    try { mddBytes = fs.statSync(mddDest).size; } catch (_) { /* ignore */ }
  }
  rmrf(dir);

  // 打开一次：验证文件可读，同时取头信息（Title/Description 多半是中文）
  const { MDX, MDD } = libOrThrow();
  let mdx;
  try {
    mdx = new MDX(mdxDest, { resort: true, isStripKey: true, isCaseSensitive: false });
  } catch (e) {
    rmrf(dest);
    throw new Error(`词典解析失败：${e.message}`);
  }

  const h = mdx.header || {};
  const fallback = mdxName.replace(/\.mdx$/i, '');
  const title = plainText(h.Title).slice(0, 120);
  const name0 = (cleanTerm(name) || title || fallback).slice(0, 80);

  const meta = {
    id,
    name: name0,
    title: title || name0,
    description: plainText(h.Description).slice(0, 200),
    encoding: (mdx.meta && mdx.meta.encoding) || h.Encoding || '',
    version: (mdx.meta && mdx.meta.version) || 0,
    entries: (mdx.keywordList || []).length,
    bytes: (() => { try { return fs.statSync(mdxDest).size; } catch (_) { return 0; } })(),
    hasMdd,
    mddBytes,
    file: 'dict.mdx',
    mddFile: hasMdd ? 'dict.mdd' : '',
    sourceFile: mdxName,
    createdAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(dest, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');

  let mdd = null;
  if (hasMdd) {
    try {
      mdd = new MDD(path.join(dest, 'dict.mdd'), { resort: true, isStripKey: false, isCaseSensitive: false });
    } catch (e) {
      console.warn('[mdx] MDD 打开失败:', e.message);
    }
  }
  evict(id);
  touch(id, { id, meta, mdx, mdd, lowerKeys: null });
  return Object.assign({}, meta, { id });
}

function removeDict(id) {
  if (!/^[a-z0-9]+$/i.test(String(id || ''))) return false;
  const dir = path.join(MDX_DIR, id);
  if (!fs.existsSync(dir)) return false;
  evict(id);
  rmrf(dir);
  return true;
}

/** 把请求流写到磁盘（大文件边收边写） */
function saveStream(req, dest, limit = 1024 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(dest);
    let size = 0;
    let done = false;
    const fail = (err) => {
      if (done) return;
      done = true;
      out.destroy();
      rmrf(dest);
      reject(err);
    };
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        fail(new Error('文件过大（上限 1GB）'));
        try { req.destroy(); } catch (_) { /* ignore */ }
      }
    });
    req.on('error', fail);
    out.on('error', fail);
    out.on('finish', () => {
      if (done) return;
      done = true;
      resolve(size);
    });
    req.pipe(out);
  });
}

module.exports = {
  MDX_DIR,
  mdictAvailable,
  listDicts,
  lookup,
  suggest,
  readRes,
  newToken,
  tmpDir,
  saveStream,
  finishImport,
  removeDict
};
