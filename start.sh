#!/usr/bin/env bash
# WordWise AI 一键启动（Git Bash / macOS / Linux）
# 本脚本只启动服务，不会修改、清空或删除 data 目录下的任何学习数据。
set -u
cd "$(dirname "$0")"

open_url() {
  local url="$1"
  if command -v cmd.exe >/dev/null 2>&1; then
    cmd.exe /c start "" "$url" >/dev/null 2>&1
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1
  fi
}

if ! command -v node >/dev/null 2>&1; then
  echo "[错误] 未找到 Node.js，请先安装 18 或更高版本：https://nodejs.org/"
  exit 1
fi

PORT=$(node -e "try{process.stdout.write(String(require('./config.json').port||8787))}catch(e){process.stdout.write('8787')}")
echo "[环境] Node.js $(node -v) · 端口 $PORT"

print_urls() {
  echo "  本机访问: http://localhost:$PORT/"
  local lan=""
  if [ -f tools/lan-url.js ]; then
    lan=$(node tools/lan-url.js "$PORT" 2>/dev/null || true)
  fi
  if [ -n "$lan" ]; then
    printf '%s\n' "$lan" | while IFS= read -r line; do
      [ -n "$line" ] && echo "  局域网访问: $line"
    done
  else
    echo "  局域网访问: 未检测到内网地址（请检查 Wi-Fi 或网线）"
  fi
}

if command -v curl >/dev/null 2>&1 && curl -sf -m 2 "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
  echo "[提示] 服务已在运行，直接为你打开浏览器。"
  [ "${NO_BROWSER:-0}" = "1" ] || open_url "http://localhost:$PORT/#/home"
  print_urls
  exit 0
fi

if ! node -e "
const net=require('net');const s=net.createServer();
s.once('error',()=>process.exit(1));
s.once('listening',()=>{s.close();process.exit(0)});
s.listen($PORT,'127.0.0.1');" 2>/dev/null; then
  echo "[错误] 端口 $PORT 被占用，请关闭该程序或修改 config.json 的 port。"
  exit 1
fi

if command -v python >/dev/null 2>&1; then
  if python -c "import importlib.util,sys;sys.exit(0 if importlib.util.find_spec('spacy') else 1)" >/dev/null 2>&1; then
    echo "[环境] 检测到 spaCy，句法分析将在首次使用时自动加载"
  else
    echo "[提示] 未安装 spaCy，句法分析会自动降级（不影响使用）。"
    echo "        如需启用: python -m pip install spacy"
    echo "                  python -m spacy download en_core_web_sm"
  fi
else
  echo "[提示] 未检测到 Python，句法分析会自动降级（不影响使用）。"
fi

# 轮询 /api/health 就绪后再开浏览器（消除固定 3 秒延时的竞态）；最多等约 30 秒
[ "${NO_BROWSER:-0}" = "1" ] || (
  for i in $(seq 1 30); do
    if command -v curl >/dev/null 2>&1; then
      curl -sf -m 2 "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1 && { open_url "http://localhost:$PORT/#/home"; exit 0; }
    fi
    sleep 1
  done
  open_url "http://localhost:$PORT/#/home"
) >/dev/null 2>&1 &

echo "正在启动，浏览器即将自动打开..."
print_urls
echo "手机/平板访问需与电脑连同一个 Wi-Fi；打不开请在 Windows 下双击 lan-firewall.bat 放行端口"
echo "按 Ctrl+C 停止服务"
exec node server.js
