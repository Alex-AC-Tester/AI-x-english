@echo off
chcp 936 >nul
setlocal
title WordWise - 安装本地 NLP 环境
cd /d "%~dp0.."

echo.
echo  ==================================================
echo   WordWise 本地 NLP 环境安装（spaCy + en_core_web_sm）
echo  ==================================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo  [错误] 未找到 python，请先安装 Python 3.10-3.12 并加入 PATH。
  echo.
  pause
  exit /b 1
)

if exist ".venv\Scripts\python.exe" (
  echo  [信息] .venv 已存在，直接检查依赖...
) else (
  echo  [1/3] 创建虚拟环境 .venv ...
  python -m venv .venv
  if errorlevel 1 goto :fail
)

echo  [2/3] 安装 spaCy ...
".venv\Scripts\python.exe" -m pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple
".venv\Scripts\python.exe" -m pip install -r nlp\requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
if errorlevel 1 goto :fail

echo  [3/3] 安装英语模型 en_core_web_sm ...
".venv\Scripts\python.exe" -c "import spacy,importlib.util,sys;sys.exit(0 if importlib.util.find_spec('en_core_web_sm') else 1)" >nul 2>nul
if errorlevel 1 (
  ".venv\Scripts\python.exe" -m pip install "https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl"
  if errorlevel 1 goto :fail
)

echo.
echo  自检中...
".venv\Scripts\python.exe" -c "import spacy; nlp=spacy.load('en_core_web_sm'); d=nlp('The book that he gave me was interesting.'); print('  spaCy', spacy.__version__, '| tokens', len(d))"
if errorlevel 1 goto :fail

echo.
echo  [完成] 本地 NLP 环境就绪。之后直接双击 start.bat 或 backend-start.bat 即可。
echo.
pause
exit /b 0

:fail
echo.
echo  [失败] 安装过程出错，请检查网络或 Python 版本后重试。
echo.
pause
exit /b 1
