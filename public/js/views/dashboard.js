import { getState } from '../store.js';
import { computeStats } from '../stats.js';
import { generateAdvice } from '../ai.js';
import { icon, esc, toast, download } from '../ui.js';
import { go } from '../router.js';

let advice = '';
let adviceLoading = false;

export const title = '学习看板';
export const subtitle = '关键数据反馈与薄弱点诊断';

export function render() {
  const st = computeStats(getState());
  const hasData = st.totalQuestions > 0 || st.totalWords > 0;
  return `
    <div class="grid grid-4 keep">
      ${kpi('累计词条', st.totalWords, `${st.dueCount} 个待复习`, 'book', 'var(--primary)')}
      ${kpi('平均掌握度', `${st.masteryAvg}%`, `${st.mastered} 个已掌握`, 'target', 'var(--success)')}
      ${kpi('总正确率', st.overallAccuracy === null ? '—' : `${st.overallAccuracy}%`, `${st.totalQuestions} 次作答`, 'chart', 'var(--warn)')}
      ${kpi('连续学习', `${st.streak} 天`, `累计 ${duration(st.totalMinutes)}`, 'flame', 'var(--danger)')}
    </div>

    <section class="card mt16">
      <div class="card-head"><div><h2>近 14 天学习趋势</h2><div class="sub">柱状为答题量，折线为正确率</div></div><span class="pill primary">每日更新</span></div>
      ${lineChart(st.days)}
      <div class="legend"><span><b style="background:#e7e2d4"></b>答题数</span><span><b style="background:#b23a2e"></b>正确率</span></div>
    </section>

    <div class="grid grid-2 mt16">
      <section class="card">
        <div class="card-head"><div><h2>掌握度分布</h2><div class="sub">词库整体状态</div></div></div>
        ${donut(st.buckets, st.totalWords)}
      </section>
      <section class="card">
        <div class="card-head"><div><h2>题型正确率</h2><div class="sub">找到你最擅长的考察形式</div></div></div>
        ${typeBars(st.byType)}
      </section>
    </div>

    <section class="card mt16">
      <div class="card-head"><div><h2>28 天活跃热力图</h2><div class="sub">颜色越深，当天答题越多</div></div><span class="pill">${st.heat.filter((d) => d.count > 0).length} 个学习日</span></div>
      <div class="heat-grid">${st.heat.map((d) => `<div class="heat-cell" data-l="${d.level}" title="${d.date}：${d.count} 题"></div>`).join('')}</div>
    </section>

    <div class="grid grid-2 mt16">
      <section class="card">
        <div class="card-head"><div><h2>重点复习词</h2><div class="sub">掌握度最低，优先进入下一份试卷</div></div><button class="btn btn-sm" data-action="goWords">去词库 ${icon('arrowRight', 13)}</button></div>
        ${st.weak.length ? st.weak.slice(0, 8).map((w) => `
          <div class="list-row">
            <div class="avatar">${esc(w.term.slice(0, 1).toUpperCase())}</div>
            <div style="flex:1;min-width:0"><strong class="small">${esc(w.term)}</strong><div class="tiny muted">${esc(w.meaning || '暂无释义')}</div></div>
            <div class="mastery-bar" style="width:70px"><i style="width:${w.mastery}%;background:${w.mastery >= 50 ? 'var(--primary)' : 'var(--danger)'}"></i></div>
            <span class="tiny" style="width:34px;text-align:right;font-weight:700">${w.mastery}%</span>
          </div>`).join('') : `<div class="empty" style="padding:24px">${icon('target', 30)}<h3>暂无薄弱词数据</h3><p>完成一份试卷后即可看到</p></div>`}
      </section>

      <section class="card">
        <div class="card-head"><div><h2>AI 学习建议</h2><div class="sub">基于你的真实学习数据生成</div></div>
          <button class="btn btn-sm btn-primary" data-action="advice" ${adviceLoading || !hasData ? 'disabled' : ''}>${adviceLoading ? '<span class="loading"></span>' : `${icon('sparkles', 13)} 生成建议`}</button></div>
        ${advice ? `<div class="feedback" style="white-space:pre-wrap;font-size:13px;background:var(--surface-2)">${esc(advice)}</div>
          <button class="btn btn-sm mt12" data-action="downloadAdvice">${icon('download', 13)} 下载建议</button>`
          : `<div class="empty" style="padding:30px">${icon('sparkles', 32)}<h3>让 AI 帮你复盘</h3><p>结合正确率、题型表现和薄弱词给出下一步计划</p></div>`}
      </section>
    </div>

    <section class="card mt16">
      <div class="card-head"><div><h2>数据导出与分析</h2><div class="sub">所有学习记录保存在本机（导出文件存于手机 Downloads/WordWise）</div></div></div>
      <div class="row">
        <button class="btn" data-action="exportJson">${icon('download', 14)} 完整备份 JSON</button>
        <button class="btn" data-action="exportWords">${icon('file', 14)} 词库 CSV</button>
        <button class="btn" data-action="exportAttempts">${icon('file', 14)} 作答明细 CSV</button>
        <button class="btn btn-primary" data-action="report">${icon('sparkles', 14)} 生成分析报告</button>
        <button class="btn" data-action="settings">${icon('gear', 14)} 更多设置</button>
      </div>
    </section>
  `;
}

