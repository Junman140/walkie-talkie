#!/usr/bin/env node
/**
 * Walkie-Talkie Server Startup Script
 * Allows easy selection between HTTP and HTTPS servers
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🎤 Walkie-Talkie Server');
console.log('='.repeat(40));

console.log('Choose your server type:');
console.log('1. HTTP Server (port 3000) - Basic connection');
console.log('2. HTTPS Server (port 3443) - Secure connection with microphone support');
console.log('3. Both servers (HTTP + HTTPS) - Recommended');
console.log('4. Exit');

rl.question('\nEnter your choice (1-4): ', (choice) => {
    switch (choice.trim()) {
        case '1':
            console.log('\n🚀 Starting HTTP server...');
            startServer('http');
            break;
        case '2':
            console.log('\n🔒 Starting HTTPS server...');
            startServer('https');
            break;
        case '3':
            console.log('\n🚀 Starting both HTTP and HTTPS servers...');
            startServer('both');
            break;
        case '4':
            console.log('\n👋 Goodbye!');
            rl.close();
            break;
        default:
            console.log('\n❌ Invalid choice. Please run the script again.');
            rl.close();
    }
});

function startServer(type) {
    let env = { ...process.env };
    
    switch (type) {
        case 'http':
            env.HTTP_PORT = '3000';
            env.HTTPS_PORT = '0'; // Disable HTTPS
            break;
        case 'https':
            env.HTTP_PORT = '0'; // Disable HTTP
            env.HTTPS_PORT = '3443';
            break;
        case 'both':
            env.HTTP_PORT = '3000';
            env.HTTPS_PORT = '3443';
            break;
    }
    
    const server = spawn('node', ['server.js'], {
        stdio: 'inherit',
        env: env
    });
    
    server.on('error', (error) => {
        console.error('❌ Failed to start server:', error.message);
        console.log('💡 Make sure you have Node.js installed and dependencies are installed (npm install)');
    });
    
    server.on('close', (code) => {
        console.log(`\n🛑 Server stopped with code ${code}`);
        rl.close();
    });
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping server...');
        server.kill('SIGINT');
    });
} 