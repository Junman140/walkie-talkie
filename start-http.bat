@echo off
echo Starting Walkie-Talkie HTTP Server...
echo.
echo This will start the HTTP server (basic connection).
echo Mobile devices should use: http://[YOUR_IP]:3000
echo Note: Microphone may not work on mobile devices with HTTP.
echo.
pause
set HTTP_PORT=3000
set HTTPS_PORT=0
node server.js
pause 