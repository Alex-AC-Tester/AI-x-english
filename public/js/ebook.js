// 电子书导入：PDF / DOCX / EPUB / TXT / MD / HTML / RTF → 纯文本正文
// 全部在浏览器端解析，APK 内没有服务端也能用。

const VENDOR = new URL('../vendor/', import.meta.url);

let pdfjsPromise = null;
let mammothPromise = null;
let jszipPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`依赖加载失败：${src.split('/').pop()}`));
    document.head.appendChild(s);
  });
}

async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const lib = await import(new URL('pdfjs/pdf.min.mjs', VENDOR).href);
      lib.GlobalWorkerOptions.workerSrc = new URL('pdfjs/pdf.worker.min.mjs', VENDOR).href;
      return lib;
    })().catch((e) => { pdfjsPromise = null; throw e; });
  }
  return pdfjsPromise;
}

async function getMammoth() {
  if (!mammothPromise) {
    mammothPromise = (async () => {
      if (!window.mammoth) await loadScript(new URL('mammoth.min.js', VENDOR).href);
      if (!window.mammoth) throw new Error('mammoth 未就绪');
      return window.mammoth;
    })().catch((e) => { mammothPromise = null; throw e; });
  }
  return mammothPromise;
}

async function getJSZip() {
  if (!jszipPromise) {
    jszipPromise = (async () => {
      if (!window.JSZip) await loadScript(new URL('jszip.min.js', VENDOR).href);
      if (!window.JSZip) throw new Error('JSZip 未就绪');
      return window.JSZip;
    })().catch((e) => { jszipPromise = null; throw e; });
  }
  return jszipPromise;
}

/* ============================================================
   文本工具
   ============================================================ */

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

function isCJK(ch) { return !!ch && CJK.test(ch); }

/** 合并两行：处理连字符断词与中英文空格 */
function joinLine(a, b) {
  const left = String(a || '').replace(/\s+$/, '');
  const right = String(b || '').replace(/^\s+/, '');
  if (!left) return right;
  if (!right) return left;
  // 行尾连字符断词：exam- / ple → example
  if (/[\u2010-\u2015-]$/.test(left) && /^[a-z\u00e0-\u00ff]/i.test(right)) {
    return left.replace(/[\u2010-\u2015-]$/, '') + right;
  }
  const lastCh = left[left.length - 1];
  const firstCh = right[0];
  if (isCJK(lastCh) || isCJK(firstCh)) return left + right;
  return `${left} ${right}`;
}

/** 清洗：去软连字符、折叠多余空白、统一换行 */
function normalizeText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00ad/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripTags(html) {
  return String(html || '')
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|td|th|section|article|blockquote)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function decodeEntities(s) { return stripTags(s); }

/* ============================================================
   PDF：按坐标重建行，再按行距切段落
   ============================================================ */

/** 把一页的 textContent.items 还原成行 */
function itemsToRows(items) {
  const rows = [];
  let cur = null;
  for (const it of items) {
    if (!it || typeof it.str !== 'string') continue;
    const tr = it.transform || [1, 0, 0, 1, 0, 0];
    const y = Math.round(tr[5] * 10) / 10;
    const x = tr[4];
    const h = Math.abs(tr[3]) || it.height || 10;
    if (!cur || Math.abs(cur.y - y) > Math.max(2, h * 0.5)) {
      cur = { y, h, parts: [] };
      rows.push(cur);
    }
    if (it.str) cur.parts.push({ x, str: it.str, w: it.width || 0 });
    cur.h = Math.max(cur.h, h);
  }

  return rows
    .filter((r) => r.parts.length)
    .map((r) => {
      r.parts.sort((a, b) => a.x - b.x);
      let text = '';
      let prevEnd = null;
      for (const p of r.parts) {
        if (prevEnd !== null && p.x - prevEnd > 1.5 && !/\s$/.test(text) && !/^\s/.test(p.str)) {
          text += ' ';
        }
        text += p.str;
        prevEnd = p.x + p.w;
      }
      return { y: r.y, h: r.h, text: text.replace(/\s+/g, ' ').trim() };
    })
    .filter((r) => r.text);
}

