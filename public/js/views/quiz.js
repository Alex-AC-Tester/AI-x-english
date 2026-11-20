import { getState, getSettings, getQuiz, getQuizByDate, saveQuiz, saveAttempt, updateWord, logActivity } from '../store.js';
import { dueWords, mastery, applyReview } from '../srs.js';
import { generateQuiz, gradeSubjective } from '../ai.js';
import { icon, esc, toast, dateKey, durationText, fmtDate, modal } from '../ui.js';
import { go, getRoute, refresh } from '../router.js';

export const title = '每日试卷';
export const subtitle = 'AI 组卷 · 做完即批 · 数据留痕';

let take = { quizId: null, answers: {}, index: 0, submitting: false, generating: false, focus: '', count: null };
let showTranslation = false;

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function pickWords(state, count) {
  const words = state.words;
  const due = dueWords(words, count);
  const rest = words.filter((w) => !due.includes(w)).sort((a, b) => mastery(a) - mastery(b));
  return [...due, ...rest].slice(0, count);
}

function currentQuiz(params) {
  if (params.mode === 'take') {
    if (params.id) return getQuiz(params.id);
    if (take.quizId) return getQuiz(take.quizId);
    return getQuizByDate(dateKey());
  }
  return null;
}

export function render() {
  const params = getRoute().params || {};
  if (params.mode === 'result' && params.id) {
    const a = getState().attempts.find((x) => x.id === params.id);
    return a ? renderResult(a) : renderMissing();
  }
  if (params.mode === 'take') return renderTake(currentQuiz(params));
  return renderList();
}

/* ---------- 列表 ---------- */
function renderList() {
  const state = getState();
  const today = dateKey();
  const quiz = getQuizByDate(today);
  const attempt = quiz ? state.attempts.find((a) => a.quizId === quiz.id) : null;
  const count = take.count || getSettings().dailyCount || 10;
  return `
    <section class="card">
      <div class="card-head"><div><h2>今日试卷</h2><div class="sub">${today} · 根据待复习词与薄弱词动态组卷</div></div><span class="pill primary">${icon('sparkles', 12)} AI 出题</span></div>
      <div class="spread" style="align-items:flex-start;gap:20px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <div class="stat-label">题量</div>
          <div class="row mt8">
            ${[6, 10, 15, 20].map((n) => `<button class="chip ${count === n ? 'active' : ''}" data-count="${n}">${n} 题</button>`).join('')}
          </div>
          <div class="field mt16" style="max-width:420px"><label>出题侧重点（可选）</label><input class="input" id="quizFocus" placeholder="例如：侧重动词短语和例句填空" value="${esc(take.focus)}" /></div>
        </div>
        <div class="quiz-cta">
          ${attempt
            ? `<div class="cta-value" style="color:var(--primary)">${Math.round(attempt.score)}</div>
               <div class="small muted mt8">今日已完成</div>
               <button class="btn btn-sm btn-block mt12" data-action="result" data-id="${attempt.id}">查看批改</button>`
            : `<div class="cta-value">${quiz?.questions?.length || '—'}</div>
               <div class="small muted mt8">${quiz ? '题已生成' : '尚未生成'}</div>
               <button class="btn btn-primary btn-block mt12" data-action="${quiz ? 'resume' : 'generate'}" ${state.words.length < 2 || take.generating ? 'disabled' : ''}>${take.generating ? '<span class="loading"></span> 出题中…' : `${icon(quiz ? 'play' : 'sparkles', 15)} ${quiz ? '开始答题' : '生成试卷'}`}</button>`}
        </div>
      </div>
      ${state.words.length < 2 ? `<div class="feedback mt16">${icon('info', 14)} 词库至少需要 2 个词条才能出题，请先拍照导入。</div>` : ''}
    </section>

    <section class="card mt16">
      <div class="card-head"><div><h2>历史记录</h2><div class="sub">共 ${state.attempts.length} 次作答记录，数据已落盘</div></div></div>
      ${state.attempts.length ? `
        <div class="list-row small muted" style="font-weight:700;padding-top:0"><div style="flex:1">完成时间</div><div style="width:80px">正确率</div><div style="width:70px">得分</div><div style="width:70px">用时</div><div style="width:60px"></div></div>
        ${[...state.attempts].sort((a, b) => String(b.finishedAt).localeCompare(String(a.finishedAt))).map((a) => `
          <div class="list-row">
            <div style="flex:1"><strong class="small">${fmtDate(a.finishedAt, true)}</strong><div class="tiny muted">${a.answers?.length || 0} 题 · AI 批改 ${a.aiGraded || 0} 题</div></div>
            <div style="width:80px"><span class="pill ${a.accuracy >= 80 ? 'success' : a.accuracy >= 60 ? 'warn' : 'danger'}">${a.accuracy}%</span></div>
            <div style="width:70px;font-weight:700">${Math.round(a.score)}</div>
            <div style="width:70px" class="muted">${durationText(a.durationMs || 0)}</div>
            <div style="width:60px"><button class="btn btn-sm" data-action="result" data-id="${a.id}">详情</button></div>
          </div>`).join('')}` : `<div class="empty">${icon('clipboard', 32)}<h3>还没有作答记录</h3><p>生成第一份试卷，开启学习循环</p></div>`}
    </section>
  `;
}

