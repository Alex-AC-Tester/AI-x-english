// 测试 anchor.js / nlpcross.js 纯函数：定位回原文的匹配边界与 AI↔NLP 冲突判定
// 沿用 test-ebook-pure.js 的抽取模式：剥掉 export/import 后整体加载（nlpcross 依赖 anchor，拼接即可）

const fs = require('fs');
const path = require('path');

const load = (file) => fs.readFileSync(path.join(__dirname, '..', 'public', 'js', file), 'utf8')
  .replace(/^import\s+.*$/gm, '')
  .replace(/^export\s+/gm, '');

const src = load('anchor.js') + '\n' + load('nlpcross.js');
const mod = { exports: {} };
new Function('module', 'exports', `${src}
module.exports = { normalizeKey, tokenize, matchItem, anchorItems, anchorStats, nlpRootVerb, aiRootVerb, crossCheckAnalysis, crossCheckArticle };`)(mod, mod.exports);
const {
  normalizeKey, matchItem, anchorItems, anchorStats, crossCheckAnalysis, crossCheckArticle
} = mod.exports;

let pass = 0, fail = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}\n      期望: ${JSON.stringify(expected)}\n      实际: ${JSON.stringify(actual)}`); }
}

const SENTENCES = [
  { index: 0, text: 'Habits emerge because the brain is constantly looking for ways to save effort.' },
  { index: 1, text: 'The process within our brains is a three-step loop.' },
  { index: 2, text: "The student's notes don't mention the cue." },
  { index: 3, text: 'First, there is a cue, a trigger that tells your brain to go into automatic mode.' }
];

console.log('=== 1. 归一化 ===');
check('弯撇号折叠', normalizeKey('Student\u2019s Notes'), "student's notes");
check('标点折叠', normalizeKey('Hello, world!'), 'hello world');

console.log('=== 2. exact 匹配 ===');
check('单词命中', matchItem('emerge', SENTENCES), { anchored: true, matchType: 'exact', sentenceIndex: 0 });
check('短语命中', matchItem('the brain is constantly looking for ways', SENTENCES), { anchored: true, matchType: 'exact', sentenceIndex: 0 });
check('大小写/标点差异命中', matchItem('The process, within our brains...', SENTENCES), { anchored: true, matchType: 'exact', sentenceIndex: 1 });
check('弯撇号词条命中', matchItem("student's notes", SENTENCES), { anchored: true, matchType: 'exact', sentenceIndex: 2 });

console.log('=== 3. fuzzy 匹配 ===');
check('词形变化 emerge→emerges 类', matchItem('emergence', SENTENCES), { anchored: true, matchType: 'fuzzy', sentenceIndex: 0 });
check('多词重合率≥60%', matchItem('the brain constantly searching for methods', SENTENCES), { anchored: true, matchType: 'fuzzy', sentenceIndex: 0 });
check('多词重合率不足→未锚定', matchItem('the brain quietly cooking dinner', SENTENCES), { anchored: false, matchType: null, sentenceIndex: null });
check('短词(<4)不模糊匹配', matchItem('at', SENTENCES), { anchored: false, matchType: null, sentenceIndex: null });

console.log('=== 4. 未锚定 ===');
check('凭空词未锚定', matchItem('quantum flux capacitor', SENTENCES), { anchored: false, matchType: null, sentenceIndex: null });
check('空串未锚定', matchItem('', SENTENCES), { anchored: false, matchType: null, sentenceIndex: null });

console.log('=== 5. anchorItems / anchorStats ===');
{
  const items = anchorItems([
    { term: 'emerge', meaning: '出现' },
    { term: 'quantum flux', meaning: '—' }
  ], SENTENCES);
  check('顺序保持且附加 anchor', [items[0].term, items[0].anchor.sentenceIndex, items[1].term, items[1].anchor.anchored], ['emerge', 0, 'quantum flux', false]);
  check('原字段保留', items[0].meaning, '出现');
  check('统计', anchorStats(items), { total: 2, hit: 1 });
}

console.log('=== 6. crossCheckAnalysis ===');
const NLP = {
  engine: 'spaCy', stats: { passive: false, question: false, clauses: 1 },
  tree: { text: 'realize', dep: 'ROOT' },
  tokens: [{ text: 'realize', dep: 'ROOT' }]
};
check('主干一致', crossCheckAnalysis(
  { translation: '他明白了。', structure: '主语+谓语', breakdown: [{ part: 'realized', role: '谓语' }] }, NLP
).verdict, 'consistent');
check('词元容忍 realized/realize', crossCheckAnalysis(
  { breakdown: [{ part: 'realized the gap', role: '谓语' }] }, NLP
).verdict, 'consistent');
{
  const r = crossCheckAnalysis(
    { breakdown: [{ part: 'saw the signal', role: '谓语' }] }, NLP
  );
  check('主干冲突', [r.verdict, r.conflicts[0].field, r.conflicts[0].nlp, r.conflicts[0].ai], ['conflict', 'root', 'realize', 'saw the signal']);
}
{
  const r = crossCheckAnalysis(
    { breakdown: [{ part: 'was received', role: '谓语' }] },
    { ...NLP, stats: { passive: true, question: false } }
  );
  check('AI 未提被动但 NLP 判被动 → 冲突', r.conflicts.some((c) => c.field === 'passive'), true);
}
check('AI 提被动则一致', crossCheckAnalysis(
  { structure: '被动语态：主语+be+过去分词', breakdown: [{ part: 'realized', role: '谓语' }] },
  { ...NLP, stats: { passive: true, question: false } }
).verdict, 'consistent');
{
  const r = crossCheckAnalysis(
    { translation: '他知道了。', breakdown: [{ part: 'knows', role: '谓语' }] },
    { ...NLP, stats: { passive: false, question: true } }
  );
  check('疑问句冲突', r.conflicts.some((c) => c.field === 'question'), true);
}
check('翻译以？结尾则一致', crossCheckAnalysis(
  { translation: '他意识到了什么？', breakdown: [{ part: 'realized', role: '谓语' }] },
  { ...NLP, stats: { passive: false, question: true } }
).verdict, 'consistent');
check('无 NLP → unknown', crossCheckAnalysis({ breakdown: [] }, null).verdict, 'unknown');
check('无 analysis → unknown', crossCheckAnalysis(null, NLP).verdict, 'unknown');
check('nlpRootVerb 回退 tokens', mod.exports.nlpRootVerb({ tokens: [{ text: 'reject', dep: 'ROOT' }] }).text, 'reject');

console.log('=== 7. crossCheckArticle ===');
check('引擎一致', crossCheckArticle({ nlp: { engine: 'spaCy/3.8.18' } }, { engine: 'spaCy/3.8.18' }).verdict, 'consistent');
check('引擎冲突', crossCheckArticle({ nlp: { engine: 'spaCy/3.8.18' } }, { engine: 'heuristic' }).verdict, 'conflict');
check('缺参 unknown', crossCheckArticle(null, { engine: 'x' }).verdict, 'unknown');

console.log(`\n=== 结果：${pass} 通过 / ${fail} 失败 ===`);
process.exit(fail ? 1 : 0);