/** 去掉页眉页脚：跨页重复的首末行、纯页码行 */
function dropFurniture(pages) {
  if (pages.length < 3) {
    return pages.map((rows) => rows.filter((r) => !/^[\s\-–—]*\d{1,4}[\s\-–—]*$/.test(r.text)));
  }
  const counts = new Map();
  for (const rows of pages) {
    const edge = new Set();
    rows.slice(0, 2).forEach((r) => edge.add(r.text));
    rows.slice(-2).forEach((r) => edge.add(r.text));
    edge.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
  }
  const threshold = Math.max(2, Math.floor(pages.length * 0.4));
  const repeated = new Set([...counts.entries()].filter(([, n]) => n >= threshold).map(([t]) => t));

  return pages.map((rows) => rows.filter((r) => {
    if (/^[\s\-–—]*\d{1,4}[\s\-–—]*$/.test(r.text)) return false;
    return !repeated.has(r.text);
  }));
}

/** 一页的行 → 段落数组 */
function rowsToParagraphs(rows) {
  if (!rows.length) return [];
  // 取出现最多的字号作为正文字号（正文行数远多于标题，比中位数更稳）
  const freq = new Map();
  for (const r of rows) {
    const k = Math.round(r.h * 2) / 2;
    freq.set(k, (freq.get(k) || 0) + 1);
  }
  let bodyH = 10, best = 0;
  for (const [h, n] of freq) if (n > best || (n === best && h < bodyH)) { best = n; bodyH = h; }
  const paraGap = bodyH * 1.7;

  const out = [];
  let buf = '';
  let prevY = null;
  let prevH = null;
  for (const r of rows) {
    if (prevY !== null) {
      const gap = prevY - r.y;
      // 行距明显变大，或字号变化超过 15%（标题/正文切换），都切段
      const sizeShift = prevH ? Math.abs(r.h - prevH) / Math.max(r.h, prevH) > 0.15 : false;
      if (gap > paraGap || sizeShift) {
        if (buf) out.push(buf);
        buf = r.text;
        prevY = r.y;
        prevH = r.h;
        continue;
      }
    }
    buf = buf ? joinLine(buf, r.text) : r.text;
    prevY = r.y;
    prevH = r.h;
  }
  if (buf) out.push(buf);
  return out;
}

async function parsePdf(file, { onProgress } = {}) {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({
    data,
    cMapUrl: new URL('pdfjs/cmaps/', VENDOR).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('pdfjs/standard_fonts/', VENDOR).href
  });
  const doc = await task.promise;
  const numPages = doc.numPages;

  const pages = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(itemsToRows(content.items));
    onProgress?.(i, numPages);
    page.cleanup();
  }

  let title = '';
  try {
    const meta = await doc.getMetadata();
    title = String(meta?.info?.Title || '').trim();
  } catch (_) { /* 无元数据 */ }

  const cleaned = dropFurniture(pages);
  const paragraphs = [];
  for (const rows of cleaned) paragraphs.push(...rowsToParagraphs(rows));

  const text = normalizeText(paragraphs.join('\n\n'));
  const totalChars = text.replace(/\s/g, '').length;
  const perPage = numPages ? totalChars / numPages : 0;

  // pdfjs 6.x：销毁入口在 loading task 上，不在 document 上
  try { await task.destroy(); } catch (_) { /* 已释放 */ }

  return {
    title,
    text,
    format: 'pdf',
    pages: numPages,
    // 每页不足 80 个有效字符，基本可以判定是扫描件
    needsOcr: perPage < 80,
    charsPerPage: Math.round(perPage)
  };
}

/** 扫描版 PDF 兜底：把页面渲染成图片，交给现有 OCR 链路 */
export async function renderPdfToImages(file, { maxPages = 12, scale = 2 } = {}) {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });
  const doc = await task.promise;
  const totalPages = doc.numPages;
  const total = Math.min(totalPages, maxPages);
  const images = [];

  for (let i = 1; i <= total; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push({ dataUrl: canvas.toDataURL('image/jpeg', 0.85), name: `第${i}页` });
    page.cleanup();
  }

  try { await task.destroy(); } catch (_) { /* 已释放 */ }
  return { images, totalPages, rendered: total };
}

