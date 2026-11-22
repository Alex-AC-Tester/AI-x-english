@echo off
rem 由 start.bat 调用：轮询 /api/health，服务就绪后再打开浏览器（消除固定延时的竞态）
rem 用法: tools\open-browser.bat <打开的URL> <端口>
set "URL=%~1"
set "PORT=%~2"
if "%URL%"=="" exit /b 0
if "%PORT%"=="" set "PORT=8787"

where curl >nul 2>nul
if errorlevel 1 (
  rem 无 curl 时退化为固定延时
  ping -n 4 127.0.0.1 >nul
  start "" "%URL%"
  exit /b 0
)

rem 最多等约 30 秒；就绪即开，超时也开（让用户直接看到报错界面）
for /l %%i in (1,1,30) do (
  curl -sf -m 2 "http://127.0.0.1:%PORT%/api/health" >nul 2>nul
  if not errorlevel 1 (
    start "" "%URL%"
    exit /b 0
  )
  ping -n 2 127.0.0.1 >nul
)
start "" "%URL%"
exit /b 0