/* ---------- 答题 ---------- */
function renderTake(quiz) {
  const state = getState();
  if (!quiz || !quiz.questions?.length) {
    const count = take.count || getSettings().dailyCount || 10;
    return `
      <section class="card">
        <div class="empty" style="padding:44px 20px">
          ${icon('sparkles', 40)}
          <h3>AI 为你生成今日试卷</h3>
          <p>将从 ${state.words.length} 个词条中优先挑选待复习和薄弱词，混合阅读、填词、拼写与翻译题型。</p>
          <div class="row" style="justify-content:center;margin:16px 0">
            ${[6, 10, 15, 20].map((n) => `<button class="chip ${count === n ? 'active' : ''}" data-count="${n}">${n} 题</button>`).join('')}
          </div>
          <input class="input" id="quizFocus" placeholder="出题侧重点（可选）" value="${esc(take.focus)}" style="max-width:380px" />
          <div class="feedback mt16">${icon('info', 14)} 出题时会优先安排待复习词；AI 生成通常需要 10–60 秒，如果某个模型繁忙会自动切换到备用模型。</div>
          <div class="row mt16" style="justify-content:center">
            <button class="btn" data-action="backList">返回</button>
            <button class="btn btn-primary" data-action="generate" ${take.generating || state.words.length < 2 ? 'disabled' : ''}>
              ${take.generating ? '<span class="loading"></span> AI 正在出题，请稍候…' : `${icon('sparkles')} 生成试卷`}
            </button>
          </div>
        </div>
      </section>`;
  }

  const questions = quiz.questions;
  const idx = Math.min(take.index, questions.length - 1);
  const q = questions[idx];
  const answered = questions.filter((x) => (take.answers[x.id] || '').trim()).length;
  const doneCount = questions.filter((x) => take.answers[x.id] !== undefined).length;

  return `
    <div class="spread" style="margin-bottom:14px">
      <div class="row">
        <button class="btn btn-sm" data-action="backList">${icon('arrowLeft', 14)} 退出</button>
        <span class="pill primary">${quiz.passage ? '阅读 + 词汇' : '词汇专项'} · ${questions.length} 题</span>
      </div>
      <div class="small muted">已作答 ${answered} / ${questions.length}</div>
    </div>

    ${quiz.passage?.text ? `
      <section class="card">
        <div class="card-head"><div><h2>${esc(quiz.passage.title || '今日短文')}</h2><div class="sub">先读短文，再完成下面的题目</div></div>
          <button class="btn btn-sm" data-action="toggleTrans">${icon('eye', 14)} ${showTranslation ? '隐藏译文' : '显示译文'}</button></div>
        <div class="passage">${esc(quiz.passage.text).replace(/\n/g, '<br/>')}</div>
        ${showTranslation ? `<div class="feedback mt12">${esc(quiz.passage.translation || '暂无译文')}</div>` : ''}
      </section>` : ''}

    <section class="card mt16">
      <div class="q-head">
        <span class="q-index">${idx + 1}</span>
        <span class="pill">${typeLabel(q.type)}</span>
        <span class="tiny muted">${q.wordIds?.length ? `考察 ${q.wordIds.length} 个词` : ''}</span>
      </div>
      <p class="q-prompt">${esc(q.prompt)}</p>
      ${renderInput(q, take.answers[q.id])}
      <div class="spread mt24">
        <button class="btn" data-action="prev" ${idx === 0 ? 'disabled' : ''}>${icon('arrowLeft', 14)} 上一题</button>
        <div class="q-palette" style="justify-content:center">
          ${questions.map((qq, i) => `<button class="q-dot ${i === idx ? 'active' : ''} ${take.answers[qq.id] !== undefined ? 'done' : ''}" data-goto="${i}">${i + 1}</button>`).join('')}
        </div>
        ${idx === questions.length - 1
          ? `<button class="btn btn-primary" data-action="submit" ${take.submitting ? 'disabled' : ''}>${take.submitting ? '<span class="loading"></span> 批改中…' : `${icon('check', 14)} 提交批改`}</button>`
          : `<button class="btn btn-primary" data-action="next">下一题 ${icon('arrowRight', 14)}</button>`}
      </div>
      <div class="tiny muted mt12" style="text-align:right">未作答 ${questions.length - doneCount} 题也可以提交，未答题计 0 分</div>
    </section>
  `;
}

