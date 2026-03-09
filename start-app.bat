@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 Starting ContentHub App
echo ========================================
cd /d "%~dp0app"
npm run dev
pause
