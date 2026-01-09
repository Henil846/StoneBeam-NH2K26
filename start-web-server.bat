@echo off
echo ========================================
echo    StoneBeam-NH Web Application
echo ========================================
echo.
echo Starting the web server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Start the server
echo Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
node server.js

pause