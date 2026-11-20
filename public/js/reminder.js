// 提醒：APK 内用系统通知 + 闹钟；浏览器下用 Web 通知 + Web Push

import { getSettings, setSettings } from './store.js';
import { toast, dateKey } from './ui.js';
import {
  isNative, nativeHasNotificationPermission, nativeRequestNotificationPermission,
  nativeShowNotification, nativeScheduleReminder, nativeCancelReminder,
  nativeOpenNotificationSettings
} from './bridge.js';

let timer = null;

export function localNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export async function showNotification(title = '该背单词啦！', body = '今日试卷已准备好，花 5 分钟完成一次学习循环。') {
  if (isNative()) {
    await nativeShowNotification(title, body);
    return;
  }
  const options = { body, icon: './icons/icon.svg', badge: './icons/icon.svg', tag: 'wordwise-daily', data: { url: '#/quiz?mode=take' } };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, options)).catch(() => fallback(title, options));
  } else fallback(title, options);
}

function fallback(title, options) {
  if ('Notification' in window && Notification.permission === 'granted') new Notification(title, options);
  else toast(`${title} ${options.body}`, 'info', 5000);
}

function checkDue() {
  const s = getSettings();
  if (!s.reminderEnabled) return;
  const now = localNow();
  const flag = `wordwise-reminded-${dateKey()}`;
  if (now === s.reminderTime && localStorage.getItem(flag) !== '1') {
    localStorage.setItem(flag, '1');
    showNotification();
  }
}

export function startLocalScheduler() {
  clearInterval(timer);
  // APK 内由系统闹钟负责，页面内调度仅在浏览器启用
  if (isNative()) return;
  timer = setInterval(checkDue, 20000);
  checkDue();
}

export async function requestPermission() {
  if (isNative()) {
    const ok = await nativeHasNotificationPermission();
    if (ok) return 'granted';
    await nativeRequestNotificationPermission();
    const granted = await nativeHasNotificationPermission();
    if (!granted) throw new Error('通知权限未授予，请在系统设置中开启');
    return 'granted';
  }
  if (!('Notification' in window)) throw new Error('当前浏览器不支持通知');
  let p = Notification.permission;
  if (p === 'default') p = await Notification.requestPermission();
  if (p !== 'granted') throw new Error('通知权限未授予');
  return p;
}

export async function getPermissionStatus() {
  if (isNative()) return (await nativeHasNotificationPermission()) ? 'granted' : 'default';
  return ('Notification' in window) ? Notification.permission : 'unsupported';
}

/** 提醒开关/时间变化时调用：APK 内立即刷新系统闹钟，浏览器内同步 Web Push */
export async function syncPushSettings() {
  const s = getSettings();
  if (isNative()) {
    try { await nativeScheduleReminder(!!s.reminderEnabled, s.reminderTime || '20:00'); }
    catch (e) { console.warn('闹钟设置失败', e); }
    return;
  }
  if (!s.pushSubscribed) return;
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) { setSettings({ pushSubscribed: false }); return; }
    await fetch('/api/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), settings: { enabled: s.reminderEnabled, time: s.reminderTime, offsetMinutes: -new Date().getTimezoneOffset() } })
    });
  } catch (_) { /* 静默 */ }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function subscribePush() {
  if (isNative()) {
    await requestPermission();
    await syncPushSettings();
    return true;
  }
  await requestPermission();
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('当前环境不支持 Web Push（需 HTTPS 或 localhost）');
  const reg = await navigator.serviceWorker.ready;
  const res = await fetch('/api/vapid-public');
  const { key } = await res.json();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) });
  }
  const s = getSettings();
  const r = await fetch('/api/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub.toJSON(), settings: { enabled: s.reminderEnabled, time: s.reminderTime, offsetMinutes: -new Date().getTimezoneOffset() } })
  });
  if (!r.ok) throw new Error('订阅同步失败');
  setSettings({ pushSubscribed: true });
  return true;
}

export async function unsubscribePush() {
  if (isNative()) {
    await nativeCancelReminder();
    return;
  }
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await fetch('/api/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
    await sub?.unsubscribe();
  }
  setSettings({ pushSubscribed: false });
}

export async function testPush() {
  if (isNative()) {
    await showNotification('提醒测试', '这是一条测试通知，说明通知已经正常工作。');
    return '测试通知已发送';
  }
  const r = await fetch('/api/push-test', { method: 'POST' });
  const data = await r.json();
  if (!data.ok) throw new Error('测试推送失败');
  if (!data.results?.length) { showNotification('提醒测试', '这是一条本地测试通知'); return '本地通知已触发（尚无 Push 订阅）'; }
  const failed = data.results.filter((x) => !x.ok);
  return failed.length ? `已发送 ${data.results.length} 条，其中 ${failed.length} 条失败` : `已向 ${data.results.length} 台设备发送测试通知`;
}

export async function openNotificationSettings() {
  if (isNative()) return nativeOpenNotificationSettings();
}
