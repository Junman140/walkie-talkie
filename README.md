# Simple Walkie-Talkie App

A lightweight, mobile-friendly walkie-talkie application for local network communication. Perfect for church media teams, event coordination, or any group that needs simple voice communication on the same WiFi network.

## Features

- 🎤 **Real-time voice communication** - Hold to talk, release to stop
- 💬 **Text chat** - Send messages with Enter key or Send button
- 📱 **Mobile-optimized** - Works great on phones and tablets
- 👥 **Participant management** - See who's connected and who's talking
- 📝 **Chat history** - Keep track of all voice and text communication
- 🔗 **Simple setup** - No complex configuration required
- 🌐 **Local network** - Works on any WiFi network without internet

## Quick Start

### Prerequisites
- Node.js (version 14 or higher) OR Python 3
- All devices must be on the same WiFi network
- Modern browser with microphone support (Chrome, Firefox, Safari)

### Installation

1. **Clone or download the files**
   ```bash
   # If you have the files locally, just navigate to the folder
   cd walkie-talkie-folder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   **Note:** If you're on Windows and want to use npm scripts, you'll need cross-env:
   ```bash
   npm install cross-env
   ```

3. **Start the server**
   
   **Windows Users:**
   ```cmd
   # Option 1: HTTPS server (recommended for mobile)
   start-https.bat
   
   # Option 2: HTTP server
   start-http.bat
   
   # Option 3: Both servers
   start-both.bat
   ```
   
   **Mac/Linux Users:**
   ```bash
   # Option 1: Interactive Node.js server (Recommended)
   npm run server
   
   # Option 2: Node.js HTTP server
   npm run http
   
   # Option 3: Node.js HTTPS server (for microphone access)
   npm run https
   
   # Option 4: Both HTTP and HTTPS servers
   npm start
   ```
   
   **Python Alternative:**
   ```bash
   # Option 5: Python HTTP server
   python simple_server.py
   
   # Option 6: Python HTTPS server
   python https_server.py
   ```

4. **Access the app**
   - **HTTP**: `http://localhost:3000` (basic connection)
   - **HTTPS**: `https://localhost:3443` (microphone support)
   - **Mobile devices**: Use the IP addresses shown in the console

### Usage

1. **One person hosts the server** (usually the person with the best WiFi connection)
2. **Everyone connects** by entering the host's IP address
3. **Enter your name** (e.g., "Camera 1", "Sound", "Lighting")
4. **Hold the button to talk**, release to stop
5. **Type messages** in the chat box and press Enter to send
6. **See who's talking** in the participants list

## Setup Instructions

### For the Host (Server)

1. Run the server on a computer connected to the WiFi network
2. Note the IP address shown in the console (e.g., `192.168.1.100`)
3. Share this IP address with your team

### For Team Members (Clients)

1. Open a web browser on your phone/tablet
2. Enter the host's IP address (e.g., `http://192.168.1.100:3000`)
3. Enter your name and click "Connect"
4. Grant microphone permissions when prompted

## Troubleshooting

### Common Issues

**"Connection failed"**
- Make sure all devices are on the same WiFi network
- Check that the host's IP address is correct
- Ensure the server is running

**"Microphone access denied"**
- Allow microphone permissions in your browser
- Try refreshing the page and granting permissions again
- Use HTTPS server: `npm run https` or `python https_server.py`
- Make sure you're not accessing via file:// protocol

**Audio not working**
- Use headphones to prevent feedback
- Check that your device's microphone is working
- Try a different browser (Chrome/Safari work best)

**Can't hear others**
- Check that your device's speakers/headphones are working
- Make sure the volume is turned up
- Try refreshing the page

### Network Issues

If you're having trouble connecting:

1. **Use the test page** to diagnose issues:
   - Visit `http://[IP]:3000/test` or `https://[IP]:3443/test`
   - This will test connection, WebSocket, and microphone

2. **Find your IP address** (on the host computer):
   - Windows: Run `ipconfig` in Command Prompt
   - Mac/Linux: Run `ifconfig` in Terminal
   - Look for your WiFi adapter's IP address

3. **Test connectivity**:
   - Try pinging the host IP from other devices
   - Make sure firewall isn't blocking the ports

4. **Alternative setup**:
   - Use a different port: `HTTP_PORT=8080 npm start`
   - Or use the simple Python server: `python simple_server.py`

## Technical Details

### How it Works

- **WebSocket communication** for real-time messaging
- **MediaRecorder API** for audio capture and playback
- **Base64 encoding** for audio transmission
- **Local network** communication (no external servers)

### Browser Compatibility

- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

### Audio Format

- Format: WebM with Opus codec
- Sample rate: 22.05 kHz
- Features: Echo cancellation, noise suppression

### Microphone Access

- **HTTPS required** for microphone access on most browsers
- Use `npm run https` or `python https_server.py` for secure connections
- Some browsers allow HTTP on localhost
- Grant microphone permissions when prompted

## Development

### Running in Development Mode

```bash
npm run dev
```

This will restart the server automatically when you make changes.

### Project Structure

```
walkie-talkie/
├── walkie-talkie-improved.html  # Main application
├── server.js                    # WebSocket server
├── package.json                 # Dependencies
└── README.md                   # This file
```

### Customization

You can easily customize the app by editing `walkie-talkie-improved.html`:

- **Colors**: Modify the CSS variables in the `<style>` section
- **Audio settings**: Adjust the `getUserMedia` options
- **UI elements**: Add or remove features as needed

## Security Notes

- This app is designed for **local network use only**
- No data is stored or transmitted outside your network
- All communication happens in real-time via WebSockets
- No authentication required (suitable for trusted local networks)

## License

MIT License - feel free to use and modify for your needs!

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Ensure all devices are on the same network
3. Try using a different browser
4. Check that your firewall allows the connection

---

**Happy communicating! 🎤** 