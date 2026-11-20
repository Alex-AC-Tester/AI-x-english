// 生成测试用的 DOCX 与 PDF，并验证解析结果
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const OUT = path.join(__dirname, 'testfiles');
fs.mkdirSync(OUT, { recursive: true });

/* ---------- 1. 造一个最小 DOCX ---------- */
async function makeDocx() {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  const paras = [
    'The Power of Habit',
    'Habits emerge because the brain is constantly looking for ways to save effort.',
    'The process within our brains is a three-step loop. First, there is a cue, a trigger that tells your brain to go into automatic mode.',
    'Then there is the routine, which can be physical or mental or emotional.',
    'Finally, there is a reward that helps your brain figure out if this particular loop is worth remembering.'
  ];
  const body = paras.map((p) => `<w:p><w:r><w:t xml:space="preserve">${p}</w:t></w:r></w:p>`).join('');
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`);
  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(OUT, 'sample.docx'), buf);
  return paras;
}

/* ---------- 2. 造一个多页 PDF（手写 PDF 语法） ---------- */
function makePdf() {
  const pages = [
    [
      'CHAPTER ONE',
      'The Power of Habit',
      'Habits emerge because the brain is constantly looking for ways to save',
      'effort. The process within our brains is a three-step loop. First, there',
      'is a cue, a trigger that tells your brain to go into automatic mode.'
    ],
    [
      'Then there is the routine, which can be physical or mental or emotional.',
      'Finally, there is a reward that helps your brain figure out if this',
      'particular loop is worth remembering for the future. Over time this',
      'loop becomes more and more automatic. The cue and reward become',
      'intertwined until a powerful sense of anticipation emerges.'
    ]
  ];

  const objs = [];
  const push = (s) => { objs.push(s); return objs.length; };

  const fontId = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds = [];
  const contentIds = [];

  for (const lines of pages) {
    const stream = ['BT', '/F1 12 Tf', '14 TL', '56 760 Td'];
    lines.forEach((l, i) => {
      const esc = l.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      if (i > 0) stream.push('T*');
      stream.push(`(${esc}) Tj`);
    });
    stream.push('ET');
    const body = stream.join('\n');
    contentIds.push(push(`<< /Length ${Buffer.byteLength(body)} >>\nstream\n${body}\nendstream`));
  }

  const pagesId = objs.length + pages.length + 1;
  pages.forEach((_, i) => {
    pageIds.push(push(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`));
  });

  const kids = pageIds.map((id) => `${id} 0 R`).join(' ');
  push(`<< /Type /Pages /Count ${pageIds.length} /Kids [${kids}] >>`);
  const catalogId = push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefPos = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => { pdf += `${String(o).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  fs.writeFileSync(path.join(OUT, 'sample.pdf'), Buffer.from(pdf, 'latin1'));
  return pages;
}

/* ---------- 3. 造一个 EPUB ---------- */
async function makeEpub() {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip');
  zip.file('META-INF/container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`);
  zip.file('OEBPS/content.opf', `<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Sample Book</dc:title></metadata>
<manifest>
<item id="c1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
<item id="c2" href="ch2.xhtml" media-type="application/xhtml+xml"/>
</manifest>
<spine><itemref idref="c1"/><itemref idref="c2"/></spine>
</package>`);
  zip.file('OEBPS/ch1.xhtml', `<html><body><h1>Chapter One</h1><p>Habits emerge because the brain is constantly looking for ways to save effort.</p></body></html>`);
  zip.file('OEBPS/ch2.xhtml', `<html><body><h1>Chapter Two</h1><p>Then there is the routine, which can be physical or mental or emotional.</p></body></html>`);
  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(OUT, 'sample.epub'), buf);
}

(async () => {
  const docxParas = await makeDocx();
  const pdfPages = makePdf();
  await makeEpub();

  console.log('=== 生成完成 ===');
  for (const f of fs.readdirSync(OUT)) {
    console.log(` ${f}  ${fs.statSync(path.join(OUT, f)).size} bytes`);
  }

  /* ---------- 验证 DOCX ---------- */
  const mammoth = require('mammoth');
  const docxBuf = fs.readFileSync(path.join(OUT, 'sample.docx'));
  const docxResult = await mammoth.extractRawText({ buffer: docxBuf });
  console.log('\n=== DOCX 解析 ===');
  const docxText = docxResult.value.trim();
  console.log(JSON.stringify(docxText.slice(0, 200)));
  let docxOk = true;
  for (const p of docxParas) {
    if (!docxText.includes(p)) { console.log(`  ✗ 缺失: ${p.slice(0, 40)}`); docxOk = false; }
  }
  console.log(docxOk ? '  ✓ 全部段落命中' : '  ✗ 有段落丢失');

  /* ---------- 验证 PDF ---------- */
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfData = new Uint8Array(fs.readFileSync(path.join(OUT, 'sample.pdf')));
  const doc = await pdfjs.getDocument({ data: pdfData, useSystemFonts: true }).promise;
  console.log(`\n=== PDF 解析（${doc.numPages} 页）===`);
  const allRows = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const rows = content.items.filter((it) => typeof it.str === 'string' && it.str.trim())
      .map((it) => ({ y: it.transform[5], h: Math.abs(it.transform[3]) || 10, text: it.str.trim() }));
    allRows.push(rows);
    console.log(`  第${i}页 ${rows.length} 行`);
  }
  const flat = allRows.flat().map((r) => r.text).join(' ');
  let pdfOk = true;
  for (const lines of pdfPages) {
    for (const l of lines) {
      if (!flat.includes(l.trim())) { console.log(`  ✗ 缺失: ${l.slice(0, 40)}`); pdfOk = false; }
    }
  }
  console.log(pdfOk ? '  ✓ 全部文本行命中' : '  ✗ 有文本丢失');

  /* ---------- 验证 EPUB ---------- */
  const zip = await JSZip.loadAsync(fs.readFileSync(path.join(OUT, 'sample.epub')));
  const opf = await zip.file('OEBPS/content.opf').async('string');
  const title = /<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i.exec(opf)?.[1];
  const ch1 = await zip.file('OEBPS/ch1.xhtml').async('string');
  console.log('\n=== EPUB 解析 ===');
  console.log(`  标题: ${title}`);
  console.log(`  章节1 含正文: ${/Habits emerge/.test(ch1)}`);
  console.log(title === 'Sample Book' && /Habits emerge/.test(ch1) ? '  ✓ EPUB 结构正确' : '  ✗ EPUB 解析异常');
})();
