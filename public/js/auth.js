// 账号与会话（浏览器端）：只保存用户信息，令牌放在 httpOnly Cookie 里

let currentUser = null;

async function req(path, options = {}) {
  const res = await fetch(path, Object.assign({ cache: 'no-store' }, options));
  let data = null;
  try { data = await res.json(); } catch (_) { data = null; }
  if (!res.ok || (data && data.ok === false)) {
    throw new Error((data && data.error) || `请求失败（HTTP ${res.status}）`);
  }
  return data || {};
}

export async function fetchMe() {
  try {
    const data = await req('/api/auth/me');
    currentUser = data.user || null;
  } catch (_) {
    currentUser = null;
  }
  return currentUser;
}

export async function login(username, password) {
  const data = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  currentUser = data.user || null;
  return currentUser;
}

export async function register(username, password, nickname) {
  const data = await req('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, nickname })
  });
  currentUser = data.user || null;
  return currentUser;
}

export async function logout() {
  try {
    await req('/api/auth/logout', { method: 'POST' });
  } catch (_) { /* 已过期也当作登出 */ }
  currentUser = null;
}

export function getUser() { return currentUser; }
export function isLoggedIn() { return !!currentUser; }