/* ============================================================
   DOCX / EPUB / 纯文本
   ============================================================ */

async function parseDocx(file) {
  const mammoth = await getMammoth();
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const warnings = (result.messages || [])
    .filter((m) => m.type === 'warning')
    .slice(0, 5)
    .map((m) => m.message);
  return {
    title: '',
    text: normalizeText(result.value),
    format: 'docx',
    warnings
  };
}

async function parseEpub(file) {
  const JSZip = await getJSZip();
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  // 1) 找 OPF
  let opfPath = '';
  const container = zip.file('META-INF/container.xml');
  if (container) {
    const xml = await container.async('string');
    const m = /full-path="([^"]+)"/i.exec(xml);
    if (m) opfPath = m[1];
  }

  let title = '';
  let order = [];

  if (opfPath && zip.file(opfPath)) {
    const opf = await zip.file(opfPath).async('string');
    const t = /<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i.exec(opf);
    if (t) title = decodeEntities(t[1]).trim();

    // manifest: id -> href
    const manifest = new Map();
    const itemRe = /<item\b([^>]*)\/?>/gi;
    let im;
    while ((im = itemRe.exec(opf))) {
      const attrs = im[1];
      const id = /\bid="([^"]*)"/i.exec(attrs)?.[1];
      const href = /\bhref="([^"]*)"/i.exec(attrs)?.[1];
      const type = /\bmedia-type="([^"]*)"/i.exec(attrs)?.[1] || '';
      if (id && href) manifest.set(id, { href, type });
    }

    // spine 顺序
    const spineRe = /<itemref\b([^>]*)\/?>/gi;
    let sm;
    while ((sm = spineRe.exec(opf))) {
      const idref = /\bidref="([^"]*)"/i.exec(sm[1])?.[1];
      const item = idref && manifest.get(idref);
      if (item) order.push(item.href);
    }

    // 兜底：spine 为空时按 manifest 里的 xhtml 顺序
    if (!order.length) {
      for (const { href, type } of manifest.values()) {
        if (/x?html/i.test(type) || /\.x?html?$/i.test(href)) order.push(href);
      }
    }

    // 相对 OPF 目录解析
    const base = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
    order = order.map((h) => resolvePath(base, h));
  }

  if (!order.length) {
    order = Object.keys(zip.files).filter((n) => /\.x?html?$/i.test(n)).sort();
  }

  const chunks = [];
  for (const path of order) {
    const entry = zip.file(path);
    if (!entry) continue;
    const html = await entry.async('string');
    const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] || html;
    const text = normalizeText(stripTags(body));
    if (text) chunks.push(text);
  }

  return {
    title,
    text: normalizeText(chunks.join('\n\n')),
    format: 'epub',
    chapters: chunks.length
  };
}

function resolvePath(base, href) {
  const clean = decodeURIComponent(String(href || '').split('#')[0]);
  if (!base) return clean;
  const parts = (base + clean).split('/');
  const out = [];
  for (const p of parts) {
    if (p === '.' || p === '') continue;
    if (p === '..') out.pop();
    else out.push(p);
  }
  return out.join('/');
}

async function parsePlainText(file) {
  const raw = await file.text();
  return { title: '', text: normalizeText(raw), format: 'text' };
}

async function parseHtml(file) {
  const raw = await file.text();
  const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(raw)?.[1] || raw;
  const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(raw)?.[1] || '').trim();
  return { title, text: normalizeText(stripTags(body)), format: 'html' };
}

