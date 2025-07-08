@echo off
echo Starting Walkie-Talkie Server (HTTP + HTTPS)...
echo.
echo This will start both HTTP and HTTPS servers.
echo - HTTP: http://[YOUR_IP]:3000 (basic connection)
echo - HTTPS: https://[YOUR_IP]:3443 (microphone support)
echo.
pause
set HTTP_PORT=3000
set HTTPS_PORT=3443
node server.js
pause 