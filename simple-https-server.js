const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Request handler for both HTTP and HTTPS
function requestHandler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve the HTML file
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'walkie-talkie-improved.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/test') {
        fs.readFile(path.join(__dirname, 'test-connection.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading test file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
}

// Create HTTP server
const httpServer = http.createServer(requestHandler);

// Create WebSocket server for HTTP
const httpWss = new WebSocket.Server({ server: httpServer });

// Store connected clients
const clients = new Map();

// WebSocket connection handler
function handleWebSocketConnection(ws, serverType) {
    console.log(`New client connected via ${serverType}`);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'join':
                    // Store client info
                    clients.set(ws, {
                        username: data.username,
                        isTalking: false,
                        serverType: serverType
                    });
                    
                    // Send current participants to new client
                    const participants = Array.from(clients.values()).map(client => client.username);
                    ws.send(JSON.stringify({
                        type: 'participants',
                        participants: participants
                    }));
                    
                    // Broadcast join to all other clients
                    broadcastToOthers(ws, {
                        type: 'join',
                        username: data.username
                    });
                    
                    console.log(`${data.username} joined via ${serverType}`);
                    break;
                    
                case 'leave':
                    const clientInfo = clients.get(ws);
                    if (clientInfo) {
                        broadcastToOthers(ws, {
                            type: 'leave',
                            username: clientInfo.username
                        });
                        console.log(`${clientInfo.username} left`);
                    }
                    break;
                    
                case 'audio':
                    // Broadcast audio to all other clients
                    broadcastToOthers(ws, {
                        type: 'audio',
                        username: data.username,
                        audioData: data.audioData
                    });
                    break;
                    
                case 'chat':
                    // Broadcast chat message to all other clients
                    broadcastToOthers(ws, {
                        type: 'chat',
                        username: data.username,
                        message: data.message
                    });
                    break;
                    
                case 'talking':
                    const talkingClient = clients.get(ws);
                    if (talkingClient) {
                        talkingClient.isTalking = true;
                        broadcastToOthers(ws, {
                            type: 'talking',
                            username: data.username
                        });
                    }
                    break;
                    
                case 'stopped':
                    const stoppedClient = clients.get(ws);
                    if (stoppedClient) {
                        stoppedClient.isTalking = false;
                        broadcastToOthers(ws, {
                            type: 'stopped',
                            username: data.username
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        const clientInfo = clients.get(ws);
        if (clientInfo) {
            broadcastToOthers(ws, {
                type: 'leave',
                username: clientInfo.username
            });
            console.log(`${clientInfo.username} disconnected`);
        }
        clients.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

// Set up WebSocket connections
httpWss.on('connection', (ws) => handleWebSocketConnection(ws, 'HTTP'));

function broadcastToOthers(sender, message) {
    // Broadcast to all clients
    httpWss.clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

const HTTP_PORT = process.env.HTTP_PORT || 3000;

// Start HTTP server only (no HTTPS for now)
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🎤 Walkie-Talkie Server (HTTP Only)');
    console.log('='.repeat(50));
    console.log(`📱 Server running on port ${HTTP_PORT}`);
    console.log(`💻 Local access: http://localhost:${HTTP_PORT}`);
    
    // Get local IP address for easy sharing
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let foundIP = false;
    
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                console.log(`   🌐 http://${interface.address}:${HTTP_PORT}`);
                foundIP = true;
            }
        }
    }
    
    if (!foundIP) {
        console.log('   ⚠️  Could not detect IP address automatically');
        console.log('   💡 Try running: ipconfig (Windows) or ifconfig (Mac/Linux)');
    }
    
    console.log('='.repeat(50));
    console.log('📋 Instructions for team members:');
    console.log('   1. Open browser on your phone/tablet');
    console.log('   2. Enter the HTTP address above');
    console.log('   3. Enter your name and click Connect');
    console.log('   4. Grant microphone permissions (may not work on mobile)');
    console.log('='.repeat(50));
    console.log('🌐 Make sure all devices are on the same WiFi network');
    console.log('='.repeat(50));
    console.log('Press Ctrl+C to stop the server');
    console.log('='.repeat(50));
}); 