@echo off
chcp 936 >nul
setlocal EnableDelayedExpansion
title WordWise AI - 停止后端
cd /d "%~dp0"

echo.
echo  ==================================================
echo   WordWise AI  -  停止后端
echo  ==================================================
echo.

set "PORT=8787"
for /f "tokens=*" %%p in ('node -e "try{var p=require('./config.json').port;process.stdout.write(p?String(p):'8787')}catch(e){process.stdout.write('8787')}"') do set "PORT=%%p"

set "STOPPED="

rem ---------- 先按 PID 文件停 ----------
if exist "logs\server.pid" (
  set "PID="
  set /p PID=<logs\server.pid
  if defined PID (
    echo !PID!|findstr /r "^[0-9][0-9]*$" >nul
    if not errorlevel 1 (
      tasklist /FI "PID eq !PID!" /NH 2>nul | findstr /i "node.exe" >nul
      if not errorlevel 1 (
        taskkill /PID !PID! /T /F >nul 2>nul
        echo  [完成] 已停止后台服务（PID !PID!）
        set "STOPPED=1"
      )
    )
  )
  del "logs\server.pid" >nul 2>nul
)

rem ---------- 兜底：按端口再查一次 ----------
for /f "tokens=5" %%p in ('netstat -ano -p tcp ^| findstr ":!PORT! " ^| findstr LISTENING') do (
  tasklist /FI "PID eq %%p" /NH 2>nul | findstr /i "node.exe" >nul && (
    taskkill /PID %%p /T /F >nul 2>nul
    echo  [完成] 已结束占用端口 !PORT! 的 node 进程（PID %%p）
    set "STOPPED=1"
  )
)

if not defined STOPPED echo  [提示] 没有发现正在运行的 WordWise 后端。
echo.
pause
exit /b 0
