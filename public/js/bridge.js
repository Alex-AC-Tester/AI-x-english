// 原生桥接层：在 APK 内自动切换到原生 HTTP / 文件 / 通知能力，浏览器下回退到 Web 实现。
// 内置默认网关配置：默认不带 Key，Key 请在「设置」里填写，或写入本地 config.json / 环境变量 WORDWISE_API_KEY
export const BUILTIN_CONFIG = {
  apiBase: 'https://developer.amd.com.cn/radeon/api/v1',
  apiKey: ''
};

export function isNative() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

function plugin() {
  return window.Capacitor?.Plugins?.NativeBridge || null;
}

/** 根据设置返回实际使用的网关地址与 Key：原生环境下默认用内置配置 */
export function apiCredentials(settings) {
  if (settings?.apiMode === 'custom') {
    return {
      apiBase: (settings.customApiBase || BUILTIN_CONFIG.apiBase).replace(/\/+$/, ''),
      apiKey: settings.customApiKey || ''
    };
  }
  return { apiBase: BUILTIN_CONFIG.apiBase, apiKey: BUILTIN_CONFIG.apiKey };
}

/** 原生直连 AI 网关（绕过 WebView CORS）。返回 {status, body} */
export async function nativeAIRequest({ url, apiKey, method = 'POST', body = '', timeout = 240000 }) {
  const p = plugin();
  if (!p) throw new Error('原生桥接不可用');
  return await p.aiRequest({ url, apiKey, method, body, timeout });
}

/** 保存文件到手机 Downloads/WordWise */
export async function nativeSaveFile(name, content, mime = 'text/plain;charset=utf-8') {
  const p = plugin();
  if (!p) throw new Error('原生桥接不可用');
  return await p.saveFile({ name, content, mime });
}

/* ---------- 提醒 ---------- */
export async function nativeHasNotificationPermission() {
  const p = plugin();
  if (!p) return false;
  const r = await p.hasNotificationPermission();
  return !!r.granted;
}
export async function nativeRequestNotificationPermission() {
  const p = plugin();
  if (!p) return;
  await p.requestNotificationPermission();
}
export async function nativeShowNotification(title, body) {
  const p = plugin();
  if (!p) return false;
  await p.showNotification({ title, body });
  return true;
}
export async function nativeScheduleReminder(enabled, time) {
  const p = plugin();
  if (!p) return;
  await p.scheduleReminder({ enabled, time });
}
export async function nativeCancelReminder() {
  const p = plugin();
  if (!p) return;
  await p.cancelReminder();
}
export async function nativeOpenNotificationSettings() {
  const p = plugin();
  if (!p) return;
  await p.openNotificationSettings();
}
