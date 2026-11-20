// 可交互的句子结构树：依存树 + 成分树
// 只表达"哪块修饰哪块"，不标词性；悬停节点高亮原文片段，从句节点可折叠。

const CLAUSE_DEPS = new Set(['acl', 'advcl', 'relcl', 'ccomp', 'xcomp', 'pcomp', 'csubj', 'csubjpass']);

const CAT = {
  subject: { label: '主语', color: '#dfe5ef', text: '#33465f' },
  predicate: { label: '谓语', color: '#f6dbd3', text: '#9a3f2a' },
  object: { label: '宾语', color: '#f1e4cf', text: '#7a5320' },
  clause: { label: '从句', color: '#e8e1f2', text: '#54466f' },
  modifier: { label: '修饰', color: '#d9e8e2', text: '#2f5b4f' },
  function: { label: '连接', color: '#eceae3', text: '#5a564c' }
};

const DEP_CAT = {
  nsubj: 'subject', nsubjpass: 'subject', csubj: 'subject', csubjpass: 'subject',
  ROOT: 'predicate', aux: 'predicate', auxpass: 'predicate', cop: 'predicate',
  dobj: 'object', iobj: 'object', attr: 'object', oprd: 'object', dative: 'object', pobj: 'object',
  acl: 'clause', advcl: 'clause', relcl: 'clause', ccomp: 'clause', xcomp: 'clause', pcomp: 'clause',
  amod: 'modifier', advmod: 'modifier', nmod: 'modifier', poss: 'modifier', compound: 'modifier',
  nummod: 'modifier', appos: 'modifier', neg: 'modifier', npadvmod: 'modifier', acomp: 'modifier', expl: 'modifier',
  prep: 'function', cc: 'function', case: 'function', det: 'function', prn: 'function', punct: 'function'
};

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }

function catOf(dep) { return DEP_CAT[dep] || 'function'; }

/** 计算子树 token 范围（含自身） */
function spanOf(tokens, i) {
  let min = i, max = i;
  const stack = [i];
  while (stack.length) {
    const t = tokens[stack.pop()];
    if (!t) continue;
    for (const c of t.children || []) {
      if (c < min) min = c;
      if (c > max) max = c;
      stack.push(c);
    }
  }
  return [min, max];
}

function wordsOf(tokens, [start, end]) {
  return tokens.filter((t) => t.i >= start && t.i <= end && t.dep !== 'punct').map((t) => t.text).join(' ');
}

/** 原句行：每个词带序号，供悬停高亮 */
export function tokenLineHTML(nlp) {
  const tokens = nlp?.tokens || [];
  if (!tokens.length) return '';
  return `<div class="st-line" data-st-line>${tokens.map((t) =>
    `<span class="st-w" data-i="${t.i}">${esc(t.text)}</span>`).join('')}</div>`;
}

function nodeHTML(tokens, t, depth) {
  const [start, end] = spanOf(tokens, t.i);
  const cat = catOf(t.dep);
  const c = CAT[cat];
  const kids = (t.children || []).filter((i) => tokens[i]);
  const isClause = CLAUSE_DEPS.has(t.dep);
  const label = t.depZh || t.dep || '';
  const own = t.text;

  const head = `<div class="st-node${isClause ? ' st-node--clause' : ''}" data-range="${start}-${end}" data-i="${t.i}" style="--depth:${depth}">
    ${kids.length ? `<button class="st-toggle" type="button" data-st-toggle aria-label="折叠/展开">${isClause ? '▾' : '·'}</button>` : '<span class="st-toggle st-toggle--leaf"></span>'}
    <span class="st-word">${esc(own)}</span>
    <span class="st-tag" style="background:${c.color};color:${c.text}">${esc(label)}</span>
    ${kids.length ? `<span class="st-phrase">${esc(wordsOf(tokens, [start, end]).slice(0, 90))}</span>` : ''}
  </div>`;

  const childHTML = kids.length
    ? `<div class="st-kids">${kids.map((i) => nodeHTML(tokens, tokens[i], depth + 1)).join('')}</div>`
    : '';
  return head + childHTML;
}

/** 依存树：从 ROOT 递归铺开 */
export function depTreeHTML(nlp) {
  const tokens = nlp?.tokens || [];
  if (!tokens.length) return '';
  const roots = tokens.filter((t) => t.dep === 'ROOT');
  const rootList = roots.length ? roots : tokens.filter((t) => !tokens[t.head] || t.head === t.i);
  const body = rootList.map((t) => nodeHTML(tokens, t, 0)).join('');
  return `<div class="st-tree" data-st-tree>${body}</div>`;
}

