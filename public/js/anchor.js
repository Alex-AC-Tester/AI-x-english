// 定位回原文：把 AI 返回的重点词/长难句逐条映射回文章中的位置。
// README 研究主张之一——AI 说文中有什么，必须能在原文里指出来；
// 定位不到的条目不悄悄丢弃，而是标记 unanchored 由 UI 诚实呈现。
// 纯函数，无依赖，可被 tools/test-anchor.js 直接抽取测试。

/** 归一化：小写、弯撇号折直、非字母数字（撇号除外）折叠为单空格。保留撇号使 don't/student's 成为一个词元。 */
export function normalizeKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/[^a-z0-9']+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 词级分词 */
export function tokenize(text) {
  return normalizeKey(text).split(' ').filter(Boolean);
}

/**
 * 把单条 AI 词条/难句定位到句子列表中。
 * @param {string} item AI 返回的 term 或 text
 * @param {{index:number,text:string}[]} sentences 阅读器分句（带全文序号）
 * @returns {{anchored:boolean, matchType:'exact'|'fuzzy'|null, sentenceIndex:number|null}}
 *
 * 匹配策略（确定性，从强到弱）：
 * 1. exact：归一化后带词边界（前后补空格）的整句包含
 * 2. fuzzy（多词短语）：词级重合率 ≥ 60%
 * 3. fuzzy（单词）：与句中某词共享 ≥4 字符前缀（容忍 emerged/emerges 这类词形变化）
 */
export function matchItem(item, sentences) {
  const k = normalizeKey(item);
  if (!k || !Array.isArray(sentences)) return { anchored: false, matchType: null, sentenceIndex: null };
  const padded = ' ' + k + ' ';
  for (const s of sentences) {
    const sk = ' ' + normalizeKey(s.text) + ' ';
    if (sk.includes(padded)) return { anchored: true, matchType: 'exact', sentenceIndex: s.index };
  }
  const toks = k.split(' ');
  let best = null;
  for (const s of sentences) {
    const stoks = normalizeKey(s.text).split(' ');
    if (toks.length >= 2) {
      const hit = toks.filter((t) => stoks.includes(t)).length / toks.length;
      if (hit >= 0.6 && (!best || hit > best.hit)) best = { hit, index: s.index };
    } else if (toks[0] && toks[0].length >= 4) {
      const t = toks[0];
      if (stoks.some((w) => (w.startsWith(t) || t.startsWith(w)) && Math.min(w.length, t.length) >= 4)) {
        return { anchored: true, matchType: 'fuzzy', sentenceIndex: s.index };
      }
    }
  }
  if (best) return { anchored: true, matchType: 'fuzzy', sentenceIndex: best.index };
  return { anchored: false, matchType: null, sentenceIndex: null };
}

/**
 * 批量锚定。items 为 AI 原始对象数组（keyWords: {term,...}；hardSentences: {text,...}），
 * 返回同序新数组，每项追加 anchor 字段，原字段不动。
 * @param {{term?:string,text?:string}[]} items
 * @param {{index:number,text:string}[]} sentences
 */
export function anchorItems(items, sentences) {
  return (items || []).map((it) => {
    const label = String(it && (it.term || it.text) || '').trim();
    const m = matchItem(label, sentences);
    return { ...(it && typeof it === 'object' ? it : { term: label }), anchor: m };
  });
}

/** 汇总：一组条目中成功锚定的比例（供 UI 显示「已定位 x/y」） */
export function anchorStats(anchoredItems) {
  const total = (anchoredItems || []).length;
  const hit = (anchoredItems || []).filter((x) => x.anchor?.anchored).length;
  return { total, hit };
}
