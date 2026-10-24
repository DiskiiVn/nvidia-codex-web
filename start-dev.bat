@echo off
title NVIDIA Codex Studio - Local Development
chcp 65001 > nul
echo ========================================================
echo   🚀 Dang khoi dong NVIDIA Codex Studio Dev Server...
echo ========================================================
echo.
cd /d "%~dp0"
call npm.cmd run dev
pause
