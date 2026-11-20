// 回译对照：看中文、写英文、交卷后做词级 diff
// diff 用 LCS，错误按 时态 / 词序 / 搭配 / 用词 / 遗漏 粗分类，结果记入 attempts 供统计。

import { modal, toast, uid, dateKey } from './ui.js';
import { saveAttempt, logActivity } from './store.js';

const IRREGULAR = {
  went: 'go', gone: 'go', goes: 'go', was: 'be', were: 'be', been: 'be', being: 'be', is: 'be', are: 'be', am: 'be',
  had: 'have', has: 'have', having: 'have', did: 'do', does: 'do', done: 'do', doing: 'do',
  made: 'make', took: 'take', taken: 'take', saw: 'see', seen: 'see', said: 'say', wrote: 'write', written: 'write',
  thought: 'think', brought: 'bring', bought: 'buy', found: 'find', gave: 'give', given: 'give',
  knew: 'know', known: 'know', began: 'begin', begun: 'begin', became: 'become', came: 'come',
  went: 'go', grew: 'grow', grown: 'grow', held: 'hold', kept: 'keep', left: 'leave', lost: 'lose',
  met: 'meet', paid: 'pay', put: 'put', read: 'read', ran: 'run', sent: 'send', sat: 'sit', spoke: 'speak',
  spoken: 'speak', spent: 'spend', stood: 'stand', taught: 'teach', told: 'tell', understood: 'understand',
  won: 'win', wore: 'wear', worn: 'wear'
};

const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'about', 'as', 'into',
  'that', 'which', 'who', 'whom', 'whose', 'and', 'but', 'or', 'so', 'if', 'because', 'although', 'while',
  'is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does', 'did', 'have', 'has', 'had',
  'will', 'would', 'can', 'could', 'may', 'might', 'must', 'should', 'not', 'no', 'there', 'it'
]);

const TENSE_SUFFIX = /(ed|ing|s|es|d)$/;

export function tokenize(text) {
  return String(text || '')
    .replace(/[’]/g, "'")
    .split(/\s+/)
    .map((raw) => {
      const display = raw;
      const core = raw.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
      return core ? { display, core } : null;
    })
    .filter(Boolean);
}

export function lemmaOf(word) {
  const w = String(word || '').toLowerCase().replace(/'s$/, '');
  if (IRREGULAR[w]) return IRREGULAR[w];
  if (w.length > 4 && TENSE_SUFFIX.test(w)) {
    if (w.endsWith('ies')) return `${w.slice(0, -3)}y`;
    if (w.endsWith('ing')) return w.slice(0, -3).replace(/(.)\1$/, '$1');
    if (w.endsWith('ed')) return w.slice(0, -2).replace(/(.)\1$/, '$1');
    if (w.endsWith('es')) return w.slice(0, -2);
    if (w.endsWith('s')) return w.slice(0, -1);
  }
  return w;
}

/** 词级 LCS diff：equal / del（参考有、你没写）/ ins（你多写的） */
export function diffWords(reference, attempt) {
  const ref = tokenize(reference);
  const mine = tokenize(attempt);
  const a = ref.map((t) => t.core);
  const b = mine.map((t) => t.core);
  const n = a.length, m = b.length;

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ type: 'equal', ref: ref[i].display, mine: mine[j].display }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: 'del', ref: ref[i].display }); i++; }
    else { out.push({ type: 'ins', mine: mine[j].display }); j++; }
  }
  while (i < n) { out.push({ type: 'del', ref: ref[i++].display }); }
  while (j < m) { out.push({ type: 'ins', mine: mine[j++].display }); }

  const matched = out.filter((d) => d.type === 'equal').length;
  const denom = Math.max(n, m);
  const score = denom ? Math.round((matched / denom) * 100) : 100;
  return { ops: out, score, refCount: n, mineCount: m, matched };
}

