// 长难句识别：本地 NLP 打分，按篇幅挑出最难的几句
// 只用句法统计（长度 / 从句数 / 嵌套 / 被动 / 结构标记），不做词性标注。

import { nlpArticle } from './nlp.js';

/** 结构性标记：出现即说明句子有额外层次 */
const MARKERS = [
  /\b(although|though|even though|whereas|while|where)\b/i,
  /\b(that|which|who|whom|whose)\b/i,
  /\b(because|since|unless|until|in case|so that|such that)\b/i,
  /\b(not only|but also|either|neither|rather than|no sooner|hardly|scarcely)\b/i,
  /\b(having|being|done|given)\s+\w+/i,          // 完成式分词
  /\b(to\s+(?:have\s+)?\w+)\b/i,                  // 不定式短语
  /[,;:—–]\s*[A-Za-z]/,                           // 多重逗号 / 破折号
  /\b(what|whether|how|why|whoever|whatever)\b/i  // 名词性从句引导
];

/** 去掉标点与大小写，用于把本地 NLP 的句子和阅读器的句子对上 */
export function sentenceKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countEnWords(text) {
  return (String(text || '').match(/[A-Za-z][A-Za-z'’-]*/g) || []).length;
}

function markerHits(text) {
  return MARKERS.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
}

/** 只用文本特征打分（NLP 不可用时的兜底） */
export function heuristicScore(text) {
  const words = countEnWords(text);
  if (words < 10) return 0;
  let score = (words - 10) * 1.5;
  score += markerHits(text) * 9;
  const commas = (String(text).match(/[,;:—–]/g) || []).length;
  score += Math.max(0, commas - 1) * 3;
  return score;
}

/** 把本地 NLP 的逐句统计建索引，容忍分句差异 */
function indexNlp(nlpResult) {
  const exact = new Map();
  const loose = [];
  for (const s of nlpResult?.sentences || []) {
    if (!s?.ok || !s.stats) continue;
    const k = sentenceKey(s.sentence);
    if (!k || k.length < 8) continue;
    exact.set(k, s.stats);
    loose.push({ key: k, stats: s.stats });
  }
  return { exact, loose };
}

function lookupStats(index, text) {
  const k = sentenceKey(text);
  if (!k) return null;
  if (index.exact.has(k)) return index.exact.get(k);
  for (const item of index.loose) {
    const a = item.key;
    if (a === k) return item.stats;
    if (a.length > 20 && k.length > 20) {
      if (a.includes(k) || k.includes(a)) return item.stats;
    }
  }
  return null;
}

/** 生成一句的中文难度说明 */
function reasonOf(stats, text) {
  const words = stats?.words || countEnWords(text);
  const parts = [`${words} 词`];
  if (stats?.clauses) parts.push(`${stats.clauses} 处从句/嵌套`);
  if (stats?.passive) parts.push('被动语态');
  if (stats?.complexity) parts.push(stats.complexity);
  else if (markerHits(text) >= 2) parts.push('多结构标记');
  return parts.join(' · ');
}

/**
 * 按篇幅决定挑几句：平均每 100-500 词一句，随文章长度自动增减
 * - 短文（<=100 词）至少 1 句
 * - 中等文章每 250 词左右 1 句
 * - 长文最多 8 句，避免整页都是下划线
 */
export function hardSentenceLimit(totalWords) {
  const w = Math.max(0, Number(totalWords) || 0);
  if (w <= 0) return 1;
  return Math.max(1, Math.min(8, Math.round(w / 250)));
}

/**
 * 从一组句子中挑出最难的前 N 句。
 * @param {{index:number,text:string}[]} sentences 阅读器分句结果（带全文序号）
 * @param {object|null} nlpResult /api/nlp/analyze-text 的返回
 * @param {number|null} limit 不传则按全文词数自动决定
 */
export function pickHardSentences(sentences, nlpResult, limit = null) {
  const totalWords = sentences.reduce((n, s) => n + countEnWords(s.text), 0);
  const cap = Math.max(1, Number(limit) || hardSentenceLimit(totalWords));
  const index = indexNlp(nlpResult);
  const scored = sentences.map((s) => {
    const stats = lookupStats(index, s.text);
    const words = stats?.words || countEnWords(s.text);
    if (words < 10) return null;
    let score = heuristicScore(s.text);
    if (stats) {
      score = Math.max(score, (words - 10) * 1.5) + (stats.clauses || 0) * 14;
      if (stats.complexity === '复杂') score += 18;
      else if (stats.complexity === '中等') score += 7;
      if (stats.clause && stats.clause > 2) score += (stats.clause - 2) * 4;
    }
    return {
      index: s.index,
      text: String(s.text || '').trim(),
      score: Math.round(score * 10) / 10,
      words,
      clauses: stats?.clauses || 0,
      complexity: stats?.complexity || '',
      sentenceType: stats?.sentenceType || '',
      reason: reasonOf(stats, s.text),
      source: stats ? 'nlp' : 'heuristic'
    };
  }).filter(Boolean);

  // 相邻句子容易重复（同一处嵌套被切开），保留高分者
  scored.sort((a, b) => b.score - a.score);
  const picked = [];
  for (const item of scored) {
    if (picked.length >= cap) break;
    if (picked.some((p) => Math.abs(p.index - item.index) === 1 && Math.abs(p.score - item.score) < 2)) continue;
    picked.push(item);
  }
  return picked.sort((a, b) => a.index - b.index);
}

/** 文章内容指纹：文本变了就重新识别 */
export function articleHash(text) {
  const s = String(text || '');
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return `${s.length}-${h.toString(36)}`;
}

/** 识别一篇文章的长难句：优先本地 NLP，失败退回文本启发式 */
export async function detectHardSentences(sentences, text, limit = null) {
  let nlpResult = null;
  try {
    if (text) nlpResult = await nlpArticle(text, 120);
  } catch (_) {
    nlpResult = null;
  }
  const totalWords = countEnWords(text) || sentences.reduce((n, s) => n + countEnWords(s.text), 0);
  const cap = Math.max(1, Number(limit) || hardSentenceLimit(totalWords));
  const picked = pickHardSentences(sentences, nlpResult, cap);
  return {
    items: picked,
    limit: cap,
    totalWords,
    engine: nlpResult ? nlpResult.engine : 'heuristic',
    at: new Date().toISOString()
  };
}
