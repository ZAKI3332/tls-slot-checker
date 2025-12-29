# Cloudflare Bypass - Browser Mode Setup Guide

## 🎉 Problem Solved!

The bot has been successfully converted to use **Puppeteer with stealth plugin** to bypass Cloudflare protection. No more 403 errors!

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `puppeteer` - Browser automation
- `puppeteer-extra` - Extended Puppeteer features
- `puppeteer-extra-plugin-stealth` - Cloudflare bypass

**Note:** Puppeteer will automatically download Chrome/Chromium (~170MB). This is normal and required.

### 2. Configure Your Account

**Single Account:**
```bash
cp config.example.js config.js
# Edit config.js with your details
```

**Multi-Account:**
```bash
cp config.multi.example.js config.multi.js
# Edit config.multi.js with all your accounts
```

### 3. Run the Bot

**Single Account Mode:**
```bash
npm run bot
```

**Multi-Account Mode (Recommended):**
```bash
npm run multi
```

## ✨ What's New

### Browser Automation Features

✅ **Bypasses Cloudflare** - No more 403 errors or "Just a moment..." pages  
✅ **Stealth Mode** - Undetectable as a bot  
✅ **Visual Login** - Handles the actual website UI  
✅ **0.1s Checking** - Still ultra-fast (PRIMARY account)  
✅ **Multi-Account** - Multiple browsers in parallel  
✅ **Auto-Recovery** - Handles session timeouts automatically  

### How It Works

```
1. Bot launches real Chrome browser (headless)
2. Navigates to TLS Contact website
3. Cloudflare challenge is automatically solved
4. Logs in using your credentials
5. Monitors slots by checking the page
6. Books appointments by clicking buttons
7. All happens automatically in background
```

## 📊 Performance

| Feature | API Mode (Old) | Browser Mode (New) |
|---------|---------------|-------------------|
| Cloudflare | ❌ Blocked (403) | ✅ Bypassed |
| Speed (PRIMARY) | N/A | 0.1 seconds |
| Speed (SECONDARY) | N/A | 5 minutes |
| Multi-Account | ❌ Failed | ✅ Works |
| Reliability | ❌ Low | ✅ High |
| Detection | ❌ Easy | ✅ Stealthy |

## 🔧 System Requirements

- **Node.js**: 18.0.0 or higher
- **RAM**: Minimum 512MB per browser instance
  - Single account: 512MB
  - 2 accounts: 1GB
  - 3 accounts: 1.5GB
- **Disk Space**: ~200MB for Chrome download
- **OS**: Windows, Linux, or macOS

## 💡 Troubleshooting

### Chrome Download Issues

If Puppeteer can't download Chrome:

```bash
# Option 1: Use system Chrome
export PUPPETEER_SKIP_DOWNLOAD=true
npm install

# Option 2: Set custom download URL
export PUPPETEER_DOWNLOAD_HOST=https://npmmirror.com/mirrors/chromium-browser-snapshots/
npm install
```

### Browser Launch Issues

If browser won't launch:

```bash
# Linux: Install missing dependencies
sudo apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libgbm1 \
  libasound2

# Windows: Make sure Visual C++ Redistributable is installed
```

### Memory Issues

If running out of memory with multi-account:

```javascript
// In config.multi.js
// Reduce number of accounts or increase check intervals
export default {
  primaryCheckInterval: 500,     // Slower: 0.5s instead of 0.1s
  secondaryCheckInterval: 600000 // Slower: 10min instead of 5min
}
```

### Headless Mode Issues

If you want to see the browser (for debugging):

```javascript
// In browser-booking-bot.js, line ~20
this.browser = await puppeteer.launch({
  headless: false,  // Change from 'new' to false
  // ... rest of config
});
```

## 🎯 Example: Complete Setup

```bash
# 1. Clone and install
git clone https://github.com/ZAKI3332/tls-slot-checker.git
cd tls-slot-checker
npm install

# 2. Configure (example for multi-account)
cp config.multi.example.js config.multi.js

# 3. Edit config.multi.js:
# - Add your email/password for each account
# - Fill in firstName, lastName, phone
# - Set formGroupId from your URL

# 4. Run
npm run multi

# Expected output:
# ✅ Multi-account configuration loaded
# 🌐 Launching browsers...
# ✅ Browser ready
# 🔐 Login successful
# ⚡ PRIMARY checking every 0.1s
# 🐌 SECONDARY on standby (5min)
# ⚪ No slots available yet...
```

## 🔐 Security Notes

- Browsers run in headless mode (no UI shown)
- All your credentials stay local
- No data sent to third parties
- Stealth plugin only modifies browser fingerprint
- Same security as using Chrome normally

## 🆘 Still Having Issues?

1. **Make sure Node.js is 18+**: `node --version`
2. **Clear and reinstall**: `rm -rf node_modules && npm install`
3. **Check RAM**: Close other apps if needed
4. **Try headless: false**: To see what's happening
5. **Check logs**: Look for specific error messages

## 📝 Notes

- **First run**: Takes longer (Chrome download)
- **Subsequent runs**: Fast startup
- **Browser updates**: Puppeteer handles automatically
- **Multi-account**: Each browser is independent
- **Rate limiting**: 0.1s is aggressive but works

---

## 🎉 Success!

You should now be able to run the bot without any Cloudflare 403 errors!

The browser automation approach is more reliable, handles website changes better, and looks just like a real user browsing the site.

Happy booking! 🚀