function typeLabel(t) {
  return ({ meaning: '释义选择', usage: '选词填空', fill: '单词填空', spell: '单词拼写', translation: '句子翻译', reading: '阅读理解' })[t] || '问答';
}

function renderInput(q, value) {
  const v = value === undefined ? '' : value;
  if (['meaning', 'usage', 'reading'].includes(q.type)) {
    return (q.options || []).map((opt, i) => `
      <label class="option ${v === opt ? 'selected' : ''}">
        <input type="radio" name="answer" value="${esc(opt)}" ${v === opt ? 'checked' : ''} data-opt="${esc(opt)}" />
        <span><strong>${String.fromCharCode(65 + i)}.</strong> ${esc(opt)}</span>
      </label>`).join('') || '<div class="feedback">该题缺少选项，可直接跳过。</div>';
  }
  if (q.type === 'translation') {
    return `<textarea class="textarea" id="answerText" style="min-height:120px" placeholder="写出你的英文翻译…">${esc(v)}</textarea><div class="tiny muted mt8">主观题将由 AI 批改，参考译文会在提交后显示。</div>`;
  }
  return `<input class="input" id="answerText" placeholder="${q.type === 'spell' ? '拼写完整单词…' : '填入缺失的单词…'}" value="${esc(v)}" autocomplete="off" />`;
}

function collectCurrent(quiz) {
  if (!quiz) return;
  const q = quiz.questions[Math.min(take.index, quiz.questions.length - 1)];
  if (!q) return;
  if (['meaning', 'usage', 'reading'].includes(q.type)) {
    const checked = document.querySelector('input[name="answer"]:checked');
    if (checked) take.answers[q.id] = checked.value;
  } else {
    const el = document.getElementById('answerText');
    if (el) take.answers[q.id] = el.value;
    else if (take.answers[q.id] === undefined) take.answers[q.id] = '';
  }
}

async function generate(params) {
  if (take.generating) return;
  const state = getState();
  const count = take.count || getSettings().dailyCount || 10;
  const focus = document.getElementById('quizFocus')?.value || take.focus || '';
  take.focus = focus;
  const words = pickWords(state, count);
  if (words.length < 2) { toast('词库不足，请先导入单词', 'error'); return; }
  take.generating = true; refresh();
  try {
    const generated = await generateQuiz({ words, count: Math.min(count, words.length), focus });
    const existing = getQuizByDate(dateKey());
    const quiz = {
      id: existing?.id || `q_${Date.now().toString(36)}`,
      date: dateKey(), createdAt: new Date().toISOString(), status: 'draft',
      targetWordIds: words.map((w) => w.id), focus,
      passage: generated.passage, questions: generated.questions
    };
    saveQuiz(quiz);
    take.quizId = quiz.id; take.answers = {}; take.index = 0;
    toast(`试卷已生成：${quiz.questions.length} 道题`, 'success');
    go('quiz', { mode: 'take', id: quiz.id }, true);
  } catch (err) {
    toast(`出题失败：${err.message}`, 'error', 6000);
  } finally {
    take.generating = false; refresh();
  }
}

function objective(q, response) {
  const resp = norm(response);
  if (!resp) return { correct: false, score: 0, feedback: '未作答' };
  if (['meaning', 'usage', 'reading'].includes(q.type)) {
    const correct = norm(q.answer) === resp;
    return { correct, score: correct ? 100 : 0, feedback: correct ? '回答正确' : `正确答案：${q.answer}` };
  }
  const accepts = String(q.answer || '').split('|').map(norm).filter(Boolean);
  const correct = accepts.includes(resp);
  return { correct, score: correct ? 100 : 0, feedback: correct ? '拼写正确' : `参考答案：${q.answer}` };
}

