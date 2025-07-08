@echo off
echo Starting Walkie-Talkie HTTPS Server...
echo.
echo This will start the HTTPS server for microphone access.
echo Mobile devices should use: https://[YOUR_IP]:3443
echo.
pause
set HTTP_PORT=0
set HTTPS_PORT=3443
node server.js
pause 