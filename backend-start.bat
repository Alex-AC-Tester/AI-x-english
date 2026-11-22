@echo off
chcp 936 >nul
setlocal EnableDelayedExpansion
title WordWise AI - 后端服务
cd /d "%~dp0"

echo.
echo  ==================================================
echo   WordWise AI  -  后端服务
echo  ==================================================
echo.
rem 本脚本只启动后端进程，不会修改、清空或删除 data 目录下的任何学习数据。
rem 默认后台运行（最小化窗口）并写日志；加 --fg 前台运行，加 --restart 先重启。

set "FG="
set "RESTART="
:parse
if "%~1"=="" goto parsed
if /i "%~1"=="--fg" set "FG=1"
if /i "%~1"=="-f" set "FG=1"
if /i "%~1"=="--restart" set "RESTART=1"
shift
goto parse
:parsed

where node >nul 2>nul
if errorlevel 1 (
  echo  [错误] 未找到 Node.js，请先安装 18 或更高版本：https://nodejs.org/
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set "NODE_VER=%%v"

set "PORT=8787"
for /f "tokens=*" %%p in ('node -e "try{var p=require('./config.json').port;process.stdout.write(p?String(p):'8787')}catch(e){process.stdout.write('8787')}"') do set "PORT=%%p"
echo  [环境] Node.js !NODE_VER! · 端口 !PORT!

if not exist "logs" mkdir "logs" >nul 2>nul

rem ---------- 是否已在运行 ----------
set "ALIVE="
rem -f：只有 HTTP 2xx 才算存活，端口上跑着别的返回错误的服务时不会被误判
curl -sf -m 2 "http://127.0.0.1:!PORT!/api/health" >nul 2>nul
if not errorlevel 1 set "ALIVE=1"
if not defined ALIVE (
  netstat -ano -p tcp 2>nul | findstr ":!PORT! " | findstr LISTENING >nul
  if not errorlevel 1 set "ALIVE=1"
)

if defined ALIVE (
  if not defined RESTART (
    echo  [提示] 后端已经在运行。
    call :urls
    echo.
    echo  重启：backend-start.bat --restart
    echo  停止：backend-stop.bat
    echo.
    exit /b 0
  )
  echo  [信息] 正在重启后端...
  call :killport
)

netstat -ano -p tcp 2>nul | findstr ":!PORT! " | findstr LISTENING >nul
if not errorlevel 1 (
  echo  [错误] 端口 !PORT! 被其它程序占用，请关闭它或修改 config.json 的 port。
  echo.
  pause
  exit /b 1
)

rem ---------- 本地 spaCy（可选） ----------
set "PY_BIN="
rem ---------- 项目本地 .venv（推荐） ----------
if not exist "%~dp0.venv\Scripts\python.exe" goto :novenv
"%~dp0.venv\Scripts\python.exe" -c "import importlib.util,sys;sys.exit(0 if importlib.util.find_spec('spacy') else 1)" >nul 2>nul
if errorlevel 1 goto :novenv
set "PY_BIN=%~dp0.venv\Scripts\python.exe"
:novenv
where python >nul 2>nul
if not errorlevel 1 (
  python -c "import importlib.util,sys;sys.exit(0 if importlib.util.find_spec('spacy') else 1)" >nul 2>nul
  if not errorlevel 1 set "PY_BIN=python"
)
rem 注意：不探测任何机器专属 Python 路径；spaCy 仅支持 3.10-3.12，请用 nlp\setup-venv.bat 建项目 .venv
if defined PY_BIN (
  set "PYTHON_BIN=!PY_BIN!"
  echo  [环境] 已启用本地 spaCy 句法分析
) else (
  echo  [提示] 未找到可用的 spaCy，句法分析会自动降级（不影响使用）
)

rem ---------- 前台模式 ----------
if defined FG (
  echo.
  echo  前台模式：日志打印在本窗口，按 Ctrl+C 停止。
  call :urls
  echo.
  chcp 65001 >nul
  node server.js
  chcp 936 >nul
  echo.
  echo  服务已停止。
  pause
  exit /b 0
)

rem ---------- 后台模式（最小化窗口，日志写入 logs） ----------
echo.
echo  正在后台启动，窗口会自动最小化...
start "WordWise 后端" /min cmd /c "node server.js > logs\server.out.log 2>&1"

set "READY="
for /l %%i in (1,1,25) do (
  if not defined READY (
    curl -sf -m 1 "http://127.0.0.1:!PORT!/api/health" >nul 2>nul
    if not errorlevel 1 (
      set "READY=1"
    ) else (
      ping -n 2 127.0.0.1 >nul
    )
  )
)

rem 记录 PID，供 backend-stop.bat 精确停止
rem 注意：PID 全数字紧贴 ">" 会被 cmd 当成句柄重定向，必须把重定向写在 echo 前面
if defined READY (
  for /f "tokens=5" %%p in ('netstat -ano -p tcp ^| findstr ":!PORT! " ^| findstr LISTENING') do (
    >"logs\server.pid" echo %%p
  )
)

echo.
if defined READY (
  echo  [完成] 后端已在后台运行。
  call :urls
  echo.
  echo  日志：logs\server.out.log（含错误输出）
  echo  停止：backend-stop.bat          前台运行：backend-start.bat --fg
) else (
  echo  [警告] 端口迟迟没有响应，请查看 logs\server.out.log
  echo  也可以改用前台模式看具体报错：backend-start.bat --fg
)
echo.
pause
exit /b 0

rem ================= 子过程 =================
:urls
echo  本机访问: http://localhost:!PORT!/
set "LANFOUND="
for /f "delims=" %%u in ('node tools\lan-url.js !PORT!') do (
  echo  局域网访问: %%u
  set "LANFOUND=1"
)
if not defined LANFOUND echo  局域网访问: 未检测到内网地址（请检查 Wi-Fi 或网线）
goto :eof

:killport
for /f "tokens=5" %%p in ('netstat -ano -p tcp ^| findstr ":!PORT! " ^| findstr LISTENING') do (
  tasklist /FI "PID eq %%p" /NH 2>nul | findstr /i "node.exe" >nul && taskkill /PID %%p /T /F >nul 2>nul
)
ping -n 3 127.0.0.1 >nul
goto :eof
