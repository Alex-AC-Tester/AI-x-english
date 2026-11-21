// 统计计算：供首页、看板、报告共用

import { dateKey } from './ui.js';
import { mastery, weakWords, isDue } from './srs.js';

export function computeStats(state) {
  const words = state.words || [];
  const attempts = state.attempts || [];
  const activity = state.activity || [];
  const today = dateKey();

  const buckets = { mastered: 0, familiar: 0, beginner: 0, unseen: 0 };
  words.forEach((w) => {
    const m = mastery(w);
    if (m >= 80) buckets.mastered++;
    else if (m >= 50) buckets.familiar++;
    else if (m > 0) buckets.beginner++;
    else buckets.unseen++;
  });

  const todayAct = activity.find((a) => a.date === today) || { date: today, wordsAdded: 0, questions: 0, correct: 0, quizzes: 0, minutes: 0 };
  const totalQuestions = attempts.reduce((n, a) => n + (a.answers?.length || 0), 0);
  const totalCorrect = attempts.reduce((n, a) => n + (a.answers || []).filter((x) => x.correct).length, 0);

  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const a = activity.find((x) => x.date === key);
    days.push({
      date: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      questions: a?.questions || 0,
      correct: a?.correct || 0,
      accuracy: a?.questions ? Math.round((a.correct / a.questions) * 100) : null,
      minutes: a?.minutes || 0
    });
  }

  let streak = 0;
  const activeDates = new Set(activity.filter((a) => (a.questions || 0) > 0 || (a.wordsAdded || 0) > 0).map((a) => a.date));
  const cursor = new Date();
  if (!activeDates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (activeDates.has(dateKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }

  const byType = {};
  attempts.forEach((a) => (a.answers || []).forEach((ans) => {
    const t = ans.type || 'other';
    byType[t] = byType[t] || { total: 0, correct: 0 };
    byType[t].total++;
    if (ans.correct) byType[t].correct++;
  }));

  const heat = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const a = activity.find((x) => x.date === key);
    const q = a?.questions || 0;
    heat.push({ date: key, count: q, level: q === 0 ? 0 : q < 5 ? 1 : q < 10 ? 2 : q < 20 ? 3 : 4 });
  }

  return {
    todayKey: today,
    totalWords: words.length,
    mastered: buckets.mastered,
    buckets,
    dueCount: words.filter((w) => isDue(w)).length,
    today: {
      questions: todayAct.questions,
      correct: todayAct.correct,
      accuracy: todayAct.questions ? Math.round((todayAct.correct / todayAct.questions) * 100) : null,
      minutes: todayAct.minutes,
      quizzes: todayAct.quizzes,
      wordsAdded: todayAct.wordsAdded
    },
    totalQuestions,
    totalCorrect,
    overallAccuracy: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : null,
    totalQuizzes: attempts.length,
    totalMinutes: activity.reduce((n, a) => n + (a.minutes || 0), 0),
    streak,
    days,
    byType,
    heat,
    weak: weakWords(words, 10).map((w) => ({ term: w.term, meaning: w.meaning, mastery: mastery(w), wrong: w.srs?.wrong || 0 })),
    lastAttempts: [...attempts].sort((a, b) => String(b.finishedAt || '').localeCompare(String(a.finishedAt || ''))).slice(0, 6),
    masteryAvg: words.length ? Math.round(words.reduce((n, w) => n + mastery(w), 0) / words.length) : 0
  };
}
