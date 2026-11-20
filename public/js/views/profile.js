// 用户画像页：把学习记录汇总成可解释的画像，并说明 AI 会怎么用它。

import { getState } from '../store.js';
import { buildProfile } from '../profile.js';
import { icon, esc, toast } from '../ui.js';
import { go, refresh } from '../router.js';
import { generateAdvice } from '../ai.js';

export const title = '学习画像';
export const subtitle = '根据你的词库、练习与精读记录生成，全部在本地计算';

let advice = '';
let adviceBusy = false;

function bar(value, color = 'var(--accent)') {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return `<div class="pf-bar"><i style="width:${v}%;background:${color}"></i></div>`;
}

function metric(label, value, sub) {
  return `<div class="pf-metric">
    <div class="pf-metric-label">${esc(label)}</div>
    <div class="pf-metric-value">${esc(value)}</div>
    ${sub ? `<div class="tiny muted">${esc(sub)}</div>` : ''}
  </div>`;
}

export function render() {
  const p = buildProfile(getState());
  const lv = p.level;

  return `
    <section class="card pf-hero">
      <div class="pf-hero-main">
        <div class="pf-level">
          <span class="pf-level-code">${esc(lv.code)}</span>
          <span class="pf-level-label">${esc(lv.label)}</span>
        </div>
        <div class="pf-hero-text">
          <h2>${esc(lv.advice)}</h2>
          <p class="small muted">${esc(p.summary)}</p>
        </div>
      </div>
      ${bar(lv.score)}
      <div class="tiny muted mt8">水平估分 ${lv.score} / 100 · 更新时间 ${esc((p.generatedAt || '').slice(0, 16).replace('T', ' '))}</div>
    </section>

    <div class="grid grid-2 mt16">
      <section class="card">
        <div class="card-head"><div><h2>词汇</h2><div class="sub">词库结构与掌握度</div></div>${icon('book', 18)}</div>
        <div class="pf-metrics">
          ${metric('词库总量', `${p.vocabulary.total} 词`)}
          ${metric('已掌握', `${p.vocabulary.mastered} 词`, '掌握度 ≥ 80')}
          ${metric('在学', `${p.vocabulary.learning} 词`)}
          ${metric('平均掌握度', `${p.vocabulary.avgMastery}%`)}
        </div>
        ${bar(p.vocabulary.avgMastery, '#1a9c64')}
      </section>

      <section class="card">
        <div class="card-head"><div><h2>练习</h2><div class="sub">正确率与题型分布</div></div>${icon('clipboard', 18)}</div>
        <div class="pf-metrics">
          ${metric('累计答题', `${p.accuracy.total} 道`)}
          ${metric('总正确率', p.accuracy.overall == null ? '—' : `${p.accuracy.overall}%`)}
          ${metric('近 30 天', p.accuracy.recent == null ? '—' : `${p.accuracy.recent}%`)}
          ${metric('连续打卡', `${p.habits.streak} 天`)}
        </div>
        ${p.accuracy.byType.length ? `<div class="pf-types">${p.accuracy.byType.slice(0, 4).map((t) =>
          `<span class="pill">${esc(t.type)} ${t.accuracy}% · ${t.total} 题</span>`).join('')}</div>` : '<div class="tiny muted">还没有答题记录</div>'}
      </section>

      <section class="card">
        <div class="card-head"><div><h2>阅读与精读</h2><div class="sub">长难句拆解情况</div></div>${icon('reader', 18)}</div>
        <div class="pf-metrics">
          ${metric('文章', `${p.reading.articles} 篇`)}
          ${metric('精读句子', `${p.reading.explained} 句`)}
          ${metric('平均篇幅', `${p.reading.avgArticleWords} 词`)}
          ${metric('活跃天数', `${p.habits.active30} / 30 天`)}
        </div>
      </section>

      <section class="card">
        <div class="card-head"><div><h2>易错词</h2><div class="sub">错得最多、掌握度最低的词</div></div>${icon('target', 18)}</div>
        ${p.weakWords.length ? `<div class="pf-weak">${p.weakWords.map((w) => `
          <div class="pf-weak-item">
            <div class="row spread"><b>${esc(w.term)}</b><span class="tiny muted">错 ${w.wrong} 次</span></div>
            <div class="tiny muted">${esc((w.meaning || '').slice(0, 40))}</div>
            ${bar(w.mastery, '#f0a020')}
          </div>`).join('')}</div>`
          : `<div class="empty" style="padding:22px 0">${icon('sparkles', 24)}<p>还没有易错词记录</p></div>`}
      </section>
    </div>

    <section class="card mt16">
      <div class="card-head"><div><h2>当前关注点</h2><div class="sub">画像据此调整讲解深度、例句难度与练习侧重点</div></div>
        <button class="btn btn-sm btn-ghost" data-action="goWords">去词库 ${icon('arrowRight', 13)}</button></div>
      <ol class="pf-focus">${p.focus.map((f) => `<li>${esc(f)}</li>`).join('')}</ol>
    </section>

    <section class="card mt16">
      <div class="card-head"><div><h2>个性化建议</h2><div class="sub">把画像交给 AI，生成这周可以直接执行的动作</div></div>
        <button class="btn btn-sm btn-primary" data-action="advice" ${adviceBusy ? 'disabled' : ''}>
          ${adviceBusy ? '<span class="loading"></span> 生成中…' : `${icon('sparkles', 13)} 按画像给建议`}</button></div>
      ${advice ? `<div class="pf-advice">${esc(advice).replace(/\n/g, '<br>')}</div>`
        : `<div class="tiny muted">画像会以文字摘要形式附在讲解、出题的提示词里，不发送原始学习记录。</div>`}
    </section>
  `;
}

export function mount() {
  const view = document.getElementById('view');
  view.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'goWords') { go('words'); return; }
    if (btn.dataset.action === 'advice') {
      if (adviceBusy) return;
      adviceBusy = true; refresh();
      try {
        const p = buildProfile(getState());
        advice = await generateAdvice({
          level: p.level,
          vocabulary: p.vocabulary,
          accuracy: p.accuracy,
          reading: p.reading,
          habits: p.habits,
          weakWords: p.weakWords,
          focus: p.focus
        });
        toast('建议已生成', 'success');
      } catch (err) {
        toast(`生成失败：${err.message}`, 'error', 5000);
      } finally {
        adviceBusy = false; refresh();
      }
    }
  });
}
