// 内置词典查询客户端（服务端 ECDICT，带本地缓存）

const cache = new Map();
let statusCache = null;

export async function dictStatus() {
  if (statusCache) return statusCache;
  try {
    const res = await fetch('/api/dict/status', { cache: 'no-store' });
    statusCache = res.ok ? await res.json() : { ok: false, meta: null };
  } catch (_) {
    statusCache = { ok: false, meta: null };
  }
  return statusCache;
}

export async function dictLookup(term) {
  const q = String(term || '').trim().toLowerCase();
  if (!q) return null;
  if (cache.has(q)) return cache.get(q);
  try {
    const res = await fetch(`/api/dict?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const value = data?.ok ? data : null;
    // 缓存有上限（与 mdx.js 同策略）：超过 60 条整体清空，防止长会话无限增长
    if (cache.size > 60) cache.clear();
    cache.set(q, value);
    return value;
  } catch (_) {
    return null;
  }
}

export function clearDictCache() { cache.clear(); statusCache = null; }
