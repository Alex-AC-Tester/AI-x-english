// 极简 hash 路由

let current = { name: 'home', params: {} };
const listeners = new Set();

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [name = 'home', query = ''] = raw.split('?');
  const params = {};
  new URLSearchParams(query).forEach((v, k) => { params[k] = v; });
  return { name: name || 'home', params };
}

export function go(name, params = {}, replace = false) {
  const query = new URLSearchParams(params).toString();
  const hash = `#/${name}${query ? `?${query}` : ''}`;
  // 目标与当前完全一致时不重复渲染：防止误点当前 tab 重建视图丢失滚动/答题状态；
  // 需要主动重渲染请用 refresh()
  if (location.hash === hash) return;
  if (replace) history.replaceState(null, '', hash);
  else location.hash = hash;
  notify({ name, params });
}

function notify(route, opts = {}) {
  current = route;
  listeners.forEach((fn) => { try { fn(route); } catch (e) { console.error(e); } });
  if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' });
}

export function refresh(opts) { notify(parseHash(), opts); }
export function getRoute() { return current; }
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function initRouter() {
  window.addEventListener('hashchange', () => notify(parseHash()));
  current = parseHash();
  if (!location.hash) history.replaceState(null, '', '#/home');
}
