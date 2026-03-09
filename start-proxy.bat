@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 Starting ContentHub Kimi AI Proxy
echo ========================================
cd /d "%~dp0proxy-server"
npm start
pause
