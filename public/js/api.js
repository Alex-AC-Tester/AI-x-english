'use strict';

/**
 * 统一请求封装：超时、JSON 解析、错误归一化、401 统一处理。
 * - 所有错误都抛 Error（带 status 字段），消息可直接给 toast
 * - 收到 401 时派发全局 ww:unauthorized 事件，由 app.js 切回登录屏
 */

export async function request(path, options = {}) {
  const { timeout = 30000, ...fetchOptions } = options;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  let res;
  try {
    res = await fetch(path, Object.assign({ cache: 'no-store' }, fetchOptions, { signal: ctrl.signal }));
  } catch (e) {
    if (e && e.name === 'AbortError') throw new Error('请求超时');
    throw new Error('网络不可用，请确认服务已启动');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try { data = await res.json(); } catch (_) { /* 非 JSON 响应按 HTTP 状态处理 */ }

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('ww:unauthorized'));
    const err = new Error((data && data.error) || '请先登录');
    err.status = 401;
    throw err;
  }
  if (!res.ok || (data && data.ok === false)) {
    const err = new Error((data && data.error) || `请求失败（HTTP ${res.status}）`);
    err.status = res.status;
    throw err;
  }
  return data || {};
}
