@echo off
chcp 936 >nul
setlocal EnableDelayedExpansion
title WordWise AI - 局域网放行
cd /d "%~dp0"

rem ==========================================================
rem  为 WordWise 服务端口添加 Windows 防火墙入站规则
rem  用法：双击运行（会自动请求管理员权限）
rem        lan-firewall.bat --all   连同公用网络一起放行
rem  撤销：netsh advfirewall firewall delete rule name="WordWise AI (端口)"
rem ==========================================================

net session >nul 2>nul
if errorlevel 1 goto elevate

set "PORT=8787"
for /f "tokens=*" %%p in ('node -e "try{var p=require('./config.json').port;process.stdout.write(p?String(p):'8787')}catch(e){process.stdout.write('8787')}"') do set "PORT=%%p"

set "PROFILE=private,domain"
set "LABEL=专用网络 + 域网络"
if /i "%~1"=="--all" (
  set "PROFILE=any"
  set "LABEL=所有网络（含公用网络，风险更高）"
)

echo.
echo  ==================================================
echo   WordWise AI  -  局域网放行
echo  ==================================================
echo.
echo  端口：TCP !PORT!    范围：!LABEL!
echo.

netsh advfirewall firewall delete rule name="WordWise AI (!PORT!)" >nul 2>nul
netsh advfirewall firewall add rule name="WordWise AI (!PORT!)" dir=in action=allow protocol=TCP localport=!PORT! profile=!PROFILE! enable=yes >nul
if errorlevel 1 (
  echo  [失败] 规则写入失败，请确认本窗口是以管理员身份运行。
  echo.
  pause
  exit /b 1
)
echo  [完成] 防火墙已放行 TCP !PORT!。
echo.
echo  局域网访问地址（手机、平板连同一个 Wi-Fi 后输入）：
node tools\lan-url.js !PORT!
echo.
echo  还打不开就检查这两点：
echo    1) 电脑当前网络是否被 Windows 识别为“公用网络” -^> 改成“专用网络”，或改用 lan-firewall.bat --all
echo    2) 手机与电脑是否在同一网段（同一路由器 / 同一 Wi-Fi）
echo  要从外网访问：在路由器管理页把 !PORT! 端口映射到本机 IP（见上）。
echo.
pause
exit /b 0

:elevate
echo.
echo  需要管理员权限，正在请求提权（请在弹出的 UAC 窗口点“是”）。
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
if errorlevel 1 (
  echo  [提示] 提权失败：请右键本文件，选择“以管理员身份运行”。
  echo.
  pause
)
exit /b 0
