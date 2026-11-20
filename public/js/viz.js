// 句子结构可视化：只画句子骨架（主句 / 从句 / 短语层次），不逐词标词性。
// 原句中的单词仍可点击查词典，但不做词性着色。

import { modal, toast } from './ui.js';
import { addWords } from './store.js';
import { dictLookup } from './dict.js';
import { mdxLookup, mountMdxEntry } from './mdx.js';

/* ---------- 结构角色配色（成分，不是词性） ---------- */
const DEP_CATEGORY = {
  nsubj: 'subject', nsubjpass: 'subject', csubj: 'subject',
  ROOT: 'predicate', aux: 'predicate', auxpass: 'predicate', cop: 'predicate',
  dobj: 'object', iobj: 'object', attr: 'object', oprd: 'object', dative: 'object', pobj: 'object',
  acl: 'clause', advcl: 'clause', relcl: 'clause', ccomp: 'clause', xcomp: 'clause', pcomp: 'clause',
  amod: 'modifier', advmod: 'modifier', nmod: 'modifier', poss: 'modifier', compound: 'modifier',
  nummod: 'modifier', appos: 'modifier', neg: 'modifier', npadvmod: 'modifier', acomp: 'modifier', expl: 'modifier',
  prep: 'function', cc: 'function', case: 'function', det: 'function', prn: 'function', punct: 'function'
};

export const DEP_CATEGORIES = {
  subject:   { label: '主语', color: '#dfe5ef', text: '#33465f' },
  predicate: { label: '谓语', color: '#f6dbd3', text: '#9a3f2a' },
  object:    { label: '宾语/表语', color: '#f1e4cf', text: '#7a5320' },
  clause:    { label: '从句', color: '#e8e1f2', text: '#54466f' },
  modifier:  { label: '修饰', color: '#d9e8e2', text: '#2f5b4f' },
  function:  { label: '连接', color: '#eceae3', text: '#5a564c' },
  phrase:    { label: '短语', color: '#e9ece9', text: '#4a5248' }
};

/** 从句类依存关系：出现即视为一层从句/非谓语结构 */
const CLAUSE_DEPS = new Set(['acl', 'advcl', 'relcl', 'ccomp', 'xcomp', 'pcomp', 'csubj', 'csubjpass']);

function depCategoryOf(dep) { return DEP_CATEGORY[dep] || 'function'; }

