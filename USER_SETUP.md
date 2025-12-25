# 🎯 Quick Setup for Auto-Login Bot

Your bot can be **pre-configured** with auto-login! Follow these simple steps:

---

## ✅ Your Credentials

- **Email:** amourfaycal1@outlook.com
- **Password:** Visa@1990
- **URL:** https://visas-be.tlscontact.com/appointment/dz/dzALG2be/1651036
- **Form Group ID:** 1651036

---

## 🚀 3 Simple Steps to Run

### Step 1: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 2: Auto-Setup Configuration (RECOMMENDED)

This will create `config.js` with your credentials automatically!

**On Linux/Mac:**
```bash
bash setup-user.sh
```

**On Windows:**
```bash
setup-user.bat
```

**Or Manual Setup:**
```bash
# Copy example config
cp config.example.js config.js

# Edit config.js and change these lines:
# Line 16: formGroupId: '1651036'
# Line 41: email: 'amourfaycal1@outlook.com'
# Line 60: password: 'Visa@1990'
```

### Step 3: Add Your Personal Details

Open `config.js` and fill in **ONLY** these 3 fields:
```javascript
firstName: 'YOUR_FIRST_NAME',    // ⚠️ Change to your first name (line 39)
lastName: 'YOUR_LAST_NAME',      // ⚠️ Change to your last name (line 40)
phone: '+213XXXXXXXXX',          // ⚠️ Change to your phone number (line 42)
```

**Save the file!**

---

## ▶️ Run the Bot

```bash
npm run bot
```

You should see:
```
🤖 Starting TLS Appointment Booking Bot...
============================================================
📋 Configuration Summary:
   Form Group ID: 1651036
   Appointment Type: Loisirs
   Name: [Your Name]
   Email: amourfaycal1@outlook.com
   Auto-book: ✅ Enabled
============================================================

🔄 Initializing session...
✅ Session initialized successfully
🔐 Attempting login...
✅ Login successful
🔍 Checking available slots...
```

---

## 🎉 What the Bot Will Do

1. **Auto-login** with your credentials (amourfaycal1@outlook.com)
2. **Monitor** slots every 60 seconds
3. **Automatically book** when slots are found
4. **Stop** after successful booking
5. **Show** confirmation number

---

## ⚠️ Important Notes

### First Time Running? Test Login First!
1. Open `config.js`
2. Change `autoBook: true` to `autoBook: false`
3. Run `npm run bot`
4. **Check if login works** (you should see "✅ Login successful")
5. If login works, change back to `autoBook: true`
6. Run `npm run bot` again for full automation

### Keep Your Credentials Safe
- ✅ `config.js` is automatically gitignored (safe)
- ✅ Never share your config file
- ✅ Never commit it to GitHub

---

## 📊 Expected Output

### When Login Succeeds:
```
🔐 Attempting login...
✅ Login successful
```

### When Slots Are Found:
```
🔍 Checking available slots...
✅ Found 3 available slots
🟢 Available slots found
📅 Attempting to book appointment for 2025-01-15 at 09:00...
✅ Slot reserved successfully
🎉 Appointment booked successfully!
📋 Confirmation number: ABC123456
✅ Booking completed. Stopping bot.
```

### If No Slots Available (Normal):
```
[2025-12-25T14:21:00.000Z] ⚪ No slots available yet...
```
*This is normal! The bot will keep checking automatically.*

---

## 🆘 Troubleshooting

### ❌ "Login failed: 401"
**Solution:**
- Try logging in manually on https://visas-be.tlscontact.com with:
  - Email: amourfaycal1@outlook.com
  - Password: Visa@1990
- If manual login works but bot fails, the login API might have changed
- Check if 2FA (two-factor authentication) is enabled (bot doesn't support 2FA)

### ❌ "Missing required configuration fields"
**Solution:**
- Make sure you filled in `firstName`, `lastName`, and `phone` in `config.js`
- Don't leave them as `YOUR_FIRST_NAME`, etc.

### ❌ "Cannot find module './config.js'"
**Solution:**
- Run the setup script: `bash setup-user.sh` or `setup-user.bat`
- Or manually: `cp config.example.js config.js`

### ❌ Setup script doesn't work
**Solution (Manual):**
1. Copy: `cp config.example.js config.js`
2. Open `config.js` in a text editor
3. Find and change:
   - `formGroupId: '1645832'` → `formGroupId: '1651036'`
   - `email: 'your.email@example.com'` → `email: 'amourfaycal1@outlook.com'`
   - `password: ''` → `password: 'Visa@1990'`
   - `firstName: 'YOUR_FIRST_NAME'` → Your actual first name
   - `lastName: 'YOUR_LAST_NAME'` → Your actual last name
   - `phone: '+213XXXXXXXXX'` → Your actual phone

---

## 💡 Tips

1. **Let it run continuously** - Slots can appear at any time
2. **Test login first** with `autoBook: false` before enabling auto-booking
3. **Use PM2 for 24/7 operation:**
   ```bash
   npm install -g pm2
   pm2 start bot.js --name tls-bot
   pm2 logs tls-bot
   ```
4. **Check logs regularly** to see what the bot is doing

---

## 📞 Need Help?

If you have issues:
1. Check the error message carefully
2. Make sure all 3 personal fields are filled in `config.js`
3. Test your credentials manually on the website
4. Run in test mode first (`autoBook: false`)
5. Check the detailed guides: `README.md`, `QUICK_START.md`

---

## 🔍 Quick Checklist Before Running

- [ ] Node.js installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Config created (run setup script or manual copy)
- [ ] Email and password set in config.js
- [ ] formGroupId set to 1651036
- [ ] firstName, lastName, phone filled in
- [ ] Tested login with `autoBook: false`

---

**🎯 Your bot is ready! Just run the setup script, fill in your name and phone, then start it!**
