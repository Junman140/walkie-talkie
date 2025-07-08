# Troubleshooting Guide

## Mobile Devices Can't Connect

### Common Issues and Solutions

#### 1. "Connection Failed" Error

**Problem:** Mobile devices get "Connection failed" when trying to connect.

**Solutions:**
- ✅ **Check the IP address** - Make sure you're using the correct IP from the server console
- ✅ **Same WiFi network** - Ensure all devices are connected to the same WiFi
- ✅ **Server is running** - Verify the server is still running on the host computer
- ✅ **Try different IP** - If multiple IPs are shown, try each one

#### 2. "404 Not Found" Error

**Problem:** Browser shows "404 Not Found" when accessing the IP address.

**Solutions:**
- ✅ **Check server status** - Make sure the server is running
- ✅ **Correct port** - Verify you're using the right port (default: 3000)
- ✅ **Firewall** - Check if Windows Firewall is blocking the connection
- ✅ **Try localhost first** - Test with `http://localhost:3000` on the host computer

#### 3. WebSocket Connection Fails

**Problem:** "WebSocket connection to 'ws://...' failed"

**Solutions:**
- ✅ **Use correct IP** - Don't use "localhost" on mobile devices
- ✅ **Check network** - Ensure all devices are on the same network
- ✅ **Restart server** - Stop and restart the server
- ✅ **Clear browser cache** - Try refreshing or clearing browser data

### Step-by-Step Debugging

#### For the Host (Server):

1. **Start the server:**
   ```bash
   npm start
   # or
   python simple_server.py
   ```

2. **Note the IP addresses** shown in the console

3. **Test locally first:**
   - Open `http://localhost:3000` on the host computer
   - Make sure it loads correctly

4. **Find your IP manually** (if needed):
   - **Windows:** Run `ipconfig` in Command Prompt
   - **Mac/Linux:** Run `ifconfig` in Terminal
   - Look for your WiFi adapter's IP address

#### For Mobile Devices:

1. **Get the correct IP** from the host
2. **Open browser** and enter: `http://[HOST_IP]:3000`
   - Example: `http://192.168.1.100:3000`
3. **Enter your name** and click "Connect"
4. **Grant microphone permissions** when prompted

### Network Troubleshooting

#### Check Network Connectivity:

1. **Ping test** (from mobile device):
   - Try pinging the host IP address
   - If ping fails, there's a network issue

2. **Port test:**
   - Try accessing `http://[HOST_IP]:3000` in browser
   - Should show the walkie-talkie interface

3. **Firewall check:**
   - Windows: Check Windows Firewall settings
   - Mac: Check System Preferences > Security & Privacy > Firewall

#### Alternative Solutions:

1. **Use different port:**
   ```bash
   PORT=8080 npm start
   ```

2. **Try Python server:**
   ```bash
   python simple_server.py
   ```

3. **Check router settings:**
   - Some routers block local network communication
   - Try disabling router firewall temporarily

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Connection failed" | Check IP address and network |
| "404 Not Found" | Server not running or wrong port |
| "WebSocket failed" | Use correct IP (not localhost) |
| "Microphone denied" | Grant permissions in browser |
| "Can't hear audio" | Check speakers/headphones |

### Quick Fix Checklist

- [ ] Server is running and shows IP addresses
- [ ] Using correct IP address (not localhost)
- [ ] All devices on same WiFi network
- [ ] Browser has microphone permissions
- [ ] Speakers/headphones are working
- [ ] No firewall blocking connection

### Still Having Issues?

1. **Try a different browser** (Chrome/Safari work best)
2. **Restart the server** and try again
3. **Check device settings** for microphone permissions
4. **Use headphones** to prevent audio feedback
5. **Try on a different network** if possible

---

**Need more help?** Check the browser console for specific error messages and share them for better assistance. 