/** 原句：单词可点击查词，但不做任何词性标注或着色 */
export function plainSentence(nlp) {
  const tokens = nlp?.tokens;
  if (!Array.isArray(tokens) || !tokens.length) return '';
  return tokens.map((t) => {
    const lemma = String(t.lemma || t.text || '').toLowerCase().replace(/[^a-z'-]/g, '');
    if (!lemma || t.pos === 'PUNCT' || t.pos === 'SPACE' || t.pos === 'SYM') {
      return `<span class="viz-plain">${escHtml(t.text)}</span>`;
    }
    return `<span class="viz-plain viz-plain-word" data-word="${escAttr(lemma)}" title="${escAttr(`点击查「${t.text}」的词典释义`)}">${escHtml(t.text)}</span>`;
  }).join(' ');
}

/** 计算某 token 的子树范围（最小/最大 token 序号） */
function subtreeRange(tokens, startIndex) {
  let min = startIndex;
  let max = startIndex;
  const stack = [startIndex];
  while (stack.length) {
    const i = stack.pop();
    const t = tokens[i];
    if (!t) continue;
    for (const c of t.children || []) {
      if (c < min) min = c;
      if (c > max) max = c;
      stack.push(c);
    }
  }
  return [min, max];
}

/**
 * 结构大纲：主句 + 逐层从句，按嵌套深度缩进。
 * 只讲"这句由哪几块组成、谁修饰谁"，不拆到词性。
 */
export function structureOutline(nlp) {
  const tokens = nlp?.tokens;
  if (!Array.isArray(tokens) || !tokens.length) return null;

  const rootTok = tokens.find((t) => t.dep === 'ROOT') || null;
  const mainRange = rootTok ? subtreeRange(tokens, rootTok.i) : null;

  const clauses = tokens
    .filter((t) => CLAUSE_DEPS.has(t.dep))
    .map((t) => {
      const [start, end] = subtreeRange(tokens, t.i);
      const text = tokens.filter((x) => x.i >= start && x.i <= end).map((x) => x.text).join(' ');
      return {
        start, end,
        head: t.headText,
        dep: t.dep,
        label: t.depZh || t.dep,
        text: text.length > 180 ? `${text.slice(0, 180)}…` : text
      };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  // 同一范围的重复结构只留一个
  const unique = [];
  for (const c of clauses) {
    if (unique.some((u) => u.start === c.start && u.end === c.end)) continue;
    unique.push(c);
  }

  // 深度 = 被多少个其它结构完整包住
  unique.forEach((c) => {
    c.depth = unique.filter((o) => o !== c && o.start <= c.start && o.end >= c.end && (o.start < c.start || o.end > c.end)).length;
  });

  const mainText = mainRange
    ? tokens.filter((x) => x.i >= mainRange[0] && x.i <= mainRange[1]).map((x) => x.text).join(' ')
    : '';

  return { root: rootTok, mainText, clauses: unique };
}

/** 结构大纲 HTML */
export function structureTreeHTML(nlp) {
  const outline = structureOutline(nlp);
  if (!outline) return '';
  const rows = [];
  if (outline.mainText) {
    rows.push(`<div class="struct-row" style="--depth:0">
      <span class="struct-chip" style="background:${DEP_CATEGORIES.predicate.color};color:${DEP_CATEGORIES.predicate.text}">主句</span>
      <span class="struct-text">${escHtml(outline.mainText.slice(0, 220))}</span>
    </div>`);
  }
  for (const c of outline.clauses) {
    const cat = DEP_CATEGORIES.clause;
    rows.push(`<div class="struct-row" style="--depth:${Math.min(c.depth + 1, 4)}">
      <span class="struct-chip" style="background:${cat.color};color:${cat.text}">${escHtml(c.label)}</span>
      <span class="struct-text">${escHtml(c.text)}</span>
    </div>`);
  }
  if (!rows.length) return '';
  return `<div class="struct-tree">${rows.join('')}</div>
    <div class="tiny muted mt8">缩进表示层级：越往右，修饰的是左边最近的那一层结构</div>`;
}

/** AI 给出的结构拆解（主句 + 各成分作用） */
export function structureFlow(explanation) {
  const items = [];
  if (explanation?.structure) items.push({ text: explanation.structure, cat: 'predicate' });
  (explanation?.breakdown || []).forEach((b) => {
    const role = String(b.role || '');
    let cat = 'modifier';
    if (/主语|subject/i.test(role)) cat = 'subject';
    else if (/谓语|宾语|表语|predicate|object/i.test(role)) cat = 'object';
    else if (/从句|定语|状语|从属|关系/i.test(role)) cat = 'clause';
    items.push({ text: `${b.part}：${role}`, cat });
  });
  if (!items.length) return '';
  return `<div class="viz-flow">${items.map((it, i) => {
    const c = DEP_CATEGORIES[it.cat];
    return `${i > 0 ? '<span class="viz-arrow">›</span>' : ''}<span class="viz-chip" style="background:${c.color};color:${c.text}">${escHtml(it.text)}</span>`;
  }).join('')}</div>`;
}

/** 纯文本层级（导出用） */
export function structureText(nlp) {
  const outline = structureOutline(nlp);
  if (!outline) return '';
  const lines = [];
  if (outline.mainText) lines.push(`● 主句：${outline.mainText}`);
  outline.clauses.forEach((c) => {
    lines.push(`${'  '.repeat(Math.min(c.depth + 1, 4))}└ ${c.label}：${c.text}`);
  });
  return lines.join('\n');
}

/** 弹窗挂载后：绑定点词查词典 */
export function mountVizToggles(overlay) {
  overlay.addEventListener('click', (e) => {
    const tok = e.target.closest('.viz-plain-word[data-word]');
    if (!tok) return;
    const word = String(tok.dataset.word || '').toLowerCase();
    if (!/^[a-z][a-z'-]*$/.test(word)) return;
    showWordDetail(word, tok);
  });
}

async function showWordDetail(word, anchor) {
  anchor.classList.add('viz-looking');
  try {
    const [mdxEntry, d] = await Promise.all([mdxLookup(word), dictLookup(word)]);
    if (!mdxEntry && !d) {
      toast(`词典未收录「${word}」，可到查词页让 AI 深度讲解`, 'info', 3200);
      return;
    }

    const term = d?.term || mdxEntry?.key || word;
    const meaning = d ? ((d.meanings || []).join('；') || d.definition || '') : '';
    const addAction = {
      label: '加入我的词库',
      cls: 'btn-primary',
      keepOpen: true,
      onClick: (_ov, done) => {
        const r = addWords([{
          term,
          phonetic: d?.phonetic || '',
          pos: d?.pos || '',
          meaning: meaning || (mdxEntry ? `${mdxEntry.dict.name} 词条` : ''),
          source: { type: 'dict', at: new Date().toISOString() }
        }]);
        toast(r.added ? `「${term}」已加入词库` : `「${term}」已在词库，已更新`, 'success');
        done('added');
      }
    };

    if (mdxEntry) {
      const head = `
        <div class="mdx-entry-head">
          <span class="mdx-entry-word">${escHtml(term)}</span>
          ${d?.phonetic ? `<span class="dict-ph" style="margin:0">${escHtml(d.phonetic)}</span>` : ''}
          <span class="mdx-tag">${escHtml(mdxEntry.dict.name)}${mdxEntry.matched === 'variant' ? ` · 原形 ${escHtml(mdxEntry.key)}` : ''}</span>
        </div>
        ${meaning ? `<div class="small muted" style="margin:-2px 0 12px">${escHtml(meaning.slice(0, 140))}</div>` : ''}`;
      await modal({
        title: '单词详解',
        wide: true,
        body: `${head}<div data-mdx-host></div>`,
        onMount: (ov) => mountMdxEntry(ov.querySelector('[data-mdx-host]'), mdxEntry, {
          maxHeight: Math.round(window.innerHeight * 0.62)
        }),
        actions: [{ label: '关闭' }, addAction]
      });
      return;
    }

    const body = `<div class="dict-card">
      <div class="dict-head">
        <div class="dict-term">${escHtml(d.term)}</div>
        ${d.phonetic ? `<div class="dict-ph">${escHtml(d.phonetic)}</div>` : ''}
        ${d.pos ? `<span class="pill">${escHtml(d.pos)}</span>` : ''}
      </div>
      <div class="dict-meanings">${(d.meanings || []).map((m, i) =>
        `<div class="dict-mean"><span>${i + 1}</span><div>${escHtml(m)}</div></div>`).join('')}</div>
      ${d.definition ? `<div class="dict-en">${escHtml(d.definition)}</div>` : ''}
      ${d.exchange ? `<div class="dict-ex">词形变化：${escHtml(String(d.exchange).replace(/\|/g, ' · '))}</div>` : ''}
      ${d.tags?.length ? `<div class="dict-tags">${d.tags.map((t) => `<span class="pill">${escHtml(t)}</span>`).join('')}</div>` : ''}
    </div>`;
    await modal({
      title: '单词详解 · 内置词典',
      body,
      actions: [{ label: '关闭' }, addAction]
    });
  } catch (err) {
    toast(`词典查询失败：${err.message}`, 'error');
  } finally {
    anchor.classList.remove('viz-looking');
  }
}

/** 完整的弹性可视化弹窗 body：只展示结构，不展示词性 */
export function vizModalBody(explanation, { showWords = true } = {}) {
  const e = explanation || {};
  const hasTokens = !!(e.nlp?.tokens?.length);

  const sentenceBlock = hasTokens
    ? `<div class="viz-sentence">${plainSentence(e.nlp)}</div>
       <div class="tiny muted mt8">点击任意单词查看词典释义</div>`
    : `<div class="viz-sentence">${escHtml(e.sentence || '')}</div>
       <div class="tiny muted mt8">本地 NLP 骨架不可用，本次为纯 AI 讲解</div>`;

  const tree = hasTokens ? structureTreeHTML(e.nlp) : '';
  const flow = structureFlow(e);

  const grammar = (e.grammar || []).length
    ? `<div class="viz-section"><h4>语法点</h4>${e.grammar.map((g) =>
        `<div class="grammar-item"><b>${escHtml(g.point)}</b>：${escHtml(g.explain)}</div>`).join('')}</div>` : '';

  const words = showWords && (e.words || []).length
    ? `<div class="viz-section"><h4>重点词汇</h4><div class="viz-word-grid">${e.words.map((w) =>
        `<div class="viz-word-card"><div class="row spread"><b>${escHtml(w.term)}</b>
          <span class="word-level ${w.level === '核心' ? 'core' : w.level === '进阶' ? 'adv' : 'ext'}">${escHtml(w.level || '核心')}</span></div>
          ${w.phonetic ? `<div class="tiny muted">${escHtml(w.phonetic)} ${escHtml(w.pos || '')}</div>` : ''}
          <div class="small">${escHtml(w.meaning)}</div></div>`).join('')}</div></div>` : '';

  const tip = e.tip ? `<div class="feedback mt12">${escHtml(e.tip)}</div>` : '';

  return `<div class="viz-wrap">
    <div class="viz-section"><h4>原句</h4>${sentenceBlock}</div>
    ${tree ? `<div class="viz-section"><h4>结构层次（本地 NLP）</h4>${tree}</div>` : ''}
    <div class="viz-section"><h4>翻译</h4><div class="viz-trans">${escHtml(e.translation || '')}</div></div>
    ${flow ? `<div class="viz-section"><h4>结构拆解</h4>${flow}</div>` : ''}
    ${grammar}${words}${tip}
  </div>`;
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) { return escHtml(s).replace(/"/g, '&quot;'); }
