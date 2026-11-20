#!/usr/bin/env python3
"""把 ECDICT CSV 转成按首字母分片的紧凑 JSON，供服务端按需加载查询。
用法: python tools/build_dict.py [源CSV路径]
"""
import csv
import json
import os
import sys
import time

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, 'data', 'dict', 'ecdict.csv')
OUT = os.path.join(BASE, 'data', 'dict', 'parts')

if not os.path.isfile(SRC):
    print('找不到词典源文件:', SRC)
    sys.exit(1)

os.makedirs(OUT, exist_ok=True)
parts = {}
total = 0
t0 = time.time()

with open(SRC, encoding='utf-8', newline='') as f:
    reader = csv.DictReader(f)
    for row in reader:
        w = (row.get('word') or '').strip()
        if not w:
            continue
        item = {
            'w': w,
            'p': (row.get('phonetic') or '').strip(),
            'd': (row.get('definition') or '').strip(),
            't': (row.get('translation') or '').strip(),
            'x': (row.get('exchange') or '').strip(),
            'g': (row.get('tag') or '').strip(),
            'f': int(row.get('frq') or 0) if str(row.get('frq') or '').isdigit() else 999999,
        }
        k = w[0].lower()
        if not k.isalpha():
            k = '_'
        parts.setdefault(k, []).append(item)
        total += 1

for k, items in parts.items():
    path = os.path.join(OUT, k + '.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, separators=(',', ':'))

meta = {
    'source': 'ECDICT (skywind3000/ECDICT, MIT)',
    'total': total,
    'shards': {k: len(v) for k, v in parts.items()},
    'builtAt': time.strftime('%Y-%m-%d %H:%M:%S'),
}
with open(os.path.join(BASE, 'data', 'dict', 'meta.json'), 'w', encoding='utf-8') as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)

print('词条总数:', total)
print('分片数:', len(parts))
print('耗时: %.1fs' % (time.time() - t0))
print('输出目录:', OUT)
