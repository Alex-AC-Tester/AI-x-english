import { getState, addWords, logActivity } from '../store.js';
import { ocrImage, ocrText, compressImage } from '../ai.js';
import { icon, esc, toast, modal, pickFile, readAsDataURL, dateKey } from '../ui.js';
import { go, refresh } from '../router.js';

export const title = '导入词库';
export const subtitle = '拍照识别，AI 自动结构化词条';

let draft = { dataUrl: null, fileName: '', items: [], hint: '', rawText: '', busy: false, checked: null };

export function render() {
  const s = getState();
  return `
    <div class="grid grid-2">
      <section class="card">
        <div class="card-head"><div><h2>拍照 / 相册导入</h2><div class="sub">支持单词书、学案、练习册、试卷照片</div></div>${icon('camera', 18)}</div>
        <div class="dropzone" data-action="camera">
          ${draft.dataUrl
            ? `<img class="preview-img" src="${draft.dataUrl}" alt="待识别照片" />`
            : `${icon('camera', 34)}<h3>点击拍照或选择照片</h3><p>安卓手机可直接调用后置摄像头 · 支持 JPG / PNG / WebP</p>`}
        </div>
        <div class="row mt12">
          <button class="btn btn-primary" data-action="camera">${icon('camera')} 拍照</button>
          <button class="btn" data-action="album">${icon('image')} 相册</button>
          ${draft.dataUrl ? `<button class="btn btn-ghost btn-sm" data-action="clearImage">移除照片</button>` : ''}
        </div>
        <div class="field mt16"><label>补充说明（可选）</label>
          <input class="input" id="ocrHint" placeholder="例如：这是高三英语词汇表，只提取单词和中文释义" value="${esc(draft.hint)}" />
        </div>
        <button class="btn btn-accent btn-block" data-action="runOcr" ${draft.busy || !draft.dataUrl ? 'disabled' : ''}>
          ${draft.busy ? '<span class="loading"></span> AI 识别中…' : `${icon('sparkles')} 开始 AI 识别`}
        </button>
      </section>

      <section class="card">
        <div class="card-head"><div><h2>粘贴文字导入</h2><div class="sub">没有照片？直接粘贴单词表文本</div></div>${icon('file', 18)}</div>
        <div class="field"><label>文本内容</label>
          <textarea class="textarea" id="pasteText" style="min-height:190px" placeholder="例如：&#10;abandon  v. 放弃&#10;He abandoned the plan. 他放弃了那个计划。">${esc(draft.rawText)}</textarea>
        </div>
        <button class="btn btn-accent btn-block" data-action="runText" ${draft.busy || !draft.rawText.trim() ? 'disabled' : ''}>
          ${draft.busy ? '<span class="loading"></span> 处理中…' : `${icon('sparkles')} 从文字提取词条`}
        </button>
        <div class="feedback mt16">${icon('info', 14)} 识别结果会先进入确认列表，你可以逐条修改后再入库，避免误识别污染词库。</div>
      </section>
    </div>

    <section class="card mt16">
      <div class="card-head">
        <div><h2>识别结果确认</h2><div class="sub">${draft.items.length ? `共 ${draft.items.length} 条，勾选后入库` : '尚未识别，完成上方任一方式后显示'}</div></div>
        ${draft.items.length ? `<div class="row">
          <button class="btn btn-sm" data-action="toggleAll">${draft.checked === null || draft.checked?.size === draft.items.length ? '取消全选' : '全选'}</button>
          <button class="btn btn-primary btn-sm" data-action="saveItems">${icon('check')} 确认入库</button>
        </div>` : ''}
      </div>
      ${draft.items.length ? `
        <div class="grid grid-2">
          ${draft.items.map((it, i) => `
            <div class="review-item" data-index="${i}">
              <div class="spread">
                <label class="row small" style="gap:7px"><input type="checkbox" class="pick" data-i="${i}" ${isChecked(i) ? 'checked' : ''} /><strong>#${i + 1}</strong></label>
                <span class="tiny muted">${esc(it.pos || '')}</span>
              </div>
              <input data-field="term" data-i="${i}" value="${esc(it.term)}" placeholder="单词 / 短语" />
              <input data-field="phonetic" data-i="${i}" value="${esc(it.phonetic)}" placeholder="音标" />
              <textarea data-field="meaning" data-i="${i}" rows="2" placeholder="中文释义">${esc(it.meaning)}</textarea>
              <textarea data-field="example" data-i="${i}" rows="2" placeholder="例句">${esc(it.example)}</textarea>
            </div>`).join('')}
        </div>` : `<div class="empty">${icon('layers', 32)}<h3>还没有待确认的词条</h3><p>拍一张单词书的照片试试看</p></div>`}
    </section>

    <section class="card mt16">
      <div class="card-head"><div><h2>当前词库</h2><div class="sub">已累计 ${s.words.length} 个词条</div></div><button class="btn btn-sm" data-action="goWords">管理词库 ${icon('arrowRight', 13)}</button></div>
    </section>
  `;
}