function kpi(label, value, foot, iconName, color) {
  return `<div class="stat-card">
    <div class="stat-icon" style="background:var(--surface-2);color:${color}">${icon(iconName, 16)}</div>
    <div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-foot">${esc(foot)}</div>
  </div>`;
}

function duration(min) {
  if (!min) return '0 分钟';
  return min >= 60 ? `${Math.floor(min / 60)} 小时 ${min % 60} 分` : `${min} 分钟`;
}

function lineChart(days) {
  const W = 640, H = 210, L = 34, R = 14, T = 16, B = 30;
  const iw = W - L - R, ih = H - T - B;
  const maxQ = Math.max(5, ...days.map((d) => d.questions));
  const bw = iw / days.length * 0.5;
  const x = (i) => L + (iw / days.length) * (i + 0.5);
  const yQ = (v) => T + ih - (v / maxQ) * ih;
  const yA = (v) => T + ih - (v / 100) * ih;
  const bars = days.map((d, i) => `<rect x="${x(i) - bw / 2}" y="${yQ(d.questions)}" width="${bw}" height="${Math.max(0, T + ih - yQ(d.questions))}" rx="3" fill="#e7e2d4" />`).join('');
  const pts = days.map((d, i) => d.accuracy === null ? null : `${x(i)},${yA(d.accuracy)}`).filter(Boolean).join(' ');
  const dots = days.map((d, i) => d.accuracy === null ? '' : `<circle cx="${x(i)}" cy="${yA(d.accuracy)}" r="3.5" fill="#fff" stroke="#b23a2e" stroke-width="2"><title>${d.date}：${d.accuracy}%</title></circle>`).join('');
  const labels = days.map((d, i) => (i % 2 === 0 || i === days.length - 1) ? `<text x="${x(i)}" y="${H - 9}" text-anchor="middle" font-size="9" fill="#9d978c">${d.label}</text>` : '').join('');
  return `<div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="近14天学习趋势">
    ${[0, 25, 50, 75, 100].map((v) => `<line x1="${L}" y1="${yA(v)}" x2="${W - R}" y2="${yA(v)}" stroke="#efece3" stroke-width="1"/><text x="${L - 8}" y="${yA(v) + 3}" text-anchor="end" font-size="9" fill="#b0a99c">${v}</text>`).join('')}
    ${bars}
    ${pts ? `<polyline points="${pts}" fill="none" stroke="#b23a2e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />` : ''}
    ${dots}${labels}
  </svg></div>`;
}

function donut(buckets, total) {
  const items = [
    ['已掌握', buckets.mastered, '#2f6b4f'],
    ['熟悉中', buckets.familiar, '#b23a2e'],
    ['初识', buckets.beginner, '#8a5a12'],
    ['未学', buckets.unseen, '#e9e4d7']
  ];
  const R = 54, C = 2 * Math.PI * R;
  let offset = 0;
  const circles = items.map(([label, value, color]) => {
    const len = total ? (value / total) * C : 0;
    const el = `<circle cx="80" cy="80" r="${R}" fill="none" stroke="${color}" stroke-width="18" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)"><title>${label}：${value}</title></circle>`;
    offset += len;
    return el;
  }).join('');
  return `<div class="row" style="align-items:center;justify-content:center;gap:26px;flex-wrap:wrap">
    <svg width="160" height="160" viewBox="0 0 160 160">${circles}
      <text x="80" y="76" text-anchor="middle" font-size="26" font-weight="500" font-family="Georgia, serif" fill="#17150f">${total}</text>
      <text x="80" y="95" text-anchor="middle" font-size="10" fill="#78736a">总词条</text>
    </svg>
    <div style="min-width:130px">${items.map(([label, value, color]) => `<div class="spread small" style="padding:5px 0"><span class="row" style="gap:7px"><b style="width:9px;height:9px;border-radius:3px;background:${color};display:inline-block"></b>${label}</span><strong>${value}</strong></div>`).join('')}</div>
  </div>`;
}

