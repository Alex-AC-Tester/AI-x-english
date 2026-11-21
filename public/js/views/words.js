import { getState, addWords, updateWord, deleteWord, saveQuiz } from '../store.js';
import { mastery, masteryBucket, isDue } from '../srs.js';
import { icon, esc, toast, modal, confirmDialog } from '../ui.js';
import { go } from '../router.js';

let filter = 'all';
let keyword = '';
let limit = 20;

export const title = '我的词库';
export const subtitle = '管理词条、掌握度与复习计划';

const FILTERS = [
  ['all', '全部'], ['due', '待复习'], ['unseen', '未学'], ['beginner', '初识'], ['familiar', '熟悉中'], ['mastered', '已掌握']
];

function filtered() {
  const words = [...getState().words];
  const kw = keyword.trim().toLowerCase();
  return words.filter((w) => {
    if (kw && !(w.term || '').toLowerCase().includes(kw) && !(w.meaning || '').toLowerCase().includes(kw)) return false;
    if (filter === 'due') return isDue(w);
    if (filter === 'all') return true;
    const m = mastery(w);
    if (filter === 'unseen') return m === 0;
    if (filter === 'beginner') return m > 0 && m < 50;
    if (filter === 'familiar') return m >= 50 && m < 80;
    if (filter === 'mastered') return m >= 80;
    return true;
  }).sort((a, b) => mastery(a) - mastery(b));
}

export function render() {
  const list = filtered();
  const shown = list.slice(0, limit);
  const state = getState();
  return `
    <section class="card">
      <div class="card-head">
        <div><h2>词条列表 <span class="pill">${list.length}</span></h2><div class="sub">共 ${state.words.length} 个词条 · 按掌握度从低到高排序</div></div>
        <div class="row">
          <button class="btn btn-sm" data-action="add">${icon('plus', 14)} 手动添加</button>
          <button class="btn btn-primary btn-sm" data-action="import">${icon('camera', 14)} 拍照导入</button>
        </div>
      </div>
      <div class="row" style="margin-bottom:14px">
        <div style="position:relative;flex:1;min-width:180px">
          <span style="position:absolute;left:11px;top:9px;color:var(--faint);pointer-events:none">${icon('search', 16)}</span>
          <input class="input" id="wordSearch" placeholder="搜索单词或释义…" value="${esc(keyword)}" style="padding-left:36px" />
        </div>
        <button class="btn btn-sm" data-action="makeQuiz">${icon('sparkles', 14)} 用当前列表出题</button>
      </div>
      <div class="row" style="margin-bottom:16px;gap:6px">
        ${FILTERS.map(([key, label]) => `<button class="chip ${filter === key ? 'active' : ''}" data-filter="${key}">${label}</button>`).join('')}
      </div>
      ${shown.length
        ? `<div class="grid grid-2">${shown.map((w) => card(w)).join('')}</div>`
        : (state.words.length === 0
          ? `<div class="empty">${icon('bookOpen', 30)}<h3>词库还是空的</h3><p>拍照导入单词表，或在文章里点句子、把重点词收进来</p><button class="btn btn-primary btn-sm" data-action="import">拍照导入</button></div>`
          : `<div class="empty">${icon('search', 30)}<h3>没有匹配的词条</h3><p>换个关键词或筛选条件试试</p><button class="btn btn-sm" data-action="import">去导入</button></div>`)}
      ${list.length > shown.length ? `<div class="row" style="justify-content:center;margin-top:16px"><button class="btn" data-action="more">加载更多（剩余 ${list.length - shown.length}）</button></div>` : ''}
    </section>
  `;
}

function card(w) {
  const m = mastery(w);
  const b = masteryBucket(w);
  const due = isDue(w);
  return `<div class="word-item" data-id="${w.id}">
    <div class="spread">
      <div style="min-width:0">
        <span class="word-term">${esc(w.term)}</span>
        <button class="tts-btn" type="button" data-speak="${esc(w.term)}" title="听发音" aria-label="听 ${esc(w.term)} 的发音">${icon('volume', 14)}</button>
        ${w.phonetic ? `<span class="word-phonetic">${esc(w.phonetic)}</span>` : ''}
      </div>
      <span class="pill ${b.cls}">${b.label}</span>
    </div>
    <div class="word-meaning">${esc(w.meaning || '—')}${w.pos ? ` <span class="tiny muted">${esc(w.pos)}</span>` : ''}</div>
    ${w.example ? `<div class="word-example">${esc(w.example)}<button class="tts-btn tts-inline" type="button" data-speak="${esc(w.example)}" title="听例句" aria-label="听例句">${icon('volume', 12)}</button></div>` : ''}
    <div class="spread mt12">
      <div class="row tiny muted" style="gap:8px">
        <span>${w.srs?.seen || 0} 次练习</span><span>·</span>
        <span>错 ${w.srs?.wrong || 0} 次</span>
        ${due ? '<span class="pill warn">待复习</span>' : ''}
      </div>
      <div class="row" style="gap:6px">
        <div class="mastery-bar" title="掌握度 ${m}%"><i style="width:${m}%;background:${b.color}"></i></div>
        <button class="btn btn-sm btn-ghost" data-edit="${w.id}" title="编辑">${icon('edit', 14)}</button>
        <button class="btn btn-sm btn-ghost" data-del="${w.id}" title="删除" style="color:var(--danger)">${icon('trash', 14)}</button>
      </div>
    </div>
  </div>`;
}

