// 登录 / 注册界面：在应用启动前拦一道，登录成功后才进入主界面

import { icon } from './ui.js';
import { login, register } from './auth.js';

let mounted = false;

function screenHTML() {
  return `
  <div class="auth-screen" id="authScreen">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="brand-mark" aria-hidden="true"><span>词</span></div>
        <div>
          <strong>词智 WordWise</strong>
          <div class="tiny muted">登录后学习记录按账号独立保存</div>
        </div>
      </div>

      <div class="auth-tabs" role="tablist">
        <button class="auth-tab active" data-auth-tab="login" type="button">登录</button>
        <button class="auth-tab" data-auth-tab="register" type="button">注册</button>
      </div>

      <form class="auth-form" id="authForm" autocomplete="on" novalidate>
        <label class="auth-field">
          <span>用户名</span>
          <input name="username" type="text" autocomplete="username" maxlength="20" placeholder="2-20 位，中英文均可" required />
        </label>
        <label class="auth-field" data-only="register">
          <span>昵称（可选）</span>
          <input name="nickname" type="text" autocomplete="nickname" maxlength="20" placeholder="展示用的名字" />
        </label>
        <label class="auth-field">
          <span>密码</span>
          <input name="password" type="password" autocomplete="current-password" maxlength="72" placeholder="至少 6 位" required />
        </label>
        <label class="auth-field" data-only="register">
          <span>确认密码</span>
          <input name="password2" type="password" autocomplete="new-password" maxlength="72" placeholder="再输一次" />
        </label>

        <div class="auth-error" id="authError" hidden></div>
        <button class="btn btn-primary auth-submit" id="authSubmit" type="submit">登录</button>
      </form>

      <div class="auth-foot tiny muted">
        ${icon('lock', 12)} 账号只存在这台设备上，密码用 scrypt 加盐保存，不会上传到任何第三方。
      </div>
    </div>
  </div>`;
}

export function showLoginGate(onDone) {
  if (mounted) return;
  mounted = true;

  const host = document.createElement('div');
  host.id = 'authRoot';
  host.innerHTML = screenHTML();
  document.body.appendChild(host);
  document.body.classList.add('auth-locked');

  const form = host.querySelector('#authForm');
  const errBox = host.querySelector('#authError');
  const submit = host.querySelector('#authSubmit');
  let mode = 'login';

  function setMode(next) {
    mode = next;
    host.querySelectorAll('[data-auth-tab]').forEach((b) => b.classList.toggle('active', b.dataset.authTab === mode));
    host.querySelectorAll('[data-only="register"]').forEach((el) => el.classList.toggle('hide', mode !== 'register'));
    submit.textContent = mode === 'login' ? '登录' : '注册并进入';
    const pw = form.querySelector('[name="password"]');
    pw.setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
    hideError();
  }

  function showError(msg) {
    errBox.textContent = msg;
    errBox.hidden = false;
  }
  function hideError() { errBox.hidden = true; errBox.textContent = ''; }

  host.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.authTab));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    const data = new FormData(form);
    const username = String(data.get('username') || '').trim();
    const password = String(data.get('password') || '');
    const nickname = String(data.get('nickname') || '').trim();
    const password2 = String(data.get('password2') || '');

    if (!username || !password) { showError('请输入用户名和密码'); return; }
    if (mode === 'register' && password !== password2) { showError('两次输入的密码不一致'); return; }

    submit.disabled = true;
    const label = submit.textContent;
    submit.innerHTML = '<span class="loading"></span> 处理中…';
    try {
      const user = mode === 'login'
        ? await login(username, password)
        : await register(username, password, nickname);
      host.remove();
      document.body.classList.remove('auth-locked');
      mounted = false;
      onDone(user);
    } catch (err) {
      showError(err.message || '操作失败，请重试');
      submit.disabled = false;
      submit.textContent = label;
    }
  });

  setMode('login');
  setTimeout(() => form.querySelector('[name="username"]')?.focus(), 60);
}