function typeBars(byType) {
  const names = { meaning: '释义选择', usage: '选词填空', fill: '单词填空', spell: '单词拼写', translation: '句子翻译', reading: '阅读理解' };
  const entries = Object.entries(byType).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));
  if (!entries.length) return `<div class="empty" style="padding:30px">${icon('chart', 30)}<h3>暂无题型数据</h3><p>完成试卷后自动统计</p></div>`;
  return entries.map(([type, v]) => {
    const pct = Math.round((v.correct / v.total) * 100);
    const color = pct >= 80 ? '#2f6b4f' : pct >= 60 ? '#b23a2e' : '#a8352a';
    return `<div style="margin-bottom:13px"><div class="spread small"><span>${names[type] || type}</span><strong>${pct}% <span class="muted tiny">(${v.correct}/${v.total})</span></strong></div>
      <div class="progress mt8"><i style="width:${pct}%;background:${color}"></i></div></div>`;
  }).join('');
}

function statsForExport() {
  const st = computeStats(getState());
  return {
    generatedAt: new Date().toISOString(),
    overview: { totalWords: st.totalWords, mastered: st.mastered, masteryAvg: st.masteryAvg, totalQuestions: st.totalQuestions, overallAccuracy: st.overallAccuracy, totalQuizzes: st.totalQuizzes, streak: st.streak, totalMinutes: st.totalMinutes },
    distribution: st.buckets,
    byType: st.byType,
    daily: st.days,
    weakWords: st.weak
  };
}

function csvCell(v) { return `"${String(v ?? '').replace(/"/g, '""')}"`; }

export function mount() {
  document.getElementById('view').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action;
    if (a === 'goWords') { go('words'); return; }
    if (a === 'settings') { go('settings'); return; }
    if (a === 'exportJson') {
      download(`wordwise-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(getState(), null, 2), 'application/json');
      toast('完整备份已下载', 'success'); return;
    }
    if (a === 'exportWords') {
      const rows = [['term', 'phonetic', 'pos', 'meaning', 'example', 'translation', 'mastery', 'seen', 'correct', 'wrong']];
      getState().words.forEach((w) => rows.push([w.term, w.phonetic, w.pos, w.meaning, w.example, w.exampleTranslation,
        Math.round((w.srs?.level || 0) / 8 * 78), w.srs?.seen || 0, w.srs?.correct || 0, w.srs?.wrong || 0]));
      download(`wordwise-词库-${new Date().toISOString().slice(0, 10)}.csv`, '\ufeff' + rows.map((r) => r.map(csvCell).join(',')).join('\n'), 'text/csv;charset=utf-8');
      toast('词库 CSV 已下载', 'success'); return;
    }
    if (a === 'exportAttempts') {
      const rows = [['date', 'type', 'prompt', 'response', 'answer', 'correct', 'score', 'feedback']];
      getState().attempts.forEach((att) => att.answers.forEach((ans) => rows.push([att.date, ans.type, ans.prompt, ans.response, ans.modelAnswer || ans.answer, ans.correct ? 1 : 0, ans.score, ans.feedback])));
      download(`wordwise-作答明细-${new Date().toISOString().slice(0, 10)}.csv`, '\ufeff' + rows.map((r) => r.map(csvCell).join(',')).join('\n'), 'text/csv;charset=utf-8');
      toast('作答明细 CSV 已下载', 'success'); return;
    }
    if (a === 'advice') {
      adviceLoading = true; refreshMe();
      try { advice = await generateAdvice(statsForExport()); toast('建议已生成', 'success'); }
      catch (err) { toast(`生成失败：${err.message}`, 'error'); }
      adviceLoading = false; refreshMe(); return;
    }
    if (a === 'downloadAdvice') { download('wordwise-学习建议.md', advice, 'text/markdown;charset=utf-8'); return; }
    if (a === 'report') {
      toast('正在生成分析报告…', 'info');
      try {
        const { generateReport } = await import('../ai.js');
        const report = await generateReport(statsForExport());
        download(`wordwise-分析报告-${new Date().toISOString().slice(0, 10)}.md`, report, 'text/markdown;charset=utf-8');
        toast('分析报告已下载', 'success');
      } catch (err) { toast(`报告生成失败：${err.message}`, 'error'); }
    }
  });
}

function refreshMe() { import('../router.js').then(({ refresh }) => refresh()); }
