// 用户画像：把学习记录汇总成一份可解释的画像，供页面展示和 AI 个性化使用。
// 全部在本地计算，不上传；只在调用 AI 时把浓缩后的文字摘要作为提示词的一部分。

import { mastery } from './srs.js';
import { dateKey } from './ui.js';

const DAY = 86400000;

function daysAgo(n) {
  const d = new Date(Date.now() - n * DAY);
  return dateKey(d);
}

function estimateLevel({ avgMastery, totalWords, accuracy, explained }) {
  let score = 0;
  if (totalWords >= 3000) score += 34;
  else if (totalWords >= 1500) score += 27;
  else if (totalWords >= 800) score += 20;
  else if (totalWords >= 300) score += 12;
  else if (totalWords >= 80) score += 6;

  score += Math.round((avgMastery / 100) * 26);
  if (accuracy != null) score += Math.round(((accuracy - 50) / 50) * 20);
  if (explained >= 60) score += 18;
  else if (explained >= 25) score += 12;
  else if (explained >= 8) score += 6;

  score = Math.max(0, Math.min(100, score));
  const bands = [
    { min: 82, code: 'B2+', label: '中高级', advice: '可以读原版书与长难句密集的材料' },
    { min: 66, code: 'B1+', label: '中级偏上', advice: '适合高考压轴题与大学四级材料' },
    { min: 48, code: 'B1', label: '中级', advice: '以高考中档题和分级读物为主' },
    { min: 30, code: 'A2+', label: '初级偏上', advice: '先补高频词与基本句型' },
    { min: 0, code: 'A2', label: '初级', advice: '从中短句、常用词开始，少讲多练' }
  ];
  return { score, ...(bands.find((b) => score >= b.min) || bands[bands.length - 1]) };
}

/** 构建画像。state 来自 store.getState() */
export function buildProfile(state = {}) {
  const words = state.words || [];
  const attempts = state.attempts || [];
  const activity = state.activity || [];
  const articles = state.articles || [];
  const history = state.sentenceHistory || [];

  const mastered = words.filter((w) => mastery(w) >= 80).length;
  const learning = words.filter((w) => { const m = mastery(w); return m > 0 && m < 80; }).length;
  const untouched = words.length - mastered - learning;
  const avgMastery = words.length ? Math.round(words.reduce((n, w) => n + mastery(w), 0) / words.length) : 0;

  const answers = attempts.flatMap((a) => a.answers || []);
  const totalQ = answers.length;
  const correctQ = answers.filter((x) => x.correct).length;
  const accuracy = totalQ ? Math.round((correctQ / totalQ) * 100) : null;

  const recentCut = daysAgo(30);
  const recent = answers.filter((x) => String(x.answeredAt || '').slice(0, 10) >= recentCut);
  const recentAccuracy = recent.length ? Math.round((recent.filter((x) => x.correct).length / recent.length) * 100) : null;

  const byType = {};
  answers.forEach((x) => {
    const t = x.type || 'other';
    byType[t] = byType[t] || { total: 0, correct: 0 };
    byType[t].total++;
    if (x.correct) byType[t].correct++;
  });
  const typeRows = Object.entries(byType)
    .map(([type, v]) => ({ type, total: v.total, accuracy: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => b.total - a.total);

  const weakWords = [...words]
    .filter((w) => (w.srs?.wrong || 0) > 0 || (w.srs?.seen || 0) > 0)
    .map((w) => ({ term: w.term, meaning: w.meaning, mastery: mastery(w), wrong: w.srs?.wrong || 0 }))
    .sort((a, b) => b.wrong - a.wrong || a.mastery - b.mastery)
    .slice(0, 8);

  const explained = history.length;
  const articleWords = articles.map((a) => (String(a.text || '').match(/[A-Za-z][A-Za-z'-]*/g) || []).length);
  const avgArticleWords = articleWords.length ? Math.round(articleWords.reduce((a, b) => a + b, 0) / articleWords.length) : 0;

  const activeDays = new Set(activity.filter((a) => (a.questions || 0) > 0 || (a.wordsAdded || 0) > 0).map((a) => a.date));
  let streak = 0;
  const cursor = new Date();
  if (!activeDays.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDays.has(dateKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }

  const active30 = [...activeDays].filter((d) => d >= recentCut).length;
  const totalMinutes = activity.reduce((n, a) => n + (a.minutes || 0), 0);

  const level = estimateLevel({ avgMastery, totalWords: words.length, accuracy, explained });

  // 关注点：按优先级给出 2-4 条，直接可用于个性化建议
  const focus = [];
  if (!words.length) focus.push('先建立词库：导入一篇文章，把不认识的词收进来');
  else if (untouched > words.length * 0.6) focus.push('大量词条还没开始复习，先按今日到期清一轮');
  if (weakWords.length) focus.push(`易错词集中在 ${weakWords.slice(0, 3).map((w) => w.term).join('、')}`);
  if (accuracy != null && accuracy < 70) focus.push('答题正确率偏低，讲解时多给中文释义与例句');
  if (explained < 5) focus.push('精读量还少，建议每天至少精读 2 个长难句');
  if (avgArticleWords > 900) focus.push('常读长文，注意分段推进，别一口气啃完');
  if (!focus.length) focus.push('保持当前节奏，可以尝试更高难度的材料');

  const summaryParts = [
    `当前水平约 ${level.code}（${level.label}）。`,
    words.length ? `词库 ${words.length} 词，已掌握 ${mastered}、在学 ${learning}，平均掌握度 ${avgMastery}%。` : '词库还是空的。',
    accuracy != null ? `累计答题 ${totalQ} 道，正确率 ${accuracy}%${recentAccuracy != null ? `，近 30 天 ${recentAccuracy}%` : ''}。` : '还没有答题记录。',
    explained ? `精读过 ${explained} 个句子，共读 ${articles.length} 篇文章，平均每篇 ${avgArticleWords} 词。` : '还没做过句子精读。',
    streak ? `已连续学习 ${streak} 天。` : ''
  ];

  const prompt = [
    `【学生画像】水平 ${level.code}（${level.label}，估分 ${level.score}/100）。`,
    `词库 ${words.length} 词（掌握 ${mastered}，在学 ${learning}，平均掌握度 ${avgMastery}%）。`,
    accuracy != null ? `答题正确率 ${accuracy}%（共 ${totalQ} 题${recentAccuracy != null ? `，近 30 天 ${recentAccuracy}%` : ''}）。` : '',
    explained ? `已精读 ${explained} 句。` : '',
    weakWords.length ? `易错词：${weakWords.slice(0, 5).map((w) => w.term).join('、')}。` : '',
    `教学策略：讲解用中文，术语点到为止；例句贴近其水平；长难句先给主干再讲修饰层。`
  ].filter(Boolean).join('\n');

  return {
    level,
    vocabulary: { total: words.length, mastered, learning, untouched, avgMastery },
    accuracy: { overall: accuracy, recent: recentAccuracy, total: totalQ, byType: typeRows },
    weakWords,
    reading: { articles: articles.length, explained, avgArticleWords },
    habits: { streak, active30, totalMinutes, totalWordsAdded: words.length },
    focus,
    summary: summaryParts.filter(Boolean).join(''),
    prompt,
    generatedAt: new Date().toISOString()
  };
}

/** 供 AI 提示词使用的画像摘要（拿不到画像时返回空串） */
export function profilePrompt(state) {
  try {
    return buildProfile(state).prompt;
  } catch (_) {
    return '';
  }
}
