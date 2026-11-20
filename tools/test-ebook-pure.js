// 直接测试 ebook.js 里的纯函数：行重建、段落切分、页眉页脚剔除
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'ebook.js'), 'utf8');

// 抽出纯函数段，去掉 import/export 与浏览器依赖
const start = src.indexOf('const CJK =');
const end = src.indexOf('async function parsePdf');
const pure = src.slice(start, end);
const fnSrc = pure
  .replace(/^export\s+/gm, '')
  .replace(/async function parsePdf[\s\S]*$/, '');

const mod = { exports: {} };
new Function('module', 'exports', `${fnSrc}\nmodule.exports = { itemsToRows, dropFurniture, rowsToParagraphs, normalizeText, joinLine, stripTags };`)(mod, mod.exports);
const { itemsToRows, dropFurniture, rowsToParagraphs, normalizeText, joinLine, stripTags } = mod.exports;

let pass = 0, fail = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}\n      期望: ${JSON.stringify(expected)}\n      实际: ${JSON.stringify(actual)}`); }
}

console.log('=== 1. 行重建：同一 y 的碎片合并 ===');
{
  const items = [
    { str: 'Habits ', transform: [1, 0, 0, 12, 56, 760], width: 40 },
    { str: 'emerge ', transform: [1, 0, 0, 12, 100, 760], width: 42 },
    { str: 'because', transform: [1, 0, 0, 12, 146, 760], width: 44 }
  ];
  const rows = itemsToRows(items);
  check('三碎片合成一行', rows.length, 1);
  check('文本正确', rows[0].text, 'Habits emerge because');
}

console.log('\n=== 2. 行重建：不同 y 分成不同行 ===');
{
  const items = [
    { str: 'Line one', transform: [1, 0, 0, 12, 56, 760], width: 50 },
    { str: 'Line two', transform: [1, 0, 0, 12, 56, 740], width: 50 }
  ];
  const rows = itemsToRows(items);
  check('两行', rows.length, 2);
  check('第一行', rows[0].text, 'Line one');
  check('第二行', rows[1].text, 'Line two');
}

console.log('\n=== 3. 行重建：x 间隙补空格 ===');
{
  const items = [
    { str: 'word', transform: [1, 0, 0, 12, 56, 760], width: 30 },
    { str: 'next', transform: [1, 0, 0, 12, 100, 760], width: 30 }
  ];
  const rows = itemsToRows(items);
  check('间隙补空格', rows[0].text, 'word next');
}

console.log('\n=== 4. 连字符断词 ===');
check('exam- + ple', joinLine('exam-', 'ple'), 'example');
check('中文不加空格', joinLine('这是', '中文'), '这是中文');
check('英文加空格', joinLine('hello', 'world'), 'hello world');
check('行尾已有空格', joinLine('hello ', 'world'), 'hello world');

console.log('\n=== 5. 段落切分：行距大则分段 ===');
{
  const rows = [
    { y: 760, h: 12, text: 'First paragraph line one' },
    { y: 748, h: 12, text: 'first paragraph line two' },
    { y: 700, h: 12, text: 'Second paragraph starts here' },
    { y: 688, h: 12, text: 'second paragraph continues' }
  ];
  const paras = rowsToParagraphs(rows);
  check('切成两段', paras.length, 2);
  check('第一段', paras[0], 'First paragraph line one first paragraph line two');
  check('第二段', paras[1], 'Second paragraph starts here second paragraph continues');
}

console.log('\n=== 6. 段落切分：紧凑行距不分段 ===');
{
  const rows = [
    { y: 760, h: 12, text: 'line one' },
    { y: 748, h: 12, text: 'line two' },
    { y: 736, h: 12, text: 'line three' }
  ];
  const paras = rowsToParagraphs(rows);
  check('合成一段', paras.length, 1);
  check('内容', paras[0], 'line one line two line three');
}

console.log('\n=== 6b. 段落切分：字号变化切段（标题 → 正文）===');
{
  const rows = [
    { y: 760, h: 22, text: 'CHAPTER ONE' },
    { y: 730, h: 22, text: 'The Power of Habit' },
    { y: 700, h: 12, text: 'Habits emerge because the brain is' },
    { y: 688, h: 12, text: 'constantly looking for ways to save effort.' }
  ];
  const paras = rowsToParagraphs(rows);
  check('标题与正文分开', paras.length, 3);
  check('标题行独立', paras[0], 'CHAPTER ONE');
  check('正文合并', paras[2], 'Habits emerge because the brain is constantly looking for ways to save effort.');
}

console.log('\n=== 7. 页眉页脚剔除：重复行 ===');
{
  const pages = [
    [{ y: 780, h: 10, text: 'THE POWER OF HABIT' }, { y: 700, h: 12, text: 'body page one' }, { y: 40, h: 10, text: '12' }],
    [{ y: 780, h: 10, text: 'THE POWER OF HABIT' }, { y: 700, h: 12, text: 'body page two' }, { y: 40, h: 10, text: '13' }],
    [{ y: 780, h: 10, text: 'THE POWER OF HABIT' }, { y: 700, h: 12, text: 'body page three' }, { y: 40, h: 10, text: '14' }]
  ];
  const cleaned = dropFurniture(pages);
  check('页眉被移除', cleaned[0].map((r) => r.text), ['body page one']);
  check('三页都清理', cleaned.every((p) => p.length === 1), true);
}

console.log('\n=== 8. 页眉剔除：正文行不被误删 ===');
{
  const pages = [
    [{ y: 780, h: 10, text: 'Chapter One' }, { y: 700, h: 12, text: 'unique A' }],
    [{ y: 780, h: 10, text: 'Chapter Two' }, { y: 700, h: 12, text: 'unique B' }],
    [{ y: 780, h: 10, text: 'Chapter Three' }, { y: 700, h: 12, text: 'unique C' }]
  ];
  const cleaned = dropFurniture(pages);
  check('不重复的标题保留', cleaned[0].length, 2);
}

console.log('\n=== 9. 文本规范化 ===');
check('折叠多余空行', normalizeText('a\n\n\n\nb'), 'a\n\nb');
check('去软连字符', normalizeText('exa\u00admple'), 'example');
check('去零宽字符', normalizeText('a\u200bb'), 'ab');
check('NBSP 转空格', normalizeText('a\u00a0b'), 'a b');
check('去行尾空白', normalizeText('a   \nb'), 'a\nb');

console.log('\n=== 10. HTML 转文本 ===');
check('段落换行', stripTags('<p>one</p><p>two</p>').trim().replace(/\n+/g, '|'), 'one|two');
check('去 script', stripTags('<script>bad()</script>good').trim(), 'good');
check('实体解码', stripTags('a &amp; b').trim(), 'a & b');
check('br 换行', stripTags('a<br>b').replace(/\n/g, '|').trim(), 'a|b');

console.log(`\n=== 结果：${pass} 通过 / ${fail} 失败 ===`);
process.exit(fail ? 1 : 0);
