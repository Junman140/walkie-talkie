@echo off
echo Starting Walkie-Talkie HTTP Server (Simple Mode)...
echo.
echo This will start the HTTP server without HTTPS complications.
echo Mobile devices should use: http://192.168.0.1:3000
echo.
echo Note: Microphone may not work on mobile devices with HTTP.
echo For microphone support, try the Python HTTPS server instead.
echo.
pause
set HTTP_PORT=3000
set HTTPS_PORT=0
node simple-https-server.js
pause 