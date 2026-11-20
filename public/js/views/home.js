import { getState } from '../store.js';
import { computeStats } from '../stats.js';
import { icon, esc, dateKey, fmtDate } from '../ui.js';
import { GAOKAO_WORDS } from '../gaokao.js';
import { go } from '../router.js';

export const title = '今日';
export const subtitle = '文章精读 · 单词速查 · AI 出题 · 即时反馈';

export function render() {
  const state = getState();
  const st = computeStats(state);
  const quiz = state.quizzes.find((q) => q.date === st.today);
  const attempt = quiz ? state.attempts.find((a) => a.quizId === quiz.id) : null;
  const hour = new Date().getHours();
  const greet = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 19 ? '下午好' : '晚上好';

  return `
    <section class="hero">
      <div class="hero-eyebrow">${icon('calendar', 12)} ${fmtDate(new Date().toISOString())} · 今日学习</div>
      <h2>${greet}，今天读一段，记几个词。</h2>
      <p>导入一篇文章，选中句子让 AI 精讲并提取重点词；也可直接查词。每天一份定制小卷，做完立刻批改反馈。</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-action="reader">${icon('reader')} 读一篇文章</button>
        <button class="btn btn-light" data-action="lookup">${icon('searchWord')} 查词</button>
        ${attempt
          ? `<button class="btn btn-light" data-action="result" data-id="${attempt.id}">${icon('check')} 今日批改</button>`
          : `<button class="btn btn-light" data-action="take">${icon('play')} ${quiz ? '继续试卷' : '生成试卷'}</button>`}
      </div>
    </section>

    <div class="grid grid-4 keep mt16">
      ${statCard('词库总量', st.totalWords, `${st.dueCount} 个待复习`, 'book', 'var(--primary-soft)', 'var(--primary)')}
      ${statCard('已掌握', st.mastered, `平均掌握度 ${st.masteryAvg}%`, 'target', 'var(--success-soft)', 'var(--success)')}
      ${statCard('今日正确率', st.today.accuracy === null ? '—' : `${st.today.accuracy}%`, `${st.today.questions} 题已作答`, 'chart', 'var(--warn-soft)', 'var(--warn)')}
      ${statCard('连续打卡', `${st.streak} 天`, `累计 ${st.totalQuizzes} 份试卷`, 'flame', 'var(--danger-soft)', 'var(--danger)')}
    </div>

    <div class="grid grid-2 mt16">
      <section class="card" style="cursor:pointer" data-action="reader">
        <div class="card-head"><div><h2>文章精读</h2><div class="sub">导入 · 选中 · AI 讲解 · 入库一条龙</div></div>${icon('reader', 18)}</div>
        <div class="flow-step"><span class="flow-num">1</span><div><strong>导入文章</strong><span>粘贴文本、上传 TXT 或多图拍照 OCR</span></div></div>
        <div class="flow-step"><span class="flow-num">2</span><div><strong>选中句子</strong><span>点句子或划选，AI 给翻译、结构与语法</span></div></div>
        <div class="flow-step"><span class="flow-num">3</span><div><strong>重点词入库</strong><span>讲到的重点词一键收进词库</span></div></div>
        <div class="tiny muted mt12">已导入 ${state.articles.length} 篇文章 · 点击进入阅读器 ${icon('arrowRight', 12)}</div>
      </section>

      <section class="card" style="cursor:pointer" data-action="lookup">
        <div class="card-head"><div><h2>单词速查</h2><div class="sub">内置高考词库即输即查</div></div>${icon('searchWord', 18)}</div>
        <div class="grid grid-2 keep mt12">
          <div class="stat-card"><div class="stat-label">内置词条</div><div class="stat-value">${GAOKAO_WORDS.length}</div><div class="stat-foot">离线可查</div></div>
          <div class="stat-card"><div class="stat-label">我的词库</div><div class="stat-value">${st.totalWords}</div><div class="stat-foot">持续积累</div></div>
        </div>
        <div class="feedback mt16">${icon('info', 14)} 查不到时可让 AI 深度讲解词根词缀、搭配与例句，再一键加入词库。</div>
      </section>
    </div>

    <section class="card mt16">
      <div class="card-head">
        <div><h2>待复习 / 薄弱词</h2><div class="sub">优先安排进下一份试卷</div></div>
        <button class="btn btn-sm" data-action="words">全部词库 ${icon('arrowRight', 13)}</button>
      </div>
      ${st.weak.length ? st.weak.slice(0, 6).map((w) => `
        <div class="list-row">
          <div class="avatar">${esc(w.term.slice(0, 1).toUpperCase())}</div>
          <div style="flex:1;min-width:0">
            <div class="word-term">${esc(w.term)}</div>
            <div class="small muted">${esc(w.meaning || '暂无释义')}</div>
          </div>
          <div style="text-align:right">
            <div class="small ${w.mastery >= 50 ? '' : 'muted'}" style="font-weight:600;color:${w.mastery >= 50 ? 'var(--primary)' : 'var(--danger)'}">${w.mastery}%</div>
            <div class="tiny muted">掌握度</div>
          </div>
        </div>`).join('') : emptyMini('还没有学习数据，先导入一批单词吧', 'import')}
    </section>

    <section class="card mt16">
      <div class="card-head"><div><h2>最近试卷</h2><div class="sub">每次作答都会记录并更新复习计划</div></div><button class="btn btn-sm" data-action="quizzes">查看全部 ${icon('arrowRight', 13)}</button></div>
      ${state.attempts.length ? `
        <div class="grid grid-3">
          ${[...state.attempts].sort((a, b) => String(b.finishedAt).localeCompare(String(a.finishedAt))).slice(0, 3).map((a) => `
            <div class="list-row" style="padding:12px 0;gap:10px">
              <div style="flex:1;min-width:0">
                <strong class="small">${fmtDate(a.finishedAt, true)}</strong>
                <div class="tiny muted mt8">${a.answers?.length || 0} 题 · ${Math.round((a.score || 0))} 分</div>
              </div>
              <span class="pill ${a.accuracy >= 80 ? 'success' : a.accuracy >= 60 ? 'warn' : 'danger'}">${a.accuracy || 0}%</span>
            </div>`).join('')}
        </div>` : emptyMini('完成第一份试卷后，这里会显示记录', 'take')}
    </section>
  `;
}

function statCard(label, value, foot, iconName, bg, color) {
  return `<div class="stat-card">
    <div class="stat-icon" style="background:${bg};color:${color}">${icon(iconName, 16)}</div>
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-foot">${esc(foot)}</div>
  </div>`;
}

function emptyMini(text, action) {
  return `<div class="empty" style="padding:26px 10px">${icon('layers', 30)}<h3>${esc(text)}</h3>
    <button class="btn btn-primary btn-sm" data-action="${action}">${action === 'take' ? '生成试卷' : '去导入'}</button></div>`;
}

export function mount() {
  document.getElementById('view').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action;
    if (a === 'import') go('import');
    else if (a === 'reader') go('reader');
    else if (a === 'lookup') go('lookup');
    else if (a === 'words') go('words');
    else if (a === 'quizzes') go('quiz');
    else if (a === 'take') go('quiz', { mode: 'take' });
    else if (a === 'result') go('quiz', { mode: 'result', id: btn.dataset.id });
  });
}
