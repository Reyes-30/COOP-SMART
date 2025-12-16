@echo off
cd /d "%~dp0backend"
echo.
echo ============================================
echo   Iniciando COOP-SMART Server
echo ============================================
echo.
node src/app.js
pause