/** RTF 解析：按花括号深度遍历，跳过字体表/样式表等信息组 */
async function parseRtf(file) {
  const raw = await file.text();
  const SKIP = /^\{\\\*?\\?(fonttbl|colortbl|stylesheet|info|pict|header|footer|headerl|headerr|footerl|footerr|listtable|listoverridetable|themedata|colorschememapping|datastore|latentstyles|xmlnstbl)\b/i;

  let out = '';
  let depth = 0;
  let skipDepth = -1;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (ch === '{') {
      depth++;
      // 命中要跳过的控制组，记住深度，整组丢弃
      if (skipDepth < 0) {
        const rest = raw.slice(i, i + 60);
        if (SKIP.test(rest)) skipDepth = depth;
      }
      continue;
    }
    if (ch === '}') {
      if (skipDepth === depth) skipDepth = -1;
      depth--;
      continue;
    }
    if (skipDepth >= 0) continue;

    if (ch === '\\') {
      const next = raw[i + 1];
      // \\ \{ \} 是转义的字面字符
      if (next === '\\' || next === '{' || next === '}') { out += next; i++; continue; }
      // \'hh 十六进制字节
      if (next === "'") {
        const hex = raw.slice(i + 2, i + 4);
        if (/^[0-9a-f]{2}$/i.test(hex)) { out += String.fromCharCode(parseInt(hex, 16)); i += 3; continue; }
      }
      // \uN? Unicode 码点
      if (next === 'u') {
        const m = /^\\u(-?\d+)\s?\??/.exec(raw.slice(i, i + 14));
        if (m) {
          const cp = ((Number(m[1]) % 65536) + 65536) % 65536;
          out += String.fromCharCode(cp);
          i += m[0].length - 1;
          continue;
        }
      }
      // \par \line 换行
      const w = /^\\([a-z]+)(-?\d+)?\s?/i.exec(raw.slice(i, i + 20));
      if (w) {
        const word = w[1].toLowerCase();
        if (word === 'par' || word === 'line' || word === 'row') out += '\n';
        else if (word === 'tab') out += '\t';
        i += w[0].length - 1;
        continue;
      }
      // 其它控制符：跳过反斜杠和紧跟的一个非字母字符
      if (next && !/[a-z]/i.test(next)) { i++; continue; }
      continue;
    }

    out += ch;
  }

  return { title: '', text: normalizeText(out), format: 'rtf' };
}

/* ============================================================
   对外入口
   ============================================================ */

export const EBOOK_ACCEPT = '.pdf,.docx,.epub,.txt,.md,.markdown,.html,.htm,.rtf';

export const FORMAT_LABELS = {
  pdf: 'PDF',
  docx: 'Word',
  epub: 'EPUB',
  text: '纯文本',
  html: '网页',
  rtf: 'RTF'
};

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(String(name || ''));
  return m ? m[1].toLowerCase() : '';
}

function titleFromFile(name) {
  return String(name || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_]+/g, ' ')
    .trim();
}

/**
 * 解析电子书文件为纯文本。
 * @returns {{title,text,format,pages?,needsOcr?,warnings?,chapters?}}
 */
export async function parseEbookFile(file, { onProgress } = {}) {
  if (!file) throw new Error('没有选择文件');
  const ext = extOf(file.name);

  if (ext === 'doc') {
    throw new Error('不支持旧版 .doc，请用 Word 另存为 .docx 后再导入');
  }

  let result;
  if (ext === 'pdf') result = await parsePdf(file, { onProgress });
  else if (ext === 'docx') result = await parseDocx(file);
  else if (ext === 'epub') result = await parseEpub(file);
  else if (ext === 'html' || ext === 'htm') result = await parseHtml(file);
  else if (ext === 'rtf') result = await parseRtf(file);
  else if (['txt', 'md', 'markdown', 'text'].includes(ext)) result = await parsePlainText(file);
  else throw new Error(`不支持的文件类型：.${ext || '未知'}`);

  result.title = String(result.title || '').trim() || titleFromFile(file.name);
  result.fileName = file.name;
  result.size = file.size;

  if (!result.text || !result.text.trim()) {
    result.empty = true;
  }
  return result;
}

/** 粗略统计英文词数，供导入预览用 */
export function countWords(text) {
  const en = String(text || '').match(/[A-Za-z][A-Za-z'’-]*/g);
  return en ? en.length : 0;
}
