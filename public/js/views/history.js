// 长难句讲解历史：回顾每次的句子翻译、结构与可视化讲解

import { getSentenceHistory, deleteSentenceHistory, clearSentenceHistory } from '../store.js';
import { icon, esc, toast, modal, confirmDialog, dateKey } from '../ui.js';
import { vizModalBody, mountVizToggles } from '../viz.js';
import { go, refresh } from '../router.js';

let keyword = '';
let limit = 20;

export const title = '长难句历史';
export const subtitle = '所有讲解过的句子、翻译与结构，随时回顾';

function filtered() {
  const kw = keyword.trim().toLowerCase();
  return getSentenceHistory().filter((h) => {
    if (!kw) return true;
    return (h.sentence || '').toLowerCase().includes(kw)
      || (h.translation || '').toLowerCase().includes(kw)
      || (h.articleTitle || '').toLowerCase().includes(kw);
  });
}

export function render() {
  const list = filtered();
  const all = getSentenceHistory();
  return `
    <section class="card">
      <div class="card-head">
        <div><h2>讲解记录 <span class="pill">${list.length}</span></h2>
          <div class="sub">累计 ${all.length} 条 · 点击任意一条查看彩色可视化讲解</div></div>
        ${all.length ? `<button class="btn btn-sm btn-danger" data-action="clearAll">${icon('trash', 13)} 清空</button>` : ''}
      </div>
      <div class="row" style="margin-bottom:14px">
        <div style="position:relative;flex:1;min-width:180px">
          <span style="position:absolute;left:11px;top:11px;color:var(--muted)">${icon('search', 16)}</span>
          <input class="input" id="histSearch" placeholder="搜索句子、翻译或文章标题…" value="${esc(keyword)}" style="padding-left:36px" />
        </div>
        <button class="btn btn-sm" data-action="goReader">${icon('reader', 13)} 去阅读器</button>
      </div>
      ${list.length ? `
        <div class="history-list">${list.slice(0, limit).map((h, i) => card(h, i)).join('')}</div>
        ${list.length > limit ? `<div class="row" style="justify-content:center;margin-top:16px">
          <button class="btn" data-action="more">加载更多（剩余 ${list.length - limit}）</button></div>` : ''}
      ` : `<div class="empty">${icon('chat', 34)}<h3>${keyword ? '没有匹配的记录' : '还没有讲解记录'}</h3>
        <p>${keyword ? '换个关键词试试' : '在文章阅读器里点击句子讲解后，会自动记录到这里'}</p>
        <button class="btn btn-primary btn-sm" data-action="goReader">去阅读器</button></div>`}
    </section>
  `;
}

function card(h, i) {
  const hasViz = !!(h.nlp?.tokens?.length);
  return `<div class="history-item" data-id="${h.id}">
    <div class="spread">
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <span class="pill ${hasViz ? 'primary' : ''}">${hasViz ? '可视化' : '文本'}</span>
        ${h.times > 1 ? `<span class="tiny muted">讲解 ${h.times} 次</span>` : ''}
        ${h.articleTitle ? `<span class="tiny muted">${icon('file', 11)} ${esc(h.articleTitle.slice(0, 24))}</span>` : ''}
      </div>
      <span class="tiny muted">${esc((h.updatedAt || '').slice(0, 10))}</span>
    </div>
    <div class="hist-sentence" title="${esc(h.sentence)}">${esc(h.sentence)}</div>
    ${h.myTranslation ? `<div class="hist-mine">我的译文：${esc(h.myTranslation.slice(0, 140))}</div>` : ''}
    <div class="hist-trans">${esc((h.translation || '').slice(0, 160))}</div>
    <div class="row mt8" style="gap:6px">
      <button class="btn btn-sm" data-action="view" data-id="${h.id}">${icon('eye', 13)} 可视化回顾</button>
      <button class="btn btn-sm btn-ghost" type="button" data-speak="${esc(h.sentence)}">${icon('volume', 13)} 听这句</button>
      <button class="btn btn-sm btn-ghost" data-action="del" data-id="${h.id}" style="color:var(--danger)">${icon('trash', 13)}</button>
    </div>
  </div>`;
}

export function mount() {
  const view = document.getElementById('view');
  const search = view.querySelector('#histSearch');
  let timer;
  if (search) {
    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        keyword = search.value;
        refresh();
        const el = document.getElementById('histSearch');
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      }, 350);
    });
  }

  view.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action;
    if (a === 'goReader') { go('reader'); return; }
    if (a === 'more') { limit += 20; refresh(); return; }
    if (a === 'view') {
      const h = getSentenceHistory().find((x) => x.id === btn.dataset.id);
      if (!h) return;
      await modal({
        title: '句子可视化讲解 · 历史回顾',
        wide: true,
        body: vizModalBody(h),
        onMount: mountVizToggles,
        actions: [{ label: '关闭', value: null }]
      });
      return;
    }
    if (a === 'del') {
      const h = getSentenceHistory().find((x) => x.id === btn.dataset.id);
      if (!h) return;
      const ok = await confirmDialog('删除记录', `确定删除这条句子记录吗？\n\n${h.sentence.slice(0, 80)}`, '删除');
      if (ok) { deleteSentenceHistory(h.id); toast('已删除', 'success'); refresh(); }
      return;
    }
    if (a === 'clearAll') {
      const ok = await confirmDialog('清空历史', '将删除全部长难句讲解记录，此操作不可撤销。建议先确认不再需要。', '确认清空');
      if (ok) { clearSentenceHistory(); toast('历史已清空', 'success'); refresh(); }
      return;
    }
  });
}
