# 🔧 Troubleshooting: API JSON Parse Error

## The Error You're Seeing

```
Erreur lors de la vérification : SyntaxError: Unexpected token '<'
```

This error means the TLS Contact API is returning **HTML** (an error page or login page) instead of **JSON data**.

---

## 🎯 Quick Fix

The TLS Contact API **requires authentication** (login) before you can check slots.

### Solution: Use the Full Bot (Not `npm start`)

**❌ DON'T USE:**
```bash
npm start  # This is index.js - simple checker WITHOUT login
```

**✅ USE THIS INSTEAD:**
```bash
npm run bot  # This is bot.js - full automation WITH auto-login
```

---

## 📋 Step-by-Step Fix

### 1. Make Sure You Have Configured Your Login

Run the setup script to configure your credentials:

**Linux/Mac:**
```bash
bash setup-user.sh
```

**Windows:**
```bash
setup-user.bat
```

Or manually edit `config.js` and make sure these are set:
```javascript
email: 'amourfaycal1@outlook.com',
password: 'Visa@1990',
formGroupId: '1651036',
```

### 2. Add Your Personal Details

Edit `config.js` and fill in:
```javascript
firstName: 'YOUR_FIRST_NAME',    // Your actual first name
lastName: 'YOUR_LAST_NAME',      // Your actual last name
phone: '+213XXXXXXXXX',          // Your actual phone
```

### 3. Run the Full Bot

```bash
npm run bot
```

You should see:
```
🔄 Initializing session...
✅ Session initialized successfully
🔐 Attempting login...
✅ Login successful
🔍 Checking available slots...
```

---

## 🔍 Why This Happens

### The Two Bot Modes

| File | Command | Features | Requires Login |
|------|---------|----------|----------------|
| `index.js` | `npm start` | Simple slot checker | ❌ No - **Causes Error** |
| `bot.js` | `npm run bot` | Full automation with login | ✅ Yes - **Works!** |

**The Problem:**
- `index.js` (npm start) tries to check slots WITHOUT logging in first
- The TLS Contact server returns a login page (HTML) instead of slot data (JSON)
- This causes the "Unexpected token '<'" error

**The Solution:**
- Use `bot.js` (npm run bot) which:
  - Initializes a session
  - Logs in with your credentials
  - THEN checks for slots
  - Books automatically when found

---

## ⚠️ Common Mistakes

### Mistake 1: Using `npm start` Instead of `npm run bot`
```bash
# ❌ WRONG - No login, will fail
npm start

# ✅ CORRECT - With login
npm run bot
```

### Mistake 2: Missing Credentials
Make sure `config.js` exists and has:
- email
- password
- formGroupId

### Mistake 3: Not Running Setup Script
If you haven't run the setup script:
```bash
bash setup-user.sh  # Linux/Mac
setup-user.bat      # Windows
```

---

## 🆘 Still Having Issues?

### Check 1: Does config.js Exist?
```bash
# Check if file exists
ls config.js

# If not, create it:
bash setup-user.sh  # or setup-user.bat on Windows
```

### Check 2: Are Credentials Correct?
Try logging in manually at:
https://visas-be.tlscontact.com

With:
- Email: amourfaycal1@outlook.com
- Password: Visa@1990

If manual login fails, the credentials are wrong.

### Check 3: Is 2FA Enabled?
The bot **doesn't support** two-factor authentication.
- Check if your account has 2FA enabled
- If yes, you need to disable it for the bot to work

---

## 📝 Summary

**Quick Fix:**
1. Run: `bash setup-user.sh` (or `.bat` on Windows)
2. Edit `config.js`: Add your name and phone
3. Run: `npm run bot` (NOT `npm start`)

**The Difference:**
- `npm start` = Simple checker, no login → **ERROR**
- `npm run bot` = Full bot with auto-login → **WORKS**

---

## 💡 Pro Tip

If you want to test without auto-booking:
1. Open `config.js`
2. Change: `autoBook: false`
3. Run: `npm run bot`
4. It will login, check slots, but NOT book
5. Change back to `autoBook: true` when ready

---

**Need more help?** Read:
- `USER_SETUP.md` - Complete setup guide
- `QUICK_START.md` - Step-by-step instructions
- `README.md` - Full documentation
