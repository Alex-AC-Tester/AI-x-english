// MDX 词典客户端：查询、沙箱渲染、导入
// 渲染策略：词条 HTML 放进 sandbox iframe（允许同源以便量高度、禁止脚本），
// 词典自带的 CSS 只在框内生效，不会污染应用主题。

const lookupCache = new Map();
let statusCache = null;

export async function mdxStatus(force = false) {
  if (statusCache && !force) return statusCache;
  try {
    const res = await fetch('/api/mdx/status', { cache: 'no-store' });
    statusCache = res.ok ? await res.json() : { ok: false, dicts: [] };
  } catch (_) {
    statusCache = { ok: false, dicts: [] };
  }
  if (!Array.isArray(statusCache.dicts)) statusCache.dicts = [];
  return statusCache;
}

export function clearMdxCache() {
  lookupCache.clear();
  statusCache = null;
}

export async function mdxLookup(word) {
  const q = String(word || '').trim().toLowerCase();
  if (!q) return null;
  if (lookupCache.has(q)) return lookupCache.get(q);
  try {
    const res = await fetch(`/api/mdx/lookup?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
    const data = res.ok ? await res.json() : null;
    const value = data?.ok ? data : null;
    if (lookupCache.size > 60) lookupCache.clear();
    lookupCache.set(q, value);
    return value;
  } catch (_) {
    return null;
  }
}

/* ---------------- 渲染 ---------------- */

const BASE_CSS = `
html, body { margin: 0; padding: 0; background: #fff; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 14.5px; line-height: 1.68; color: #26241f;
  padding: 2px 2px 6px; overflow-x: hidden;
  word-wrap: break-word; overflow-wrap: break-word;
}
img { max-width: 100%; height: auto; }
table { max-width: 100%; border-collapse: collapse; }
td, th { word-break: break-word; }
a { color: #b23a2e; text-decoration: none; }
pre { white-space: pre-wrap; word-break: break-word; }
`;

function buildDoc(entry) {
  const base = `/api/mdx/res/${encodeURIComponent(entry.dict.id)}/`;
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">`
    + `<base href="${base}">`
    + `<style>${BASE_CSS}</style>`
    + (entry.head || '')
    + `<style>img{max-width:100%!important;height:auto!important}body{overflow-x:hidden}</style>`
    + `</head><body>${entry.body || ''}</body></html>`;
}

/**
 * 把词条渲染进 host 容器（自动撑高，最长 maxHeight 后滚动）
 */
export function mountMdxEntry(host, entry, { maxHeight = 0 } = {}) {
  if (!host || !entry) return null;
  host.innerHTML = '';
  host.classList.add('mdx-host');

  const frame = document.createElement('iframe');
  frame.className = 'mdx-frame';
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  frame.setAttribute('scrolling', 'no');
  frame.setAttribute('title', entry.key || 'dictionary entry');
  host.appendChild(frame);

  let loaded = false;
  const fit = () => {
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      const h = Math.max(
        doc.body ? doc.body.scrollHeight : 0,
        doc.documentElement ? doc.documentElement.scrollHeight : 0
      );
      if (!h) return;
      const cap = maxHeight || h;
      const finalH = Math.min(h, cap) + 2;
      frame.style.height = `${finalH}px`;
      frame.setAttribute('scrolling', h > cap ? 'auto' : 'no');
    } catch (_) { /* 跨域或未就绪 */ }
  };

  frame.addEventListener('load', () => {
    if (loaded) {
      // 词典内部链接被点开时会变成新文档，这里复位回词条本身
      try {
        const href = frame.contentWindow?.location?.href || '';
        if (href && href !== 'about:srcdoc') { frame.srcdoc = buildDoc(entry); return; }
      } catch (_) { /* 忽略 */ }
    }
    loaded = true;
    fit();
    setTimeout(fit, 120);
    setTimeout(fit, 380);
    setTimeout(fit, 900);
  });

  frame.srcdoc = buildDoc(entry);
  return frame;
}

/** 把页面上所有 [data-mdx-host] 占位符填上词条 */
export function mountMdxHosts(root, entry, opts) {
  if (!root) return;
  root.querySelectorAll('[data-mdx-host]').forEach((el) => mountMdxEntry(el, entry, opts));
}

/* ---------------- 导入 ---------------- */

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(String(name || ''));
  return m ? m[1].toLowerCase() : '';
}

export async function uploadMdxFile(file, token) {
  const kind = extOf(file.name) === 'mdd' ? 'mdd' : 'mdx';
  const qs = `kind=${kind}&name=${encodeURIComponent(file.name)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  const res = await fetch(`/api/mdx/upload?${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: file
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || `上传失败（${res.status}）`);
  return data;
}

export async function importMdx(token, name) {
  const res = await fetch('/api/mdx/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, name })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || '导入失败');
  clearMdxCache();
  return data.meta;
}

export async function deleteMdxDict(id) {
  const res = await fetch('/api/mdx/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || '删除失败');
  clearMdxCache();
  return true;
}

export function formatBytes(n) {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(0)} KB`;
  if (v < 1024 * 1024 * 1024) return `${(v / 1024 / 1024).toFixed(1)} MB`;
  return `${(v / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