/** 按 diff 结果粗分错误类型 */
export function classifyErrors(reference, attempt, diff) {
  const ref = tokenize(reference).map((t) => t.core);
  const mine = tokenize(attempt).map((t) => t.core);
  const types = new Map();
  const add = (name, n = 1) => types.set(name, (types.get(name) || 0) + n);
  const AUX = new Set(['have', 'has', 'had', 'be', 'is', 'am', 'are', 'was', 'were', 'been', 'being', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must']);

  // 多重集合差：按出现次数算，避免重复词影响判断
  const missing = [];
  const pool = new Map();
  ref.forEach((w) => pool.set(w, (pool.get(w) || 0) + 1));
  mine.forEach((w) => { const n = pool.get(w) || 0; if (n > 0) pool.set(w, n - 1); });
  for (const [w, n] of pool) for (let k = 0; k < n; k++) missing.push(w);

  const extra = [];
  const pool2 = new Map();
  mine.forEach((w) => pool2.set(w, (pool2.get(w) || 0) + 1));
  ref.forEach((w) => { const n = pool2.get(w) || 0; if (n > 0) pool2.set(w, n - 1); });
  for (const [w, n] of pool2) for (let k = 0; k < n; k++) extra.push(w);

  // 词序：词形完全一样，只是顺序不同
  const sameBag = ref.slice().sort().join(' ') === mine.slice().sort().join(' ');
  if (sameBag && ref.join(' ') !== mine.join(' ')) add('词序');

  // 时态 / 词形：丢了助动词，或同一个词根换了形态
  let tenseHits = missing.filter((w) => AUX.has(w)).length;
  const refLemmas = new Map();
  ref.forEach((w) => refLemmas.set(lemmaOf(w), w));
  for (const w of mine) {
    const l = lemmaOf(w);
    const refWord = refLemmas.get(l);
    if (refWord && refWord !== w && !sameBag) tenseHits++;
  }
  if (tenseHits) add('时态/词形', tenseHits);

  // 搭配：漏了介词 / 冠词 / 连词（助动词已算在时态里）
  const missingFunc = missing.filter((w) => FUNCTION_WORDS.has(w) && !AUX.has(w));
  if (missingFunc.length) add('搭配', missingFunc.length);

  // 遗漏 / 多余
  const missingContent = missing.filter((w) => !FUNCTION_WORDS.has(w));
  if (missingContent.length) add('遗漏', missingContent.length);
  if (extra.length) add('多余', extra.length);
  if (!types.size && diff.score < 100) add('用词');

  return [...types.entries()].map(([type, count]) => ({ type, count }));
}

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function diffHTML(ops) {
  const body = ops.map((d) => {
    if (d.type === 'equal') return `<span class="bt-eq">${esc(d.ref)}</span>`;
    if (d.type === 'del') return `<del class="bt-del" title="这里少了">${esc(d.ref)}</del>`;
    return `<ins class="bt-ins" title="这里多写了">${esc(d.mine)}</ins>`;
  }).join(' ');
  return `<div class="bt-diff">${body || '<span class="tiny muted">（空）</span>'}</div>`;
}

function chipHTML(types) {
  if (!types.length) return `<span class="bt-chip bt-chip--ok">没有发现明显差异</span>`;
  return types.map((t) => `<span class="bt-chip">${esc(t.type)} · ${t.count}</span>`).join('');
}

/**
 * 打开回译练习弹窗
 * @param {{sentence:string, translation:string, articleId?:string, index?:number, onSaved?:Function}} opts
 */
export function openBacktrans({ sentence, translation, articleId = null, index = -1, onSaved } = {}) {
  if (!translation) { toast('这句还没有中文译文，先精读一次', 'info'); return; }
  const ref = String(sentence || '');

  const body = `
    <div class="bt-wrap">
      <div class="bt-zh">
        <div class="bt-label">中文译文</div>
        <p>${esc(translation)}</p>
      </div>
      <label class="bt-label" for="btInput">写出对应的英文（原句已遮住）</label>
      <textarea class="textarea" id="btInput" rows="4" placeholder="凭记忆和理解写，写完再对照…"></textarea>
      <div class="row mt12">
        <button class="btn btn-primary" data-bt="submit">提交比对</button>
        <button class="btn btn-sm btn-ghost" data-bt="reveal">我写不出来，看原句</button>
      </div>
      <div class="bt-result hide" data-bt-result></div>
    </div>`;

  return modal({
    title: '回译对照',
    wide: true,
    body,
    actions: [{ label: '关闭' }],
    onMount: (overlay) => {
      const input = overlay.querySelector('#btInput');
      const result = overlay.querySelector('[data-bt-result]');
      let submitted = false;

      const render = (attemptText) => {
        const diff = diffWords(ref, attemptText);
        const types = classifyErrors(ref, attemptText, diff);
        result.innerHTML = `
          <div class="bt-score">
            <b>${diff.score}%</b>
            <span class="tiny muted">词级吻合 ${diff.matched}/${diff.refCount}</span>
          </div>
          <div class="row" style="flex-wrap:wrap;gap:6px;margin:10px 0">${chipHTML(types)}</div>
          <div class="bt-label">逐词对照（红色＝参考里有你没写，橙色＝你多写）</div>
          ${diffHTML(diff.ops)}
          <div class="bt-label" style="margin-top:12px">参考原句</div>
          <div class="bt-ref">${esc(ref)}</div>`;
        result.classList.remove('hide');

        const attempt = {
          id: uid('bt_'),
          type: 'backtranslate',
          articleId,
          sentenceIndex: index,
          sentence: ref,
          translation,
          response: attemptText,
          score: diff.score,
          errorTypes: types,
          at: new Date().toISOString()
        };
        saveAttempt(attempt);
        logActivity(dateKey(), { questions: 1, correct: diff.score >= 80 ? 1 : 0 });
        onSaved?.(attempt);
      };

      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-bt]');
        if (!btn) return;
        if (btn.dataset.bt === 'reveal') {
          result.innerHTML = `<div class="bt-label">参考原句</div><div class="bt-ref">${esc(ref)}</div>`;
          result.classList.remove('hide');
          return;
        }
        if (btn.dataset.bt === 'submit') {
          const text = String(input.value || '').trim();
          if (!text) { toast('先写下你的英文', 'info'); return; }
          submitted = true;
          render(text);
          btn.disabled = true;
          btn.textContent = '已提交';
        }
      });

      input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !submitted) {
          overlay.querySelector('[data-bt="submit"]')?.click();
        }
      });
    }
  });
}
