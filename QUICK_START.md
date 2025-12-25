# 🚀 STEP-BY-STEP GUIDE: How to Run the TLS Booking Bot (NO ERRORS!)

This is a **beginner-friendly, foolproof guide** to get your TLS appointment booking bot running without any errors.

---

## ✅ STEP 1: Check if You Have Node.js

**Open your terminal** (Command Prompt on Windows, Terminal on Mac/Linux) and type:

```bash
node --version
```

**What should happen:**
- You should see something like `v18.0.0` or higher (any version 18+)

**If you see an error or version is below 18:**
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended for most users)
3. Install it (click Next, Next, Next... until done)
4. Close and reopen your terminal
5. Try `node --version` again

---

## ✅ STEP 2: Download the Bot

**Option A - Using Git (if you have it):**
```bash
git clone https://github.com/ZAKI3332/tls-slot-checker.git
cd tls-slot-checker
```

**Option B - Download ZIP (easier for beginners):**
1. Go to: https://github.com/ZAKI3332/tls-slot-checker
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file to a folder (like `C:\tls-bot` or `~/tls-bot`)
5. Open terminal and navigate to that folder:
   - Windows: `cd C:\tls-bot`
   - Mac/Linux: `cd ~/tls-bot`

---

## ✅ STEP 3: Install Required Packages

**In your terminal, type:**
```bash
npm install
```

**What should happen:**
- You'll see some text scrolling
- After 10-30 seconds, it should say something like "added 6 packages"
- No red ERROR messages (warnings are OK)

**If you get an error:**
- Make sure you're in the correct folder (`cd tls-slot-checker`)
- Make sure Node.js is installed correctly
- Try running as administrator (Windows) or with `sudo` (Mac/Linux)

---

## ✅ STEP 4: Create Your Configuration File

**Type this command:**
```bash
cp config.example.js config.js
```