function isChecked(i) {
  if (!draft.checked) return true;
  return draft.checked.has(i);
}

function collectInputs() {
  document.querySelectorAll('.review-item input[data-field], .review-item textarea[data-field]').forEach((el) => {
    const i = Number(el.dataset.i);
    if (draft.items[i]) draft.items[i][el.dataset.field] = el.value;
  });
  const hint = document.getElementById('ocrHint');
  if (hint) draft.hint = hint.value;
  const paste = document.getElementById('pasteText');
  if (paste) draft.rawText = paste.value;
  const picked = new Set([...document.querySelectorAll('.pick:checked')].map((el) => Number(el.dataset.i)));
  draft.checked = picked;
}

function setBusy(v) { draft.busy = v; refresh(); }

export function mount() {
  const view = document.getElementById('view');

  view.addEventListener('change', (e) => {
    if (e.target.classList.contains('pick')) {
      const picked = new Set([...document.querySelectorAll('.pick:checked')].map((el) => Number(el.dataset.i)));
      draft.checked = picked;
    }
  });

  view.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'camera' || action === 'album') {
      collectInputs();
      const file = await pickFile('image/*', action === 'camera');
      if (!file) return;
      const url = await readAsDataURL(file);
      toast('图片已选择，正在压缩…', 'info');
      draft.dataUrl = await compressImage(url);
      draft.fileName = file.name;
      refresh();
      return;
    }

    if (action === 'clearImage') { collectInputs(); draft.dataUrl = null; refresh(); return; }

    if (action === 'runOcr' || action === 'runText') {
      collectInputs();
      setBusy(true);
      try {
        const items = action === 'runOcr'
          ? await ocrImage(draft.dataUrl, draft.hint)
          : await ocrText(draft.rawText);
        if (!items.length) throw new Error('没有识别到词条，请换一张更清晰的照片');
        draft.items = items.map((it) => ({
          term: String(it.term || '').trim(),
          phonetic: String(it.phonetic || '').trim(),
          pos: String(it.pos || '').trim(),
          meaning: String(it.meaning || '').trim(),
          example: String(it.example || '').trim(),
          exampleTranslation: String(it.exampleTranslation || '').trim()
        }));
        draft.checked = null;
        toast(`识别完成，共 ${items.length} 条，请确认`, 'success');
      } catch (err) {
        toast(`识别失败：${err.message}`, 'error', 5000);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (action === 'toggleAll') {
      collectInputs();
      const all = draft.checked?.size === draft.items.length;
      draft.checked = all ? new Set() : null;
      refresh();
      return;
    }

    if (action === 'saveItems') {
      collectInputs();
      const selected = draft.items.filter((_, i) => isChecked(i)).filter((x) => x.term.trim());
      if (!selected.length) { toast('请至少选择一条', 'error'); return; }
      const result = addWords(selected.map((x) => ({ ...x, source: { type: 'photo', fileName: draft.fileName, at: new Date().toISOString() } })));
      logActivity(dateKey(), { wordsAdded: result.added });
      toast(`入库成功：新增 ${result.added} 条，更新 ${result.updated} 条`, 'success');
      draft.items = []; draft.dataUrl = null; draft.rawText = ''; draft.checked = null;
      refresh();
      return;
    }

    if (action === 'goWords') go('words');
  });
}
