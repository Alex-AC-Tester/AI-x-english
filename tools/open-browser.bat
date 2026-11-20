@echo off
rem 延时打开浏览器（等 node 起来），由 start.bat 调用
ping -n 4 127.0.0.1 >nul
if not "%~1"=="" start "" "%~1"
exit /b 0
