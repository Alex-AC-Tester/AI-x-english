// 百词斩式卡片背单词（纯文字，无语音/图片）
// 看词选义 / 看义选词交替，即时反馈，错词优先，进度落盘。

import { GAOKAO_WORDS, builtinLookup } from '../gaokao.js';
import { getState, getWords, updateWord, save, logActivity } from '../store.js';
import { applyReview } from '../srs.js';
import { icon, esc, toast, dateKey } from '../ui.js';
import { refresh } from '../router.js';

let phase = 'home';        // home | study | done
let queue = [];
let idx = 0;
let right = 0;
let wrongList = [];
let answered = null;       // { ok, choice }
let scope = 'gaokao';      // gaokao | mine | mixed
let startTime = 0;

export const title = '背单词';
export const subtitle = '卡片速记 · 看词选义 / 看义选词';

/* ---------- 学习进度（存于 state.meta.learn，不新增顶层字段） ---------- */
function learnState() {
  const s = getState();
  if (!s.meta) s.meta = {};
  if (!s.meta.learn || typeof s.meta.learn !== 'object') {
    s.meta.learn = { learned: {}, daily: {}, goal: 20 };
  }
  if (!s.meta.learn.learned) s.meta.learn.learned = {};
  if (!s.meta.learn.daily) s.meta.learn.daily = {};
  return s.meta.learn;
}
function today() { return dateKey(); }
function dayStat() {
  const st = learnState();
  const k = today();
  if (!st.daily[k]) st.daily[k] = { count: 0, right: 0 };
  return st.daily[k];
}
function record(term, ok) {
  const st = learnState();
  const key = String(term || '').toLowerCase();
  const r = st.learned[key] || { seen: 0, right: 0, wrong: 0, lastAt: null };
  r.seen++; r[ok ? 'right' : 'wrong']++; r.lastAt = new Date().toISOString();
  st.learned[key] = r;
  const d = dayStat(); d.count++; if (ok) d.right++;
  save();
}
function learnedScore(w) {
  const r = learnState().learned[String(w.term || '').toLowerCase()];
  if (!r) return 0;
  return r.right - r.wrong * 2 + (r.seen ? 1 : 0);
}

