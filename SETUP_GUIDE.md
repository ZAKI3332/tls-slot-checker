# Complete Setup Guide for TLS Booking Bot

This guide will walk you through setting up and running the TLS Contact appointment booking bot from scratch.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Getting Your Form Group ID](#getting-your-form-group-id)
5. [Setting Up Telegram Notifications](#setting-up-telegram-notifications)
6. [Running the Bot](#running-the-bot)
7. [Understanding Bot Modes](#understanding-bot-modes)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

- **Node.js**: Version 18 or higher
- **Operating System**: Windows, macOS, or Linux
- **Internet Connection**: Stable connection required
- **Memory**: Minimum 100MB RAM

### Check Node.js Installation

```bash
node --version
```

If not installed, download from [nodejs.org](https://nodejs.org/)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/ZAKI3332/tls-slot-checker.git
cd tls-slot-checker
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `node-fetch`: For making HTTP requests

---

## Configuration

### Step 1: Create Configuration File

```bash
cp config.example.js config.js
```

### Step 2: Edit Configuration

Open `config.js` in your favorite text editor and fill in your details:

```javascript
export default {
  // REQUIRED: Get this from your appointment URL
  formGroupId: '1645832',
  
  // REQUIRED: Your appointment type
  appointmentType: 'Loisirs', // or 'Affaires', 'Famille', 'Etudes'
  
  // REQUIRED: Your personal information
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+213XXXXXXXXX',
  
  // OPTIONAL: Login credentials (if site requires login)
  password: '',  // Leave empty if no login required
  
  // Bot behavior
  autoBook: true,              // true = auto-book, false = only monitor
  stopAfterBooking: true,      // Stop after successful booking
  checkInterval: 60000,        // Check every 60 seconds
  maxRetries: 3,               // Retry failed bookings 3 times
  
  // OPTIONAL: Telegram notifications
  telegramBotToken: '',        // Get from @BotFather
  telegramChatId: '',          // Get from @userinfobot
};
```

---

## Getting Your Form Group ID

The Form Group ID is found in your TLS Contact appointment URL.

### Example URL:
```
https://visas-be.tlscontact.com/appointment/dz/dzALG2be/1645832
                                                           ^^^^^^^
                                                           This is your formGroupId
```

### Steps:
1. Go to the TLS Contact website
2. Navigate to the appointment booking page
3. Look at the URL in your browser
4. Copy the number at the end (e.g., `1645832`)
5. Paste it into your `config.js` file

---

## Setting Up Telegram Notifications

Telegram notifications let you know immediately when slots are found or bookings succeed.

### Step 1: Create a Telegram Bot

1. Open Telegram app
2. Search for `@BotFather`
3. Start a chat and send: `/newbot`
4. Follow the instructions to name your bot
5. Copy the **bot token** (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Step 2: Get Your Chat ID

1. Search for `@userinfobot` on Telegram
2. Start a chat
3. It will reply with your user info
4. Copy your **chat ID** (a number like: `123456789`)

### Step 3: Configure Telegram in config.js

```javascript
export default {
  // ... other config
  telegramBotToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
  telegramChatId: '123456789',
};
```

### Step 4: Start Your Bot

1. Search for your bot on Telegram (the name you gave it)
2. Click **Start** to begin a conversation

### Alternative: Use Environment Variables

For better security, use environment variables:

```bash
# Linux/Mac
export TELEGRAM_BOT_TOKEN="your_token_here"
export TELEGRAM_CHAT_ID="your_chat_id_here"

# Windows (Command Prompt)
set TELEGRAM_BOT_TOKEN=your_token_here
set TELEGRAM_CHAT_ID=your_chat_id_here

# Windows (PowerShell)
$env:TELEGRAM_BOT_TOKEN="your_token_here"
$env:TELEGRAM_CHAT_ID="your_chat_id_here"
```

---

## Running the Bot

### Mode 1: Monitor Only (Check Slots)

Just check for available slots without booking:

```bash
npm start
```

Or:

```bash
node index.js
```

This will:
- ✅ Check for available slots every 5 minutes
- ✅ Send Telegram notifications when slots are found
- ❌ NOT book appointments automatically

### Mode 2: Full Automation (Auto-Book)

Automatically book when slots are found:

```bash
npm run bot
```

Or:

```bash
node bot.js
```

This will:
- ✅ Check for available slots every 60 seconds (configurable)
- ✅ Send Telegram notifications
- ✅ Automatically book appointments
- ✅ Stop after successful booking (if configured)

---

## Understanding Bot Modes

### Monitor Mode (index.js)
- **Purpose**: Just watch for available slots
- **Use case**: When you want to know about availability but book manually
- **Command**: `npm start`

### Automation Mode (bot.js)
- **Purpose**: Full automation with booking
- **Use case**: When you want the bot to book for you
- **Command**: `npm run bot`
- **Requirements**: All configuration fields must be filled

---

## Bot Behavior Settings

### Auto-Book Setting

```javascript
autoBook: true   // Bot books automatically
autoBook: false  // Bot only notifies, doesn't book
```

### Stop After Booking

```javascript
stopAfterBooking: true   // Bot stops after first successful booking
stopAfterBooking: false  // Bot continues monitoring after booking
```

### Check Interval

```javascript
checkInterval: 60000   // Check every 60 seconds (60,000 milliseconds)
checkInterval: 30000   // Check every 30 seconds (minimum recommended)
checkInterval: 120000  // Check every 2 minutes
```

**Warning**: Don't set interval below 30 seconds to avoid rate limiting!

---

## Running the Bot 24/7

### Option 1: Keep Terminal Open

Just run the bot and keep the terminal window open. Press `Ctrl+C` to stop.

### Option 2: Use Screen (Linux/Mac)

```bash
# Start a screen session
screen -S tls-bot

# Run the bot
node bot.js

# Detach from screen: Press Ctrl+A, then D

# Reattach later
screen -r tls-bot

# List screens
screen -ls
```

### Option 3: Use PM2 (All Platforms)

```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start bot.js --name tls-booking-bot

# Check status
pm2 status

# View logs
pm2 logs tls-booking-bot

# Stop bot
pm2 stop tls-booking-bot

# Restart bot
pm2 restart tls-booking-bot
```

### Option 4: System Service (Linux)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/tls-bot.service
```

Add:

```ini
[Unit]
Description=TLS Booking Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/tls-slot-checker
ExecStart=/usr/bin/node bot.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable tls-bot
sudo systemctl start tls-bot
sudo systemctl status tls-bot
```

---

## Troubleshooting

### Problem: "Cannot find module './config.js'"

**Solution**: Create the config file:
```bash
cp config.example.js config.js
```
Then edit `config.js` with your details.

### Problem: "Missing required configuration fields"

**Solution**: Make sure you've replaced all placeholder values in `config.js`:
- Replace `YOUR_FIRST_NAME` with your actual first name
- Replace `YOUR_LAST_NAME` with your actual last name
- Replace `your.email@example.com` with your actual email
- Replace `+213XXXXXXXXX` with your actual phone number

### Problem: No slots found

**Possible causes**:
1. No slots are currently available (this is normal)
2. Wrong `formGroupId` - check your appointment URL
3. Wrong `appointmentType` - verify the correct type

**Solution**: Let the bot run continuously. It will find slots when they become available.

### Problem: Booking fails

**Possible causes**:
1. Slot was taken by someone else
2. Missing required fields
3. Invalid personal information

**Solution**:
1. Check logs for specific error messages
2. Verify all personal information is correct
3. Check if additional fields are required (passport number, etc.)

### Problem: Telegram notifications not working

**Solution**:
1. Verify bot token is correct (copy from @BotFather)
2. Verify chat ID is correct (from @userinfobot)
3. Make sure you've started a chat with your bot
4. Check that token and chat ID are in quotes in config.js

### Problem: Rate limiting / 429 errors

**Solution**:
1. Increase `checkInterval` to 60000 or higher
2. Wait a few hours before trying again
3. Don't run multiple instances of the bot

---

## Getting Help

If you're still having issues:

1. **Check the logs**: The bot prints detailed information about what it's doing
2. **Review configuration**: Make sure all required fields are filled correctly
3. **Test the appointment URL**: Make sure you can access it in your browser
4. **Open an issue**: Create a GitHub issue with:
   - What you're trying to do
   - The error message you're seeing
   - Your Node.js version (`node --version`)

---

## Success Checklist

Before running the bot, verify:

- [ ] Node.js 18+ is installed
- [ ] Dependencies are installed (`npm install`)
- [ ] `config.js` exists and is filled out
- [ ] `formGroupId` matches your appointment URL
- [ ] All personal information is correct
- [ ] Telegram bot is created (optional)
- [ ] You've started a chat with your Telegram bot (optional)

---

## Next Steps

Once the bot is running successfully:

1. **Monitor the logs** to see what the bot is doing
2. **Test notifications** by waiting for slots to appear
3. **Adjust check interval** based on your needs
4. **Set up 24/7 running** using PM2 or screen if desired

Good luck with your appointment booking! 🎉
