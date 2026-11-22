// 登录 / 注册屏：未登录时渲染在 #view 里，成功后回调进入主应用。
// 复用全站样式（card / field / input / btn），不新增 CSS。

import { login, register } from './auth.js';

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let mode = 'login'; // 'login' | 'register'
let busy = false;

function template() {
  const isReg = mode === 'register';
  return `
  <div class="card" style="max-width:420px;margin:8vh auto 0">
    <h2>${isReg ? '创建账号' : '登录 词智'}</h2>
    <p class="small muted">${isReg ? '学习数据按账号独立存储在本机。' : '学习数据按账号独立存储在本机，登录后继续。'}</p>
    <form id="loginForm">
      <div class="field"><label>用户名</label>
        <input class="input" id="loginUser" autocomplete="username" maxlength="20" required /></div>
      ${isReg ? `<div class="field"><label>昵称（可选）</label>
        <input class="input" id="loginNick" maxlength="20" /></div>` : ''}
      <div class="field"><label>密码</label>
        <input class="input" type="password" id="loginPass" autocomplete="${isReg ? 'new-password' : 'current-password'}" required /></div>
      <p class="small" id="loginError" style="color:var(--danger);min-height:18px"></p>
      <button class="btn btn-primary btn-block" id="loginSubmit" type="submit">${isReg ? '注册并进入' : '登录'}</button>
    </form>
    <p class="small" style="margin-top:14px">
      ${isReg ? '已经有账号？' : '还没有账号？'}
      <button class="btn btn-ghost btn-sm" id="loginToggle" type="button">${isReg ? '去登录' : '注册一个'}</button>
    </p>
  </div>`;
}

function wire(view, onSuccess) {
  const form = view.querySelector('#loginForm');
  const errBox = view.querySelector('#loginError');
  const submit = view.querySelector('#loginSubmit');
  const toggle = view.querySelector('#loginToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      mode = mode === 'login' ? 'register' : 'login';
      view.innerHTML = template();
      wire(view, onSuccess);
      view.querySelector('#loginUser')?.focus();
    });
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const username = view.querySelector('#loginUser').value.trim();
    const password = view.querySelector('#loginPass').value;
    const nickname = view.querySelector('#loginNick')?.value.trim() || '';
    errBox.textContent = '';
    busy = true;
    submit.disabled = true;
    try {
      const user = mode === 'login'
        ? await login(username, password)
        : await register(username, password, nickname);
      onSuccess(user);
    } catch (err) {
      errBox.textContent = esc(err.message || '操作失败');
      busy = false;
      submit.disabled = false;
    }
  });
}

/** 渲染登录屏；登录 / 注册成功后回调 onSuccess(user) 进入主应用。 */
export function showLogin(onSuccess) {
  busy = false;
  const view = document.getElementById('view');
  if (!view) return;
  view.innerHTML = template();
  wire(view, onSuccess);
  view.querySelector('#loginUser')?.focus();
}
