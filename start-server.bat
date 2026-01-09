@echo off
echo Starting StoneBeam-NH Real-Time Server...
echo.
echo Server will keep running even if you close this chat.
echo.
echo To stop server manually, press Ctrl+C in this window.
echo.
echo Opening browser...
timeout /t 3 >nul
start http://localhost:3001
node working-server.js
pause
