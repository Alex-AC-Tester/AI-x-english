@echo off
chcp 936 >nul
setlocal EnableDelayedExpansion
title WordWise AI 一键启动
cd /d "%~dp0"

echo.
echo  ==================================================
echo   WordWise AI  -  一键启动
echo  ==================================================
echo.
rem 本脚本只启动服务，不会修改、清空或删除 data 目录下的任何学习数据。

where node >nul 2>nul
if errorlevel 1 (
  echo  [错误] 未找到 Node.js，请先安装 18 或更高版本。
  echo  下载地址: https://nodejs.org/
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set "NODE_VER=%%v"
echo  [环境] Node.js !NODE_VER!

set "PORT=8787"
for /f "tokens=*" %%p in ('node -e "try{var p=require('./config.json').port;process.stdout.write(p?String(p):'8787')}catch(e){process.stdout.write('8787')}"') do set "PORT=%%p"
echo  [环境] 服务端口 !PORT!

rem 可选参数 --restart：安全结束占用端口的旧 node 进程
if /i "%~1"=="--restart" (
  echo  [信息] 正在重启...
  for /f "tokens=5" %%p in ('netstat -ano -p tcp ^| findstr ":!PORT! " ^| findstr LISTENING') do (
    tasklist /FI "PID eq %%p" /NH 2>nul | findstr /i "node.exe" >nul && taskkill /PID %%p /T /F >nul 2>nul
  )
  ping -n 3 127.0.0.1 >nul
)

where curl >nul 2>nul
if not errorlevel 1 (
  rem -f：只有 HTTP 2xx 才算存活，避免把端口上返回错误的其他服务误判为本应用
  curl -sf -m 2 "http://127.0.0.1:!PORT!/api/health" >nul 2>nul
  if not errorlevel 1 (
    echo  [提示] 服务已经在运行，直接为你打开浏览器。
    if not "%NO_BROWSER%"=="1" start "" "http://localhost:!PORT!/#/home"
    echo.
    call :urls
    echo.
    echo  重启服务: start.bat --restart
    echo.
    pause
    exit /b 0
  )
)

netstat -ano -p tcp 2>nul | findstr ":!PORT! " | findstr LISTENING >nul
if not errorlevel 1 (
  echo  [错误] 端口 !PORT! 已被其它程序占用。
  echo  请关闭该程序，或把 config.json 里的 port 改成其它端口。
  echo.
  pause
  exit /b 1
)

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

if not "%NO_BROWSER%"=="1" start "" /min cmd /c "tools\open-browser.bat http://localhost:!PORT!/#/home !PORT!"

echo.
echo  正在启动，浏览器即将自动打开...
call :urls
echo.
echo  手机/平板访问需与电脑连同一个 Wi-Fi；打不开先双击 lan-firewall.bat 放行端口。
echo  停止服务: 在本窗口按 Ctrl+C，或直接关闭本窗口
echo  ==================================================
echo.
chcp 65001 >nul
node server.js
chcp 936 >nul

echo.
echo  服务已停止。
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
