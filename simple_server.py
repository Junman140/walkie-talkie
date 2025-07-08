#!/usr/bin/env python3
"""
Simple HTTP server for the walkie-talkie app.
This is an alternative to the Node.js server for users without Node.js.
"""

import http.server
import socketserver
import os
import socket
import webbrowser
from urllib.parse import urlparse

class WalkieTalkieHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for WebSocket support
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        # Serve the HTML file for root path
        if self.path == '/':
            self.path = '/walkie-talkie-improved.html'
        return super().do_GET()

def get_local_ip():
    """Get the local IP address of this machine."""
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"

def main():
    PORT = 3000
    
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create server
    with socketserver.TCPServer(("", PORT), WalkieTalkieHandler) as httpd:
        local_ip = get_local_ip()
        
        print("=" * 50)
        print("🎤 Simple Walkie-Talkie Server")
        print("=" * 50)
        print(f"📱 Server running on port {PORT}")
        print(f"💻 Local access: http://localhost:{PORT}")
        print("=" * 50)
        print("📱 MOBILE DEVICES - Use this IP address:")
        print(f"   🌐 http://{local_ip}:{PORT}")
        print("=" * 50)
        print("📋 Instructions for team members:")
        print("   1. Open browser on your phone/tablet")
        print(f"   2. Enter: http://{local_ip}:{PORT}")
        print("   3. Enter your name and click Connect")
        print("   4. Grant microphone permissions")
        print("=" * 50)
        print("🌐 Make sure all devices are on the same WiFi network")
        print("=" * 50)
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Open browser automatically
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            httpd.shutdown()

if __name__ == "__main__":
    main() 