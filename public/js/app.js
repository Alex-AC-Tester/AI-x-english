import { init, subscribe, onSync, getState, setSettings, getSettings } from './store.js';
import { isNative } from './bridge.js';
import { computeStats } from './stats.js';
import { icon } from './ui.js';
import { initRouter, onChange, go } from './router.js';
import { startLocalScheduler } from './reminder.js';

import * as home from './views/home.js';
import * as reader from './views/reader.js';
import * as history from './views/history.js';
import * as lookup from './views/lookup.js';
import * as importView from './views/import.js';
import * as words from './views/words.js';
import * as learn from './views/learn.js';
import * as quiz from './views/quiz.js';
import * as dashboard from './views/dashboard.js';
import * as settings from './views/settings.js';

const VIEWS = { home, reader, history, lookup, import: importView, words, learn, quiz, dashboard, settings };
// tab: true 的项出现在移动端底栏（其余仍需在侧栏抽屉中访问）
const NAV = [
  { name: 'home', label: '今日', icon: 'home', tab: true },
  { name: 'reader', label: '阅读', icon: 'reader', tab: true },
  { name: 'history', label: '句库', icon: 'chat' },
  { name: 'lookup', label: '查词', icon: 'searchWord', tab: true },
  { name: 'words', label: '词库', icon: 'book', tab: true },
  { name: 'learn', label: '背词', icon: 'target' },
  { name: 'quiz', label: '试卷', icon: 'clipboard', tab: true },
  { name: 'dashboard', label: '看板', icon: 'chart', tab: true },
  { name: 'settings', label: '设置', icon: 'gear' }
];

function buildNav() {
  const side = document.getElementById('sideNav');
  const tabs = document.getElementById('tabbar');
  side.innerHTML = NAV.map((n) => `
    <button class="nav-item" data-nav="${n.name}" type="button">${icon(n.icon)}<span>${n.label}</span><span class="badge hide" data-badge="${n.name}"></span></button>`).join('');
  tabs.innerHTML = NAV.filter((n) => n.tab).map((n) => `
    <button class="tab-item" data-nav="${n.name}" type="button">${icon(n.icon, 20)}<span>${n.label}</span></button>`).join('');

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nav]');
    if (!btn) return;
    go(btn.dataset.nav);
    closeSidebar();
  });
}

function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  if (!document.querySelector('.scrim')) {
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    scrim.addEventListener('click', closeSidebar);
    document.getElementById('app').appendChild(scrim);
  }
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.querySelector('.scrim')?.remove();
}

function updateChrome(route) {
  const view = VIEWS[route.name] || VIEWS.home;
  const title = typeof view.title === 'function' ? view.title(route.params) : view.title;
  const subtitle = typeof view.subtitle === 'function' ? view.subtitle(route.params) : view.subtitle;
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = subtitle;
  document.querySelectorAll('[data-nav]').forEach((el) => el.classList.toggle('active', el.dataset.nav === route.name));
}

function updateStreak() {
  const st = computeStats(getState());
  document.getElementById('streakChip').innerHTML = `${icon('flame', 13)} <span class="streak-text">连续 ${st.streak} 天</span>`;
}

function updateBadges() {
  const due = getState().words.filter((w) => !w.srs?.dueAt || w.srs.dueAt <= Date.now() || !w.srs?.level).length;
  const badge = document.querySelector('[data-badge="words"]');
  if (badge) { badge.textContent = due > 99 ? '99+' : due; badge.classList.toggle('hide', due === 0); }
}

async function renderRoute(route) {
  const old = document.getElementById('view');
  const fresh = document.createElement('main');
  fresh.className = 'view'; fresh.id = 'view';
  old.replaceWith(fresh);

  updateChrome(route);
  const view = VIEWS[route.name] || VIEWS.home;
  fresh.innerHTML = view.render(route.params || {});
  updateStreak();
  updateBadges();
  try { await view.mount?.(route.params || {}); }
  catch (err) { console.error('[view mount]', err); }
}

async function boot() {
  buildNav();
  document.getElementById('menuBtn').innerHTML = icon('menu', 20);
  document.getElementById('menuBtn').addEventListener('click', () => {
    if (document.getElementById('sidebar')?.classList.contains('open')) closeSidebar();
    else openSidebar();
  });
  document.getElementById('bellBtn').innerHTML = icon('bell', 19);
  document.getElementById('bellBtn').addEventListener('click', () => go('settings'));

  initRouter();
  await init();

  // APK 内：默认首次授予通知权限时机由用户在设置页决定，并刷新一次系统闹钟
  if (isNative()) {
    const s = getSettings();
    if (s.reminderEnabled) {
      const { syncPushSettings } = await import('./reminder.js');
      syncPushSettings();
    }
  }

  subscribe(() => { updateStreak(); updateBadges(); });
  onSync(({ level, text }) => {
    const pill = document.getElementById('syncPill');
    pill.className = `sync-pill ${level === 'busy' ? 'busy' : level === 'error' ? 'error' : ''}`;
    pill.querySelector('span').textContent = text;
  });

  onChange((route) => { renderRoute(route).catch(console.error); });
  await renderRoute({ name: (await import('./router.js')).getRoute().name, params: (await import('./router.js')).getRoute().params });

  startLocalScheduler();

  if (!isNative() && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('SW 注册失败', err));
  }
}

boot().catch((err) => {
  console.error(err);
  document.getElementById('view').innerHTML = `<div class="card"><h2>启动失败</h2><p class="small muted">${err.message}</p></div>`;
});