/** 成分树：把主句按"主语 / 谓语 / 宾语 / 状语 / 定语 / 从句"分组 */
export function constituentHTML(nlp) {
  const tokens = nlp?.tokens || [];
  if (!tokens.length) return '';
  const root = tokens.find((t) => t.dep === 'ROOT');
  if (!root) return '';
  const kids = (root.children || []).map((i) => tokens[i]).filter(Boolean);

  const groups = [
    { key: 'subject', label: '主语', test: (t) => catOf(t.dep) === 'subject' },
    { key: 'predicate', label: '谓语', test: (t) => catOf(t.dep) === 'predicate' },
    { key: 'object', label: '宾语 / 表语', test: (t) => catOf(t.dep) === 'object' },
    { key: 'clause', label: '从句 / 非谓语', test: (t) => catOf(t.dep) === 'clause' },
    { key: 'modifier', label: '状语 / 定语', test: (t) => catOf(t.dep) === 'modifier' },
    { key: 'function', label: '连接 / 其它', test: () => true }
  ];

  const rows = [];
  const used = new Set();
  for (const g of groups) {
    const picked = kids.filter((t) => !used.has(t.i) && g.test(t));
    if (!picked.length) continue;
    picked.forEach((t) => used.add(t.i));
    const ranges = picked.map((t) => spanOf(tokens, t.i));
    const start = Math.min(...ranges.map((r) => r[0]));
    const end = Math.max(...ranges.map((r) => r[1]));
    const text = wordsOf(tokens, [start, end]);
    const c = CAT[g.key] || CAT.function;
    rows.push(`<div class="st-block" data-range="${start}-${end}">
      <span class="st-tag" style="background:${c.color};color:${c.text}">${esc(g.label)}</span>
      <span class="st-block-text">${esc(text.slice(0, 140))}</span>
    </div>`);
  }

  const rootText = root.text;
  rows.unshift(`<div class="st-block" data-range="${root.i}-${root.i}">
    <span class="st-tag" style="background:${CAT.predicate.color};color:${CAT.predicate.text}">主干</span>
    <span class="st-block-text">${esc(rootText)} · ${esc(root.depZh || '谓语')}</span>
  </div>`);

  return `<div class="st-const">${rows.join('')}</div>
    <div class="tiny muted mt8">每块就是一个成分；悬停看它在原句里占哪一段</div>`;
}

/** 整个结构卡片（两个页签 + 原句行） */
export function structPanelHTML(nlp, { loading = false } = {}) {
  if (loading) {
    return `<div class="empty" style="padding:26px 0"><span class="loading"></span><p class="tiny muted">本地 NLP 正在拆结构…</p></div>`;
  }
  if (!nlp?.tokens?.length) {
    return `<div class="empty" style="padding:26px 0"><p class="tiny muted">本地 NLP 没有返回这句的结构，先看讲解里的结构拆解</p></div>`;
  }
  const stats = nlp.stats || {};
  return `
    ${tokenLineHTML(nlp)}
    <div class="st-tabs">
      <button class="st-tab active" data-st-tab="dep" type="button">依存树</button>
      <button class="st-tab" data-st-tab="const" type="button">成分树</button>
      <span class="st-meta tiny muted">${esc(stats.sentenceType || '')} · ${stats.clauses || 0} 处从句</span>
    </div>
    <div class="st-pane" data-st-pane="dep">${depTreeHTML(nlp)}</div>
    <div class="st-pane hide" data-st-pane="const">${constituentHTML(nlp)}</div>
    <div class="tiny muted mt8">悬停节点 → 原句对应片段高亮；点 ▾ 折叠从句</div>`;
}

/** 挂载交互：页签切换、折叠、悬停高亮 */
export function mountStructPanel(host) {
  if (!host) return;

  const line = host.querySelector('[data-st-line]');
  const highlight = (range) => {
    if (!line) return;
    const [a, b] = String(range || '').split('-').map(Number);
    line.querySelectorAll('.st-w').forEach((w) => {
      const i = Number(w.dataset.i);
      w.classList.toggle('st-hl', Number.isFinite(a) && i >= a && i <= b);
    });
  };

  host.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-st-tab]');
    if (tab) {
      const name = tab.dataset.stTab;
      host.querySelectorAll('[data-st-tab]').forEach((b) => b.classList.toggle('active', b === tab));
      host.querySelectorAll('[data-st-pane]').forEach((p) => p.classList.toggle('hide', p.dataset.stPane !== name));
      return;
    }
    const tog = e.target.closest('[data-st-toggle]');
    if (tog) {
      const node = tog.closest('.st-node');
      const kids = node?.nextElementSibling;
      if (!kids || !kids.classList.contains('st-kids')) return;
      const collapsed = kids.classList.toggle('hide');
      tog.textContent = collapsed ? '▸' : '▾';
      highlight(node.dataset.range);
      e.stopPropagation();
    }
  });

  host.addEventListener('mouseover', (e) => {
    const node = e.target.closest('[data-range]');
    if (!node) return;
    highlight(node.dataset.range);
  });

  host.addEventListener('mouseleave', () => {
    line?.querySelectorAll('.st-w').forEach((w) => w.classList.remove('st-hl'));
  });
}
