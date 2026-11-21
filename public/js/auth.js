// 账号状态（浏览器端）：注册 / 登录 / 退出已暂时关闭，只保留读取当前本机账号。
// 恢复账号功能时，把 /api/auth/login、/api/auth/register 的调用与登录界面一起加回来。

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

export function getUser() { return currentUser; }