function wordForm(w = {}) {
  return `
    <div class="grid grid-2">
      <div class="field"><label>单词 / 短语 *</label><input class="input" id="f_term" value="${esc(w.term || '')}" placeholder="abandon" /></div>
      <div class="field"><label>音标</label><input class="input" id="f_phonetic" value="${esc(w.phonetic || '')}" placeholder="/əˈbændən/" /></div>
      <div class="field"><label>词性</label><input class="input" id="f_pos" value="${esc(w.pos || '')}" placeholder="v." /></div>
      <div class="field"><label>中文释义</label><input class="input" id="f_meaning" value="${esc(w.meaning || '')}" placeholder="放弃；抛弃" /></div>
      <div class="field" style="grid-column:1/-1"><label>例句</label><textarea class="textarea" id="f_example" placeholder="He abandoned the plan.">${esc(w.example || '')}</textarea></div>
      <div class="field" style="grid-column:1/-1"><label>例句翻译</label><input class="input" id="f_exampleTranslation" value="${esc(w.exampleTranslation || '')}" placeholder="他放弃了那个计划。" /></div>
    </div>`;
}

function readForm(overlay) {
  const get = (id) => overlay.querySelector(`#${id}`)?.value.trim() || '';
  return { term: get('f_term'), phonetic: get('f_phonetic'), pos: get('f_pos'), meaning: get('f_meaning'), example: get('f_example'), exampleTranslation: get('f_exampleTranslation') };
}

export function mount() {
  const view = document.getElementById('view');
  const search = view.querySelector('#wordSearch');
  let timer;
  search?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      keyword = search.value;
      const pos = search.selectionStart;
      import('../router.js').then(({ refresh }) => { refresh(); const el = document.getElementById('wordSearch'); if (el) { el.focus(); el.setSelectionRange(pos, pos); } });
    }, 350);
  });

  view.addEventListener('click', async (e) => {
    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) { filter = filterBtn.dataset.filter; limit = 20; import('../router.js').then(({ refresh }) => refresh()); return; }

    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      const w = getState().words.find((x) => x.id === editBtn.dataset.edit);
      const v = await modal({ title: '编辑词条', body: wordForm(w), wide: true,
        actions: [{ label: '取消', value: null }, { label: '保存', cls: 'btn-primary', value: (ov) => readForm(ov) }] });
      if (v?.term) { updateWord(w.id, v); toast('已保存', 'success'); }
      return;
    }

    const delBtn = e.target.closest('[data-del]');
    if (delBtn) {
      const w = getState().words.find((x) => x.id === delBtn.dataset.del);
      if (!w) return;
      const ok = await confirmDialog('删除词条', `确定删除「${w.term}」吗？此操作不可撤销。`, '删除');
      if (ok) { deleteWord(w.id); toast('已删除', 'success'); }
      return;
    }

    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action;
    if (a === 'import') go('import');
    if (a === 'more') { limit += 20; import('../router.js').then(({ refresh }) => refresh()); }
    if (a === 'add') {
      const v = await modal({ title: '手动添加词条', body: wordForm(), wide: true,
        actions: [{ label: '取消', value: null }, { label: '保存', cls: 'btn-primary', value: (ov) => readForm(ov) }] });
      if (v?.term) { addWords([v]); toast('已添加', 'success'); }
    }
    if (a === 'makeQuiz') {
      const list = filtered();
      if (list.length < 2) { toast('至少需要 2 个词条', 'error'); return; }
      const quiz = {
        id: `q_${Date.now().toString(36)}`, date: new Date().toLocaleDateString('sv-SE'),
        createdAt: new Date().toISOString(), status: 'draft',
        targetWordIds: list.map((w) => w.id), passage: null, questions: [], focus: '词库指定范围'
      };
      saveQuiz(quiz);
      go('quiz', { mode: 'take', id: quiz.id });
    }
  });
}
