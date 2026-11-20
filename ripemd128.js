'use strict';
// RIPEMD-128：MDX 2.0+ 的分块密钥派生依赖它（Node 自带 crypto 只支持 ripemd160）
// 表与流程参照 RIPEMD 官方规范（双线并行，右线使用独立的消息字顺序与移位表）
const ZL = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2
];
const ZR = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14
];
const SL = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12
];
const SR = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8
];

const F = (x, y, z) => (x ^ y ^ z) >>> 0;
const G = (x, y, z) => ((x & y) | (~x & z)) >>> 0;
const H = (x, y, z) => ((x | ~y) ^ z) >>> 0;
const I = (x, y, z) => ((x & z) | (y & ~z)) >>> 0;
const rotl = (x, n) => (((x << n) | (x >>> (32 - n))) >>> 0);

function T(i, b, c, d) {
  if (i < 16) return F(b, c, d);
  if (i < 32) return (G(b, c, d) + 0x5a827999) >>> 0;
  if (i < 48) return (H(b, c, d) + 0x6ed9eba1) >>> 0;
  return (I(b, c, d) + 0x8f1bbcdc) >>> 0;
}
function T64(i, b, c, d) {
  if (i < 16) return (I(b, c, d) + 0x50a28be6) >>> 0;
  if (i < 32) return (H(b, c, d) + 0x5c4dd124) >>> 0;
  if (i < 48) return (G(b, c, d) + 0x6d703ef3) >>> 0;
  return F(b, c, d);
}

function ripemd128(buf) {
  const rem = buf.length % 64;
  const padLen = rem < 56 ? 56 - rem : 120 - rem;
  const msg = Buffer.alloc(buf.length + padLen + 8);
  buf.copy(msg);
  msg[buf.length] = 0x80;
  msg.writeBigUInt64LE(BigInt(buf.length) * 8n, msg.length - 8);

  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  const X = new Array(16);

  for (let off = 0; off < msg.length; off += 64) {
    for (let i = 0; i < 16; i++) X[i] = msg.readUInt32LE(off + i * 4);
    let al = h[0], bl = h[1], cl = h[2], dl = h[3];
    let ar = al, br = bl, cr = cl, dr = dl;
    for (let i = 0; i < 64; i++) {
      let t = (al + X[ZL[i]]) >>> 0;
      t = (t + T(i, bl, cl, dl)) >>> 0;
      t = rotl(t, SL[i]);
      al = dl; dl = cl; cl = bl; bl = t;

      let u = (ar + X[ZR[i]]) >>> 0;
      u = (u + T64(i, br, cr, dr)) >>> 0;
      u = rotl(u, SR[i]);
      ar = dr; dr = cr; cr = br; br = u;
    }
    const t = (h[1] + cl + dr) >>> 0;
    h[1] = (h[2] + dl + ar) >>> 0;
    h[2] = (h[3] + al + br) >>> 0;
    h[3] = (h[0] + bl + cr) >>> 0;
    h[0] = t;
  }

  const out = Buffer.alloc(16);
  for (let i = 0; i < 4; i++) out.writeUInt32LE(h[i] >>> 0, i * 4);
  return out;
}

module.exports = { ripemd128 };

if (require.main === module) {
  const vec = [
    ['', 'cdf26213a150dc3ecb610f18f6b38b46'],
    ['a', '86be7afa339d0fc7cfc785e72f578d33'],
    ['abc', 'c14a12199c66e4ba84636b0f69144c77'],
    ['message digest', '9e327b3d6e523062afc1132d7df9d1b8']
  ];
  for (const [input, want] of vec) {
    const got = ripemd128(Buffer.from(input)).toString('hex');
    console.log(got === want ? 'OK  ' : 'FAIL', JSON.stringify(input), got, got === want ? '' : '!= ' + want);
  }
}
