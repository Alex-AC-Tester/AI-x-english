// 句子结构可视化：把本地 NLP 的标注映射为彩色，直接标在句中每个词上
// 两种着色模式：按词性（名词/动词/形容词…）默认；按句子成分（主语/谓语/宾语…）
// 点击任意单词可查内置词典释义。

import { modal, toast } from './ui.js';
import { addWords } from './store.js';
import { dictLookup } from './dict.js';
import { mdxLookup, mountMdxEntry } from './mdx.js';

/* ---------- 模式一：按词性（POS）着色 ---------- */
const POS_CATEGORY = {
  NOUN: 'noun', PROPN: 'noun',          // 名词 / 专有名词
  VERB: 'verb', AUX: 'verb',            // 动词 / 助动词
  ADJ: 'adj',                            // 形容词
  ADV: 'adv',                            // 副词
  PRON: 'pron',                          // 代词
  DET: 'det',                            // 限定词
  ADP: 'prep',                           // 介词
  CONJ: 'conj', SCONJ: 'conj',           // 连词 / 从属连词
  NUM: 'num',                            // 数词
  PART: 'part', INTJ: 'part', SYM: 'part', X: 'part'
};

export const POS_CATEGORIES = {
  noun:  { label: '名词', color: '#efe7d4', text: '#6b5327' },
  verb:  { label: '动词', color: '#f7ded6', text: '#983629' },
  adj:   { label: '形容词', color: '#e6ecd9', text: '#4c5c2d' },
  adv:   { label: '副词', color: '#f9ecc9', text: '#7a5a12' },
  pron:  { label: '代词', color: '#e4e8ee', text: '#3c4a5c' },
  prep:  { label: '介词', color: '#dbe8e2', text: '#2f5b4f' },
  conj:  { label: '连词', color: '#f1e2e4', text: '#7d3f4c' },
  det:   { label: '限定词', color: '#edeae1', text: '#5a5449' },
  num:   { label: '数词', color: '#e2ecdf', text: '#35603a' },
  part:  { label: '其他', color: '#eeebe2', text: '#6b675e' }
};

/* ---------- 模式二：按句子成分（依存关系）着色 ---------- */
const DEP_CATEGORY = {
  nsubj: 'subject', nsubjpass: 'subject', csubj: 'subject',
  ROOT: 'predicate', aux: 'predicate', auxpass: 'predicate', cop: 'predicate',
  dobj: 'object', iobj: 'object', attr: 'object', oprd: 'object', dative: 'object', pobj: 'object',
  acl: 'clause', advcl: 'clause', relcl: 'clause', ccomp: 'clause', xcomp: 'clause', pcomp: 'clause', mark: 'clause',
  amod: 'modifier', advmod: 'modifier', nmod: 'modifier', poss: 'modifier', compound: 'modifier',
  nummod: 'modifier', appos: 'modifier', neg: 'modifier', npadvmod: 'modifier', acomp: 'modifier', expl: 'modifier',
  prep: 'function', cc: 'function', case: 'function', det: 'function', prn: 'function', punct: 'function'
};

export const DEP_CATEGORIES = {
  subject:   { label: '主语', color: '#dfe5ef', text: '#33465f' },
  predicate: { label: '谓语', color: '#f6dbd3', text: '#9a3f2a' },
  object:    { label: '宾语', color: '#f1e4cf', text: '#7a5320' },
  clause:    { label: '从句/复杂结构', color: '#e8e1f2', text: '#54466f' },
  modifier:  { label: '修饰语', color: '#d9e8e2', text: '#2f5b4f' },
  function:  { label: '功能词', color: '#eceae3', text: '#5a564c' }
};

function posCategoryOf(t) { return POS_CATEGORY[t.pos] || 'part'; }
function depCategoryOf(t) { return DEP_CATEGORY[t.dep] || 'function'; }

