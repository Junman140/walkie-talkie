const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Create self-signed certificate if it doesn't exist
function createSelfSignedCert() {
    const certPath = path.join(__dirname, 'server.crt');
    const keyPath = path.join(__dirname, 'server.key');
    
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.log('Creating self-signed certificate...');
        
        try {
            // Generate private key
            const privateKey = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem'
                }
            });
            
            // Create a more compatible certificate
            const cert = crypto.createCertificate();
            cert.setPublicKey(privateKey.publicKey);
            cert.sign(privateKey.privateKey, 'sha256');
            
            // Write files
            fs.writeFileSync(keyPath, privateKey.privateKey);
            fs.writeFileSync(certPath, cert.getPEM());
            
            console.log('Self-signed certificate created successfully!');
        } catch (error) {
            console.error('Error creating certificate:', error.message);
            return null;
        }
    }
    
    try {
        return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };
    } catch (error) {
        console.error('Error reading certificate files:', error.message);
        return null;
    }
}

// Create HTTP server
const httpServer = http.createServer(requestHandler);

// Create HTTPS server
let httpsServer;
try {
    const credentials = createSelfSignedCert();
    httpsServer = https.createServer(credentials, requestHandler);
} catch (error) {
    console.log('⚠️  Could not create HTTPS server:', error.message);
    console.log('   HTTP server will still work for localhost access');
}

// Create WebSocket servers
const httpWss = new WebSocket.Server({ server: httpServer });
const httpsWss = httpsServer ? new WebSocket.Server({ server: httpsServer }) : null;

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
if (httpsWss) {
    httpsWss.on('connection', (ws) => handleWebSocketConnection(ws, 'HTTPS'));
}

function broadcastToOthers(sender, message) {
    // Broadcast to all clients regardless of server type
    const allClients = new Set();
    
    // Add HTTP clients
    httpWss.clients.forEach(client => allClients.add(client));
    
    // Add HTTPS clients
    if (httpsWss) {
        httpsWss.clients.forEach(client => allClients.add(client));
    }
    
    allClients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Start HTTP server
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🎤 Walkie-Talkie Server Started');
    console.log('='.repeat(50));
    console.log(`📱 HTTP Server running on port ${HTTP_PORT}`);
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
});

// Start HTTPS server if available
if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
        console.log(`💻 Local access: https://localhost:${HTTPS_PORT}`);
        
        // Get local IP address for HTTPS
        const os = require('os');
        const interfaces = os.networkInterfaces();
        
        for (const name of Object.keys(interfaces)) {
            for (const interface of interfaces[name]) {
                if (interface.family === 'IPv4' && !interface.internal) {
                    console.log(`   🔒 https://${interface.address}:${HTTPS_PORT}`);
                }
            }
        }
        
        console.log('='.repeat(50));
        console.log('📋 Instructions for team members:');
        console.log('   1. Open browser on your phone/tablet');
        console.log('   2. Enter HTTPS address for microphone access');
        console.log('   3. Accept security warning (self-signed cert)');
        console.log('   4. Enter your name and click Connect');
        console.log('   5. Grant microphone permissions');
        console.log('='.repeat(50));
        console.log('🌐 Make sure all devices are on the same WiFi network');
        console.log('='.repeat(50));
        console.log('Press Ctrl+C to stop the server');
        console.log('='.repeat(50));
    });
} else {
    console.log('='.repeat(50));
    console.log('📋 Instructions for team members:');
    console.log('   1. Open browser on your phone/tablet');
    console.log('   2. Enter HTTP address (microphone may not work)');
    console.log('   3. Enter your name and click Connect');
    console.log('   4. Grant microphone permissions');
    console.log('='.repeat(50));
    console.log('🌐 Make sure all devices are on the same WiFi network');
    console.log('='.repeat(50));
    console.log('Press Ctrl+C to stop the server');
    console.log('='.repeat(50));
} 