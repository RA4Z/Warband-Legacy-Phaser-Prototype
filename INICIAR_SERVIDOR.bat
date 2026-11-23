@echo off
cd /d "%~dp0"
where node >nul 2>&1 || (echo Instale Node.js 18 ou superior para usar o servidor. & pause & exit /b 1)
start "" "http://localhost:5173"
node tools/server.mjs
pause
