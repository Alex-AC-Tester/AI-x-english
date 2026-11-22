// 账号状态（浏览器端）：登录 / 注册 / 退出 + 当前用户缓存。
// 请求统一走 api.js（超时、401 事件派发都在那里处理）。

import { request } from './api.js';

let currentUser = null;

export async function fetchMe() {
  // 服务可达但未登录时 /api/auth/me 返回 { ok:true, user:null } —— 正常返回 null；
  // 网络不通时向上抛错，由调用方区分「离线」与「未登录」两种界面。
  const data = await request('/api/auth/me');
  currentUser = data.user || null;
  return currentUser;
}

export function getUser() { return currentUser; }

export async function login(username, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  currentUser = data.user || null;
  return currentUser;
}

export async function register(username, password, nickname) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, nickname })
  });
  currentUser = data.user || null;
  return currentUser;
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    currentUser = null;
  }
}