/** 生成按词性着色的句子 HTML（每个词直接带底色） */
export function coloredSentenceByPos(nlp) {
  if (!nlp?.tokens?.length) return '';
  return nlp.tokens.map((t) => {
    const cat = posCategoryOf(t);
    const c = POS_CATEGORIES[cat];
    const tip = `${t.text}｜${t.posZh || t.pos}（${t.pos}）｜原形 ${t.lemma || t.text}${t.depZh ? `｜${t.depZh}` : ''}｜点击查看词典释义`;
    if (t.pos === 'PUNCT' || t.pos === 'SPACE') {
      return `<span class="viz-token" title="${escAttr(tip)}">${escHtml(t.text)}</span>`;
    }
    const lemma = String(t.lemma || t.text || '').toLowerCase().replace(/[^a-z'-]/g, '');
    return `<span class="viz-token viz-pos viz-word" data-word="${escAttr(lemma)}" style="background:${c.color};color:${c.text}" title="${escAttr(tip)}">${escHtml(t.text)}</span>`;
  }).join(' ');
}

/** 生成按句子成分着色的句子 HTML */
export function coloredSentenceByDep(nlp) {
  if (!nlp?.tokens?.length) return '';
  return nlp.tokens.map((t) => {
    const cat = depCategoryOf(t);
    const c = DEP_CATEGORIES[cat];
    const tip = `${t.text}｜${t.depZh || t.dep} → ${t.headText}｜${t.posZh || t.pos}｜点击查看词典释义`;
    if (t.pos === 'PUNCT' || t.pos === 'SPACE') {
      return `<span class="viz-token" title="${escAttr(tip)}">${escHtml(t.text)}</span>`;
    }
    const lemma = String(t.lemma || t.text || '').toLowerCase().replace(/[^a-z'-]/g, '');
    return `<span class="viz-token viz-pos viz-word" data-word="${escAttr(lemma)}" style="background:${c.color};color:${c.text}" title="${escAttr(tip)}">${escHtml(t.text)}</span>`;
  }).join(' ');
}

/** 兼容旧调用 */
export function coloredSentence(nlp) { return coloredSentenceByDep(nlp); }

/** 图例 HTML（可指定分类集） */
export function legendHTML(categories = DEP_CATEGORIES) {
  return `<div class="viz-legend">${Object.entries(categories).map(([key, c]) =>
    `<span class="viz-legend-item"><i class="viz-legend-dot" style="background:${c.color};border:1px solid ${c.text}33"></i>${c.label}</span>`
  ).join('')}</div>`;
}

/** 结构流程图 */
export function structureFlow(explanation) {
  const items = [];
  if (explanation?.structure) items.push({ text: explanation.structure, cat: 'predicate' });
  (explanation?.breakdown || []).forEach((b) => {
    const role = String(b.role || '');
    let cat = 'modifier';
    if (/主语|subject/i.test(role)) cat = 'subject';
    else if (/谓语|宾语|predicate|object/i.test(role)) cat = 'object';
    else if (/从句|定语|状语|从属|关系/i.test(role)) cat = 'clause';
    items.push({ text: `${b.part}：${role}`, cat });
  });
  if (!items.length) return '';
  return `<div class="viz-flow">${items.map((it, i) => {
    const c = DEP_CATEGORIES[it.cat];
    return `${i > 0 ? '<span class="viz-arrow">›</span>' : ''}<span class="viz-chip" style="background:${c.color};color:${c.text}">${escHtml(it.text)}</span>`;
  }).join('')}</div>`;
}

/** 依存树可读文本 */
export function treeText(nlp) {
  const root = nlp?.tree;
  if (!root) return '';
  const lines = [];
  function walk(node, indent, prefix) {
    const label = `${node.text} [${node.depZh || node.dep}]`;
    lines.push(`${indent}${prefix}${label}`);
    (node.children || []).forEach((ch) => walk(ch, indent + '  ', '├ '));
  }
  walk(root, '', '● ');
  return lines.join('\n');
}

/** 弹窗挂载后：绑定着色切换 + 点词查词典 */
export function mountVizToggles(overlay) {
  const bar = overlay.querySelector('.viz-mode-bar');
  if (bar) {
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-viz-mode]');
      if (!btn) return;
      const mode = btn.dataset.vizMode;
      bar.querySelectorAll('[data-viz-mode]').forEach((b) => b.classList.toggle('active', b.dataset.vizMode === mode));
      overlay.querySelectorAll('[data-viz-panel]').forEach((p) => {
        p.style.display = p.dataset.vizPanel === mode ? '' : 'none';
      });
    });
  }

  overlay.addEventListener('click', (e) => {
    const tok = e.target.closest('.viz-word[data-word]');
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

    // 优先展示导入的 MDX 词典（内容最完整、还原原书排版）
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

/** 完整的弹性可视化弹窗 body */
export function vizModalBody(explanation, { showWords = true } = {}) {
  const e = explanation || {};
  const hasNlp = !!(e.nlp && (e.nlp.tokens?.length || e.nlp.tree));
  const canColor = !!(e.nlp?.tokens?.length);

  let coloredBlock;
  if (canColor) {
    coloredBlock = `
      <div class="viz-mode-bar">
        <button type="button" class="viz-mode-btn active" data-viz-mode="pos">按词性着色</button>
        <button type="button" class="viz-mode-btn" data-viz-mode="dep">按句子成分着色</button>
      </div>
      <div data-viz-panel="pos">
        <div class="viz-sentence">${coloredSentenceByPos(e.nlp)}</div>
        ${legendHTML(POS_CATEGORIES)}
      </div>
      <div data-viz-panel="dep" style="display:none">
        <div class="viz-sentence">${coloredSentenceByDep(e.nlp)}</div>
        ${legendHTML(DEP_CATEGORIES)}
      </div>
      <div class="tiny muted mt8">把鼠标移到词上可看词性与原形，点击任意单词查看词典释义</div>`;
  } else {
    coloredBlock = `<div class="viz-sentence">${escHtml(e.sentence || '')}</div>
       ${hasNlp ? '' : '<div class="tiny muted mt8">本地 NLP 骨架不可用，本次为纯 AI 讲解</div>'}`;
  }

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

  const tree = e.nlp?.tree
    ? `<div class="viz-section"><h4>依存句法树（本地 spaCy）</h4><div class="viz-tree">${escHtml(treeText(e.nlp))}</div></div>` : '';

  const tip = e.tip ? `<div class="feedback mt12">${escHtml(e.tip)}</div>` : '';

  return `<div class="viz-wrap">
    ${coloredBlock}
    <div class="viz-section"><h4>翻译</h4><div class="viz-trans">${escHtml(e.translation || '')}</div></div>
    ${flow ? `<div class="viz-section"><h4>结构拆解</h4>${flow}</div>` : ''}
    ${grammar}${words}${tree}${tip}
  </div>`;
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) { return escHtml(s).replace(/"/g, '&quot;'); }
