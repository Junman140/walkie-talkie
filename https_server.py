#!/usr/bin/env python3
"""
HTTPS server for the walkie-talkie app.
This provides a secure connection for microphone access.
"""

import http.server
import socketserver
import os
import socket
import webbrowser
import ssl
import tempfile
import subprocess
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
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"

def create_self_signed_cert():
    """Create a self-signed certificate for HTTPS."""
    try:
        # Check if openssl is available
        subprocess.run(['openssl', 'version'], capture_output=True, check=True)
        
        # Create certificate
        cert_file = 'server.crt'
        key_file = 'server.key'
        
        if not (os.path.exists(cert_file) and os.path.exists(key_file)):
            print("Creating self-signed certificate...")
            subprocess.run([
                'openssl', 'req', '-x509', '-newkey', 'rsa:4096', '-keyout', key_file,
                '-out', cert_file, '-days', '365', '-nodes', '-subj', '/CN=localhost'
            ], check=True)
            print("Certificate created successfully!")
        
        return cert_file, key_file
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  OpenSSL not found. Cannot create HTTPS certificate.")
        print("   Install OpenSSL or use the regular HTTP server.")
        return None, None

def main():
    PORT = 3443  # HTTPS port
    
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Try to create SSL certificate
    cert_file, key_file = create_self_signed_cert()
    
    if not cert_file or not key_file:
        print("❌ Cannot start HTTPS server without certificate.")
        print("💡 Use the regular HTTP server instead: python simple_server.py")
        return
    
    # Create server
    with socketserver.TCPServer(("", PORT), WalkieTalkieHandler) as httpd:
        # Wrap with SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert_file, key_file)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        local_ip = get_local_ip()
        
        print("=" * 50)
        print("🔒 Secure Walkie-Talkie Server (HTTPS)")
        print("=" * 50)
        print(f"📱 Server running on port {PORT}")
        print(f"💻 Local access: https://localhost:{PORT}")
        print("=" * 50)
        print("📱 MOBILE DEVICES - Use these IP addresses:")
        print(f"   🔒 https://{local_ip}:{PORT}")
        print("=" * 50)
        print("📋 Instructions for team members:")
        print("   1. Open browser on your phone/tablet")
        print(f"   2. Enter: https://{local_ip}:{PORT}")
        print("   3. Accept the security warning (self-signed cert)")
        print("   4. Enter your name and click Connect")
        print("   5. Grant microphone permissions")
        print("=" * 50)
        print("🌐 Make sure all devices are on the same WiFi network")
        print("=" * 50)
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Open browser automatically
        try:
            webbrowser.open(f"https://localhost:{PORT}")
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            httpd.shutdown()

if __name__ == "__main__":
    main() 