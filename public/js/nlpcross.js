// AI↔NLP 交叉校验：把 README「两者不一致时以句法结果为准」的承诺落成代码级检测。
// 对比三个可靠维度：主干动词 / 被动语态 / 疑问句。
// 本模块只做检测与标注，不改写 AI 文本；冲突处的「采信 NLP」由 UI 并排展示、标明采信方。
// 纯函数，无依赖，可被 tools/test-anchor.js 直接抽取测试。

import { normalizeKey, tokenize } from './anchor.js';

/** NLP 依存树中 dep==='ROOT' 的词（找不到时回退 tokens 中 dep 为 ROOT 的项） */
export function nlpRootVerb(nlpResult) {
  const tree = nlpResult?.tree;
  if (tree && normalizeKey(tree.text)) return { text: tree.text, dep: 'ROOT' };
  const hit = (nlpResult?.tokens || []).find((t) => t.dep === 'ROOT');
  return hit ? { text: hit.text, dep: 'ROOT' } : null;
}

/** AI 侧主干动词：breakdown 中 role 含「谓语/主干/核心动词」的 part */
export function aiRootVerb(analysis) {
  const hit = (analysis?.breakdown || []).find((b) =>
    /谓语|主干|核心动词|主要动词/.test(String(b?.role || ''))
  );
  return hit ? String(hit.part || '').trim() : null;
}

function lemmaish(a, b) {
  // 词元级宽松比较：任一方包含对方（≥4 字符），或共享 ≥4 字符前缀
  const x = normalizeKey(a).split(' ');
  const y = normalizeKey(b).split(' ');
  for (const t1 of x) {
    for (const t2 of y) {
      if (t1 === t2) return true;
      if (t1.length >= 4 && t2.length >= 4 && (t1.startsWith(t2) || t2.startsWith(t1))) return true;
    }
  }
  return false;
}

function aiMentions(analysis, re) {
  const hay = [
    analysis?.structure || '',
    ...(analysis?.breakdown || []).map((b) => `${b?.part || ''} ${b?.role || ''}`),
    ...(analysis?.grammar || []).map((g) => `${g?.point || ''} ${g?.explain || ''}`)
  ].join(' ');
  return re.test(normalizeKey(hay)) || re.test(String(hay));
}

/**
 * 单句级交叉校验。
 * @param {object|null} analysis normalizeAnalysis 的产物（coach 最终讲解）
 * @param {object|null} nlpResult /api/nlp/analyze-sentence 的产物
 * @returns {{verdict:'unknown'|'consistent'|'conflict', conflicts:Array<{field:string,nlp:string,ai:string}>}}
 */
export function crossCheckAnalysis(analysis, nlpResult) {
  if (!analysis || !nlpResult) return { verdict: 'unknown', conflicts: [] };
  const conflicts = [];

  // 1. 主干动词
  const nlpRoot = nlpRootVerb(nlpResult);
  const aiRoot = aiRootVerb(analysis);
  if (nlpRoot?.text && aiRoot && !lemmaish(nlpRoot.text, aiRoot)) {
    conflicts.push({ field: 'root', nlp: nlpRoot.text, ai: aiRoot });
  }

  // 2. 被动语态
  const st = nlpResult.stats || {};
  if (typeof st.passive === 'boolean') {
    const aiPassive = aiMentions(analysis, /被动|be\s+done|过去分词/i);
    if (st.passive !== aiPassive) {
      conflicts.push({
        field: 'passive',
        nlp: st.passive ? '被动语态' : '非被动',
        ai: aiPassive ? '按被动讲解' : '未按被动讲解'
      });
    }
  }

  // 3. 疑问句
  if (typeof st.question === 'boolean') {
    const translation = String(analysis?.translation || '').trim();
    const aiQuestion = translation.endsWith('？') || aiMentions(analysis, /疑问|问句|疑问词/);
    if (st.question !== aiQuestion) {
      conflicts.push({
        field: 'question',
        nlp: st.question ? '疑问句' : '非疑问句',
        ai: aiQuestion ? '按疑问句讲解' : '未按疑问句讲解'
      });
    }
  }

  return { verdict: conflicts.length ? 'conflict' : 'consistent', conflicts };
}

/** 文章级汇总：全文分析对象上逐维度聚合（当前仅记录 NLP 引擎元信息一致性） */
export function crossCheckArticle(analysis, nlpMeta) {
  if (!analysis || !nlpMeta) return { verdict: 'unknown', conflicts: [] };
  const conflicts = [];
  if (analysis.nlp?.engine && nlpMeta.engine && analysis.nlp.engine !== nlpMeta.engine) {
    conflicts.push({ field: 'engine', nlp: nlpMeta.engine, ai: analysis.nlp.engine });
  }
  return { verdict: conflicts.length ? 'conflict' : 'consistent', conflicts };
}