**On Windows (if above doesn't work):**
```bash
copy config.example.js config.js
```

**What should happen:**
- A new file `config.js` is created
- No error messages

---

## ✅ STEP 5: Edit Your Configuration (MOST IMPORTANT!)

**Open `config.js` in any text editor:**
- Windows: Right-click → "Edit with Notepad"
- Mac: Right-click → "Open With" → "TextEdit"
- Or use VS Code, Sublime Text, etc.

**Fill in YOUR information:**

```javascript
export default {
  // ⚠️ REQUIRED: Get this from your appointment URL
  // Your URL: https://visas-be.tlscontact.com/appointment/dz/dzALG2be/1645832
  //                                                                    ↑↑↑↑↑↑↑
  // This number is your formGroupId
  formGroupId: '1645832',  // ← PUT YOUR NUMBER HERE
  
  // ⚠️ REQUIRED: What type of appointment?
  appointmentType: 'Loisirs',  // Options: 'Loisirs', 'Affaires', 'Famille', 'Etudes'
  
  // ⚠️ REQUIRED: Your personal information
  firstName: 'Ahmed',              // ← YOUR FIRST NAME
  lastName: 'Benali',              // ← YOUR LAST NAME
  email: 'ahmed@example.com',      // ← YOUR EMAIL
  phone: '+213555123456',          // ← YOUR PHONE WITH +213
  
  // ⚠️ IMPORTANT: Bot behavior
  autoBook: false,  // ← Start with FALSE to test safely!
  stopAfterBooking: true,
  checkInterval: 60000,  // Check every 60 seconds
  
  // 📱 OPTIONAL: Telegram notifications (leave empty for now)
  telegramBotToken: '',
  telegramChatId: '',
};
```

**❗ CRITICAL: Start with `autoBook: false` for testing!**

**Save the file** (Ctrl+S or Cmd+S)

---

## ✅ STEP 6: Test the Bot (Safe Mode - No Booking)

**Type this command:**
```bash
npm start
```

**What should happen:**
```
[2025-12-25T13:40:00.000Z] Aucun créneau trouvé.
```
Or if slots are available:
```
🟢 Créneaux disponibles :
2025-01-15 à 09:00
2025-01-16 à 14:00
```

**This means the bot is working!**

**Press Ctrl+C to stop the bot**

---

## ✅ STEP 7: Run the Full Bot (With Booking - If You Want)

**⚠️ ONLY DO THIS AFTER STEP 6 WORKS!**

1. **Open `config.js` again**
2. **Change `autoBook: false` to `autoBook: true`**
3. **Save the file**
4. **Run the bot:**

```bash
npm run bot
```

**What should happen:**
```
🤖 Starting TLS Appointment Booking Bot...
============================================================
📋 Configuration Summary:
   Form Group ID: 1645832
   Appointment Type: Loisirs
   Name: Ahmed Benali
   Email: ahmed@example.com
   Phone: +213555123456
   Auto-book: ✅ Enabled
   Check interval: 60s
============================================================

🔄 Initializing session...
✅ Session initialized successfully
🔍 Checking available slots...
```

**The bot will now:**
- Check for slots every 60 seconds
- Automatically book when it finds available slots
- Stop after booking (if you set `stopAfterBooking: true`)

---

## ❌ COMMON ERRORS AND HOW TO FIX THEM

### Error: "Cannot find module './config.js'"
**Problem:** You didn't create the config file  
**Solution:** Go back to STEP 4

### Error: "Missing required configuration fields"
**Problem:** You didn't fill in your personal information  
**Solution:** Open `config.js` and replace ALL the example values:
- Change `'YOUR_FIRST_NAME'` to your real name
- Change `'your.email@example.com'` to your real email
- Change `'+213XXXXXXXXX'` to your real phone

### Error: "node: command not found"
**Problem:** Node.js is not installed  
**Solution:** Go back to STEP 1

### Error: "npm: command not found"
**Problem:** Node.js is not installed correctly  
**Solution:** Reinstall Node.js from nodejs.org

### Error: "ENOTFOUND visas-be.tlscontact.com"
**Problem:** No internet connection or website is down  
**Solution:** 
- Check your internet connection
- Try visiting https://visas-be.tlscontact.com in your browser
- Wait a few minutes and try again

### No slots found (keeps saying "Aucun créneau trouvé")
**This is NORMAL!** There are no available slots right now.  
**Solution:** Let the bot run continuously. It will book when slots appear.

---

## 🎯 QUICK START CHECKLIST

Before you start, make sure you have:
- [ ] Node.js 18+ installed (`node --version` works)
- [ ] Downloaded/cloned the bot
- [ ] Ran `npm install` successfully
- [ ] Created `config.js` from `config.example.js`
- [ ] Filled in ALL your personal information in `config.js`
- [ ] Tested with `npm start` first (autoBook: false)
- [ ] Only then changed to `autoBook: true` and ran `npm run bot`

---

## 🔄 HOW TO KEEP IT RUNNING 24/7

### Windows - Keep Terminal Open
- Just leave the terminal window open
- Don't close it or your computer

### Using PM2 (All Systems - Recommended)
```bash
# Install PM2
npm install -g pm2

# Start the bot in background
pm2 start bot.js --name tls-booking

# Check if it's running
pm2 status

# View logs
pm2 logs tls-booking

# Stop the bot
pm2 stop tls-booking
```

---

## 📱 OPTIONAL: Set Up Telegram Notifications

**Only do this if you want alerts on your phone:**

1. **Create a bot on Telegram:**
   - Open Telegram app
   - Search for `@BotFather`
   - Send: `/newbot`
   - Follow the instructions
   - Copy the bot token (looks like: `123456:ABC-DEF...`)

2. **Get your Chat ID:**
   - Search for `@userinfobot` on Telegram
   - Start a chat
   - It will show your ID (a number like `123456789`)

3. **Add to config.js:**
```javascript
telegramBotToken: '123456:ABC-DEF...',  // Paste your bot token
telegramChatId: '123456789',            // Paste your chat ID
```

4. **Start a chat with your bot:**
   - Find your bot in Telegram
   - Click "Start"

---

## 🎉 SUCCESS! What to Expect

When a slot is found and booked:
```
🔍 Checking available slots...
✅ Found 3 available slots
🟢 Available slots found: [...]
📅 Attempting to book appointment for 2025-01-15 at 09:00...
✅ Slot reserved successfully
🎉 Appointment booked successfully!
📋 Confirmation number: ABC123456
✅ Booking completed. Stopping bot.
```

You'll also get a **Telegram message** (if you set it up)!

---

## 🆘 STILL HAVING PROBLEMS?

1. **Read the error message carefully** - it usually tells you what's wrong
2. **Check that you filled in config.js correctly** - most errors are here
3. **Make sure you're in the right folder** - run `ls` (Mac/Linux) or `dir` (Windows) and you should see `bot.js`
4. **Try the test mode first** - always test with `npm start` before `npm run bot`

---

## 📖 WANT MORE DETAILS?

- **Complete setup:** Read `SETUP_GUIDE.md`
- **Configuration options:** Read `README.md`
- **Examples:** Read `EXAMPLES.md`
- **How it works:** Read `ARCHITECTURE.md`

---

**Good luck! The bot will help you get your appointment! 🎯**
