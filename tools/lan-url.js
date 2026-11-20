#!/usr/bin/env node
/**
 * 打印本机局域网访问地址，供 start.bat / backend-start.bat / lan-firewall.bat 调用。
 * 输出保持纯 ASCII，避免 GBK 控制台乱码：
 *   http://192.168.1.5:8787  [WLAN]
 * 用法：node tools/lan-url.js [port]
 */
'use strict';

const os = require('os');

const port = Number(process.argv[2] || process.env.PORT || 8787);
const VIRTUAL = /(vmware|vmnet|virtualbox|vbox|hyper-?v|vethernet|loopback|docker|wsl|tailscale|zerotier|wireguard|tap|tun|ppp|bluetooth)/i;
const isPrivate = (ip) => /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

const list = [];
const ifaces = os.networkInterfaces() || {};
for (const name of Object.keys(ifaces)) {
  for (const n of ifaces[name] || []) {
    const family = n.family;
    if (family !== 'IPv4' && family !== 4) continue;
    if (n.internal) continue;
    const ip = String(n.address || '');
    if (!ip || /^169\.254\./.test(ip)) continue;
    list.push({ name, ip, url: `http://${ip}:${port}`, virtual: VIRTUAL.test(name), private: isPrivate(ip) });
  }
}

list.sort((a, b) => (Number(a.virtual) - Number(b.virtual))
  || (Number(b.private) - Number(a.private))
  || a.ip.localeCompare(b.ip, 'en'));

for (const a of list) {
  console.log(`${a.url}  [${a.name}${a.virtual ? ' / virtual' : ''}]`);
}