async function submitQuiz(quiz) {
  if (take.submitting) return;
  take.submitting = true; refresh();
  const started = quiz.startedAt || Date.now();
  try {
    const subjective = quiz.questions.filter((q) => q.type === 'translation');
    const gradeMap = subjective.length
      ? await gradeSubjective(subjective.map((q) => ({ id: q.id, prompt: q.prompt, answer: q.answer, response: take.answers[q.id] || '' })))
      : {};

    const answers = quiz.questions.map((q) => {
      const response = take.answers[q.id] || '';
      let result;
      if (q.type === 'translation') {
        const g = gradeMap[q.id] || {};
        const score = Number.isFinite(Number(g.score)) ? Math.max(0, Math.min(100, Number(g.score))) : (norm(response) ? 60 : 0);
        result = { correct: score >= 60, score, feedback: g.feedback || '已完成，建议对照参考答案复盘。', modelAnswer: g.modelAnswer || q.answer };
      } else {
        result = objective(q, response);
      }
      return {
        questionId: q.id, type: q.type, prompt: q.prompt, response,
        answer: q.answer, correct: result.correct, score: result.score,
        feedback: result.feedback, modelAnswer: result.modelAnswer || q.answer,
        explain: q.explain || '', wordIds: q.wordIds || []
      };
    });

    const total = answers.length;
    const correctCount = answers.filter((a) => a.correct).length;
    const score = total ? Math.round(answers.reduce((n, a) => n + a.score, 0) / total) : 0;
    const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
    const durationMs = Date.now() - started;

    const attempt = {
      id: `a_${Date.now().toString(36)}`, quizId: quiz.id, date: dateKey(),
      startedAt: new Date(started).toISOString(), finishedAt: new Date().toISOString(),
      answers, total, correctCount, score, accuracy,
      aiGraded: subjective.length, durationMs
    };
    saveAttempt(attempt);

    // 更新每个词的 SRS（同词多题按对错多数决定）
    const perWord = {};
    answers.forEach((a) => (a.wordIds || []).forEach((id) => {
      perWord[id] = perWord[id] || { yes: 0, no: 0 };
      if (a.correct) perWord[id].yes++; else perWord[id].no++;
    }));
    Object.entries(perWord).forEach(([id, r]) => {
      const w = getState().words.find((x) => x.id === id);
      if (w) updateWord(id, { srs: applyReview(w, r.yes >= r.no) });
    });

    logActivity(dateKey(), { questions: total, correct: correctCount, quizzes: 1, minutes: Math.max(1, Math.ceil(durationMs / 60000)) });
    quiz.status = 'completed'; saveQuiz(quiz);

    toast(`批改完成：${accuracy}% 正确`, 'success');
    go('quiz', { mode: 'result', id: attempt.id }, true);
  } catch (err) {
    toast(`批改失败：${err.message}`, 'error', 6000);
  } finally {
    take.submitting = false;
  }
}

/* ---------- 结果 ---------- */
function renderResult(a) {
  const state = getState();
  const quiz = getQuiz(a.quizId);
  const color = a.accuracy >= 80 ? '#3f7a56' : a.accuracy >= 60 ? '#91611b' : '#b0463b';
  const circ = 2 * Math.PI * 46;
  return `
    <div class="spread" style="margin-bottom:14px">
      <button class="btn btn-sm" data-action="backList">${icon('arrowLeft', 14)} 返回试卷列表</button>
      <span class="pill">${fmtDate(a.finishedAt, true)}</span>
    </div>
    <section class="card">
      <div class="result-hero">
        <svg class="score-ring" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="46" fill="none" stroke="#efece3" stroke-width="10" />
          <circle cx="55" cy="55" r="46" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
            stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - a.accuracy / 100)}" transform="rotate(-90 55 55)" />
          <text x="55" y="61" text-anchor="middle" font-size="26" font-weight="800" fill="${color}">${a.accuracy}%</text>
        </svg>
        <div class="score-num" style="font-size:20px;color:${color}">${Math.round(a.score)} 分</div>
        <div class="small muted mt8">${a.correctCount} / ${a.total} 题正确 · 用时 ${durationText(a.durationMs || 0)} · AI 批改 ${a.aiGraded} 题</div>
        <div class="row mt16" style="justify-content:center">
          <button class="btn btn-primary" data-action="again">${icon('refresh', 14)} 再做一份</button>
          <button class="btn" data-action="exportAttempt" data-id="${a.id}">${icon('download', 14)} 导出本次记录</button>
        </div>
      </div>
    </section>

    ${quiz?.passage?.text ? `<section class="card"><div class="card-head"><div><h2>阅读原文</h2><div class="sub">${esc(quiz.passage.title || '')}</div></div>
      <button class="btn btn-sm" data-action="toggleTrans">${icon('eye', 14)} ${showTranslation ? '隐藏译文' : '显示译文'}</button></div>
      <div class="passage">${esc(quiz.passage.text).replace(/\n/g, '<br/>')}</div>
      ${showTranslation ? `<div class="feedback mt12">${esc(quiz.passage.translation || '')}</div>` : ''}</section>` : ''}

    <section class="card mt16">
      <div class="card-head"><div><h2>逐题解析</h2><div class="sub">绿色为正确，红色为需复习；答题后已自动更新单词复习计划</div></div></div>
      ${a.answers.map((ans, i) => `
        <div style="border:1px solid var(--border);border-left:2px solid ${ans.correct ? 'var(--success)' : 'var(--danger)'};border-radius:0;padding:16px 18px;margin-bottom:10px;background:var(--surface)">
          <div class="spread">
            <div class="row"><span class="q-index">${i + 1}</span><span class="pill ${ans.correct ? 'success' : 'danger'}">${ans.correct ? '正确' : '需复习'}</span><span class="pill">${typeLabel(ans.type)}</span></div>
            <strong class="small">${ans.score} 分</strong>
          </div>
          <p class="q-prompt mt12" style="margin-bottom:8px">${esc(ans.prompt)}</p>
          <div class="small">你的作答：<strong>${esc(ans.response || '（未作答）')}</strong></div>
          ${!ans.correct ? `<div class="small mt8">参考答案：<strong style="color:var(--success)">${esc(ans.modelAnswer || ans.answer)}</strong></div>` : ''}
          ${ans.feedback ? `<div class="feedback">${icon('info', 13)} ${esc(ans.feedback)}</div>` : ''}
          ${ans.explain ? `<div class="tiny muted mt8">解析：${esc(ans.explain)}</div>` : ''}
        </div>`).join('')}
    </section>
  `;
}