/* ---------- 选词与出题 ---------- */
function myWords() {
  return getWords().filter((w) => w.term && w.meaning).map((w) => ({
    term: w.term, phonetic: w.phonetic || '', pos: w.pos || '',
    meaning: w.meaning, example: w.example || '', ref: w
  }));
}
function pool() {
  const mine = myWords();
  if (scope === 'mine') return mine;
  if (scope === 'mixed') {
    const seen = new Set(mine.map((w) => w.term.toLowerCase()));
    return [...mine, ...GAOKAO_WORDS.filter((w) => !seen.has(w.term.toLowerCase()))];
  }
  return GAOKAO_WORDS.slice();
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function makeQueue() {
  const all = pool().filter((w) => w.term && w.meaning);
  if (!all.length) return [];
  const goal = Math.min(learnState().goal || 20, all.length);
  // 先看错得多 / 没看过的；同分组内打乱
  const groups = new Map();
  all.forEach((w) => {
    const s = learnedScore(w);
    const g = s < 0 ? 0 : s === 0 ? 1 : 2;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(w);
  });
  const picked = [...(groups.get(0) || []).slice(), ...shuffle(groups.get(1) || []), ...shuffle(groups.get(2) || [])].slice(0, goal);
  return shuffle(picked).map((w, i) => {
    const others = shuffle(all.filter((o) => o.term.toLowerCase() !== w.term.toLowerCase() && o.meaning && o.meaning !== w.meaning)).slice(0, 3);
    const mode = i % 2 === 0 ? 'w2m' : 'm2w';
    const options = mode === 'w2m'
      ? shuffle([w.meaning, ...others.map((o) => o.meaning)])
      : shuffle([w.term, ...others.map((o) => o.term)]);
    return { word: w, mode, options, answer: mode === 'w2m' ? w.meaning : w.term };
  });
}
function start() {
  queue = makeQueue();
  if (!queue.length) { toast('当前词库没有可学习的词条，先去导入或切换范围', 'error'); return; }
  idx = 0; right = 0; wrongList = []; answered = null;
  startTime = Date.now();
  phase = 'study';
  refresh();
}

/* ---------- 渲染 ---------- */
export function render() {
  if (phase === 'study') return renderStudy();
  if (phase === 'done') return renderDone();
  return renderHome();
}

function renderHome() {
  const st = learnState();
  const d = dayStat();
  const words = getWords();
  const learnedCount = Object.keys(st.learned).length;
  const mastered = Object.values(st.learned).filter((r) => r.right >= 2 && r.right > r.wrong).length;
  const total = scope === 'gaokao' ? GAOKAO_WORDS.length : scope === 'mine' ? words.length : GAOKAO_WORDS.length + words.length;
  return `
    <div class="learn-hero">
      <div>
        <div class="learn-eyebrow">今日计划</div>
        <h2>每天 ${st.goal || 20} 词，积少成多</h2>
        <p>卡片速记，看词选义与看义选词交替。点完即出结果，答错的词会优先再出现。</p>
        <div class="learn-hero-actions">
          <button class="btn btn-primary" data-act="start">${icon('play', 15)} 开始今日学习</button>
          <button class="btn" data-act="scope">当前范围：${scopeLabel()}</button>
        </div>
      </div>
      <div class="learn-ring">
        <div class="learn-ring-num">${d.count}<span>/${st.goal || 20}</span></div>
        <div class="learn-ring-label">今日已学</div>
      </div>
    </div>

    <div class="grid grid-4 keep mt16">
      ${stat('今日已学', d.count, `正确 ${d.count ? Math.round(d.right / d.count * 100) : 0}%`, 'book')}
      ${stat('已接触词', learnedCount, `累计练习记录`, 'sparkles')}
      ${stat('已掌握', mastered, '答对 2 次以上', 'target')}
      ${stat('可用词库', total, scopeLabel(), 'layers')}
    </div>

    <section class="card mt16">
      <div class="card-head"><div><h2>怎么玩</h2><div class="sub">纯文字卡片，两步一个循环</div></div></div>
      <div class="learn-steps">
        <div class="learn-step"><span>01</span><div><b>看词选义</b><small>看到单词，从四个中文释义里挑出正确的</small></div></div>
        <div class="learn-step"><span>02</span><div><b>看义选词</b><small>看到释义，反向选出对应单词</small></div></div>
        <div class="learn-step"><span>03</span><div><b>即时反馈</b><small>答错立刻显示正确释义与例句，并安排重练</small></div></div>
      </div>
    </section>`;
}

function stat(label, value, foot, ico) {
  return `<div class="card learn-stat"><div class="row spread"><span class="stat-label">${label}</span>${icon(ico, 15)}</div>
    <div class="stat-value">${value}</div><div class="tiny muted">${esc(foot)}</div></div>`;
}
function scopeLabel() {
  return { gaokao: '高考核心词', mine: '我的词库', mixed: '全部混合' }[scope] || '高考核心词';
}

function renderStudy() {
  const q = queue[idx];
  if (!q) return renderDone();
  const pct = Math.round(idx / queue.length * 100);
  const prompt = q.mode === 'w2m'
    ? `<div class="learn-word">${esc(q.word.term)}</div>
       <div class="learn-phonetic">${esc(q.word.phonetic || builtinLookup(q.word.term)?.phonetic || '')} ${esc(q.word.pos || '')}</div>
       <div class="learn-hint">选出正确的中文释义</div>`
    : `<div class="learn-meaning">${esc(q.word.meaning)}</div>
       <div class="learn-hint">选出对应的英文单词</div>`;

  const options = q.options.map((o, i) => {
    let cls = '';
    if (answered) {
      if (o === q.answer) cls = 'right';
      else if (o === answered.choice) cls = 'wrong';
      else cls = 'dim';
    }
    return `<button class="learn-option ${cls}" data-act="choice" data-i="${i}" ${answered ? 'disabled' : ''}>
      <span class="learn-opt-key">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`;
  }).join('');

  const feedback = answered ? `
    <div class="learn-feedback ${answered.ok ? 'ok' : 'no'}">
      <b>${answered.ok ? '回答正确' : '再记一下'}</b>
      <div>${esc(q.word.term)} ${esc(q.word.phonetic || '')} ${esc(q.word.pos || '')} —— ${esc(q.word.meaning)}</div>
      ${q.word.example ? `<div class="learn-example">${esc(q.word.example)}</div>` : ''}
      <button class="btn btn-primary btn-sm mt12" data-act="next">${idx + 1 >= queue.length ? '查看结果' : '下一个'} ${icon('arrowRight', 13)}</button>
    </div>` : '';

  return `
    <div class="learn-study">
      <div class="learn-top">
        <button class="btn btn-sm" data-act="quit">${icon('x', 13)} 退出</button>
        <div class="learn-progress"><div class="learn-progress-bar" style="width:${pct}%"></div></div>
        <span class="tiny muted">${idx + 1} / ${queue.length}</span>
      </div>
      <div class="learn-card">
        <div class="learn-mode">${q.mode === 'w2m' ? '看词选义' : '看义选词'}</div>
        ${prompt}
        <div class="learn-options">${options}</div>
        ${feedback}
      </div>
    </div>`;
}

function renderDone() {
  const total = queue.length;
  const acc = total ? Math.round(right / total * 100) : 0;
  const ms = Date.now() - startTime;
  return `
    <div class="card learn-done">
      <div class="learn-done-badge">${acc >= 80 ? '很棒' : acc >= 60 ? '继续保持' : '再来一轮'}</div>
      <div class="learn-done-score">${acc}<span>%</span></div>
      <div class="sub">本轮 ${total} 词 · 答对 ${right} · 用时 ${Math.max(1, Math.round(ms / 60000))} 分钟</div>
      <div class="row mt16" style="justify-content:center">
        <button class="btn btn-primary" data-act="start">${icon('refresh', 14)} 再来一轮</button>
        <button class="btn" data-act="home">返回计划</button>
      </div>
    </div>
    ${wrongList.length ? `<section class="card mt16">
      <div class="card-head"><div><h2>需要复习</h2><div class="sub">这些词答错过，已安排优先重练</div></div></div>
      <div class="grid grid-2">${wrongList.map((w) => `<div class="learn-wrong">
        <b>${esc(w.term)}</b><span class="tiny muted">${esc(w.phonetic || '')}</span>
        <div class="small">${esc(w.meaning)}</div></div>`).join('')}</div>
    </section>` : ''}`;
}

/* ---------- 交互 ---------- */
function answer(i, q) {
  if (answered) return;
  const choice = q.options[i];
  const ok = choice === q.answer;
  answered = { ok, choice };
  if (ok) right++; else wrongList.push(q.word);
  record(q.word.term, ok);
  if (q.word.ref) {
    updateWord(q.word.ref.id, { srs: applyReview(q.word.ref, ok) });
  } else {
    // 高考词不在我的词库里，记入学习记录即可；如要长期复习可一键加入词库
  }
  logActivity(today(), { questions: 1, correct: ok ? 1 : 0 });
  refresh();
}

export function mount() {
  const view = document.getElementById('view');
  view.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const a = btn.dataset.act;
    if (a === 'start') return start();
    if (a === 'home') { phase = 'home'; refresh(); return; }
    if (a === 'quit') { phase = 'home'; refresh(); return; }
    if (a === 'scope') {
      const order = ['gaokao', 'mine', 'mixed'];
      scope = order[(order.indexOf(scope) + 1) % order.length];
      refresh(); return;
    }
    if (a === 'choice' && phase === 'study') return answer(Number(btn.dataset.i), queue[idx]);
    if (a === 'next' && phase === 'study') {
      idx++;
      answered = null;
      if (idx >= queue.length) phase = 'done';
      refresh();
    }
  });
}
