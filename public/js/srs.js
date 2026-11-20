// 简化版间隔重复（SM-2 思路）：答对拉长间隔，答错快速重排

const INTERVALS = [0, 1, 2, 4, 7, 15, 30, 60, 120]; // 天

export function newSRS() {
  return { level: 0, dueAt: Date.now(), ease: 2.5, seen: 0, correct: 0, wrong: 0, lastReview: null };
}

export function ensureSRS(word) {
  if (!word.srs || typeof word.srs !== 'object') word.srs = newSRS();
  return word.srs;
}

export function isDue(word, now = Date.now()) {
  const s = ensureSRS(word);
  return !s.dueAt || s.dueAt <= now || s.level === 0;
}

export function mastery(word) {
  const s = ensureSRS(word);
  if (!s.seen) return 0;
  const acc = s.correct / Math.max(1, s.correct + s.wrong);
  return Math.max(0, Math.min(100, Math.round((Math.min(s.level, 8) / 8) * 78 + acc * 22)));
}

export function applyReview(word, correct) {
  const s = ensureSRS(word);
  const now = Date.now();
  s.seen = (s.seen || 0) + 1;
  if (correct) {
    s.correct = (s.correct || 0) + 1;
    s.level = Math.min(8, (s.level || 0) + 1);
    const days = INTERVALS[s.level] ?? 120;
    s.dueAt = now + days * 86400000;
    s.ease = Math.min(3.2, (s.ease || 2.5) + 0.05);
  } else {
    s.wrong = (s.wrong || 0) + 1;
    s.level = Math.max(0, (s.level || 0) - 2);
    s.dueAt = now + 10 * 60 * 1000; // 10 分钟后重来
    s.ease = Math.max(1.8, (s.ease || 2.5) - 0.12);
  }
  s.lastReview = new Date(now).toISOString();
  return s;
}

export function weakWords(words, limit = 8) {
  return [...words]
    .filter((w) => (w.srs?.seen || 0) > 0 || (w.srs?.level || 0) === 0)
    .sort((a, b) => mastery(a) - mastery(b) || (b.srs?.wrong || 0) - (a.srs?.wrong || 0))
    .slice(0, limit);
}

export function dueWords(words, limit = 30) {
  return words.filter((w) => isDue(w)).slice(0, limit);
}

export function masteryBucket(word) {
  const m = mastery(word);
  if (m >= 80) return { label: '已掌握', cls: 'success', color: '#1a9c64' };
  if (m >= 50) return { label: '熟悉中', cls: 'primary', color: '#5b5bd6' };
  if (m > 0) return { label: '初识', cls: 'warn', color: '#f0a020' };
  return { label: '未学', cls: '', color: '#c9cedd' };
}
