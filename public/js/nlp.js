// 本地 NLP 句法分析客户端：调用服务端 /api/nlp，失败安全降级（返回 null）
// 带客户端缓存（README「复用缓存」）：同一句/同一篇文章重复分析直接命中，不再重复请求。
// 失败结果（null）不缓存——服务恢复后下次会重试。

import { normalizeKey } from './anchor.js';

const MAX_SENTENCE_CACHE = 60;
const sentenceCache = new Map();   // 归一化句子 → 分析结果
let articleCache = null;           // 文章级结果较大，只存最近一篇（单槽）

/** 分析单句，返回结构化句法骨架；NLP 不可用时返回 null */
export async function nlpSentence(text) {
  const key = normalizeKey(text);
  if (key && sentenceCache.has(key)) return sentenceCache.get(key);
  try {
    const res = await fetch('/api/nlp/analyze-sentence', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.ok ? data : null;
    if (key && result) {
      if (sentenceCache.size > MAX_SENTENCE_CACHE) sentenceCache.clear();
      sentenceCache.set(key, result);
    }
    return result;
  } catch (_) { return null; }
}

/** 批量分析文章句子，返回句法概览；失败返回 null（同文同参命中单槽缓存） */
export async function nlpArticle(text, maxSentences = 80) {
  const key = normalizeKey(text);
  if (key && articleCache && articleCache.key === key && articleCache.max === maxSentences) {
    return articleCache.result;
  }
  try {
    const res = await fetch('/api/nlp/analyze-text', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, maxSentences })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.ok ? data : null;
    if (key && result) articleCache = { key, max: maxSentences, result };
    return result;
  } catch (_) { return null; }
}

/** 查询 NLP 服务状态 */
export async function nlpStatus() {
  try {
    const res = await fetch('/api/nlp/status');
    return await res.json();
  } catch (_) { return { ok: false, available: false }; }
}

/** 把 NLP 结果转成注入 prompt 的参考文本（优先 preview，含明确指令） */
export function syntaxHint(nlpResult) {
  if (!nlpResult) return '';
  const preview = nlpResult.preview || '';
  if (!preview) return '';
  return `${preview}\n\n【使用要求】以上是本地 spaCy 引擎对该句的确定性句法分析结果。请以它为基础校准你的结构拆解与语法判断：\n- 若你的分析与它一致，直接采用；\n- 若不一致，仔细复核原文，多数情况下应优先采信 NLP 的主干/依存/从句划分；\n- 最终输出仍用你自己的 JSON 格式，不要输出这段参考文本。`;
}