function renderMissing() {
  return `<section class="card"><div class="empty">${icon('info', 32)}<h3>找不到这份作答记录</h3><button class="btn btn-primary btn-sm" data-action="backList">返回列表</button></div></section>`;
}

export function mount() {
  const view = document.getElementById('view');
  const params = getRoute().params || {};
  const quiz = currentQuiz(params);

  view.addEventListener('change', (e) => {
    if (e.target.name === 'answer' && quiz) {
      take.answers[quiz.questions[Math.min(take.index, quiz.questions.length - 1)].id] = e.target.value;
      refresh();
    }
  });

  view.addEventListener('input', (e) => {
    if (e.target.id === 'answerText' && quiz) {
      take.answers[quiz.questions[Math.min(take.index, quiz.questions.length - 1)].id] = e.target.value;
    }
  });

  view.addEventListener('click', async (e) => {
    const countBtn = e.target.closest('[data-count]');
    if (countBtn) { take.count = Number(countBtn.dataset.count); refresh(); return; }

    const goto = e.target.closest('[data-goto]');
    if (goto && quiz) { collectCurrent(quiz); take.index = Number(goto.dataset.goto); refresh(); return; }

    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action;

    if (a === 'backList') { go('quiz'); return; }
    if (a === 'toggleTrans') { showTranslation = !showTranslation; refresh(); return; }
    if (a === 'generate') { await generate(params); return; }
    if (a === 'resume') { go('quiz', { mode: 'take' }); return; }
    if (a === 'result') { go('quiz', { mode: 'result', id: btn.dataset.id }); return; }
    if (a === 'again') {
      take.quizId = null; take.answers = {}; take.index = 0; take.count = null;
      const existing = getQuizByDate(dateKey());
      if (existing) { existing.status = 'draft'; }
      go('quiz', { mode: 'take' }); return;
    }
    if (a === 'exportAttempt') {
      const att = getState().attempts.find((x) => x.id === btn.dataset.id);
      if (!att) return;
      const blob = JSON.stringify(att, null, 2);
      import('../ui.js').then(({ download }) => download(`wordwise-作答-${att.date}.json`, blob, 'application/json'));
      toast('已导出作答记录', 'success');
      return;
    }
    if (!quiz) return;
    if (a === 'prev') { collectCurrent(quiz); take.index = Math.max(0, take.index - 1); refresh(); }
    if (a === 'next') { collectCurrent(quiz); take.index = Math.min(quiz.questions.length - 1, take.index + 1); refresh(); }
    if (a === 'submit') {
      collectCurrent(quiz);
      const unanswered = quiz.questions.filter((q) => !(take.answers[q.id] || '').trim()).length;
      if (unanswered && !await modal({
        title: '还有未作答的题目',
        body: `<p class="small muted">还有 ${unanswered} 题未作答，未答题将计 0 分。确定现在提交吗？</p>`,
        actions: [{ label: '再检查一下', value: false }, { label: '确定提交', cls: 'btn-primary', value: true }]
      })) return;
      await submitQuiz(quiz);
    }
  });
}
