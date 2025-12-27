# 🚀 Multi-Account Bot Guide

## Overview

The multi-account bot allows you to use **multiple TLS Contact accounts simultaneously** for parallel booking attempts, dramatically increasing your chances of securing an appointment.

### 🎯 Strategy

- **PRIMARY Account**: Checks slots aggressively every **0.1 seconds** (100ms)
- **SECONDARY Accounts**: Stay on standby, check every **5 minutes**
- **When slots are found**: All accounts compete in parallel to book
- **First to succeed wins**: Bot stops immediately after first successful booking

---

## 🆚 Single vs Multi-Account

| Feature | Single Account Bot | Multi-Account Bot |
|---------|-------------------|-------------------|
| Check Speed | 60 seconds | 0.1 seconds (600x faster!) |
| Accounts | 1 | Unlimited (recommend 2-3) |
| Booking Strategy | Sequential | Parallel competition |
| Success Rate | Lower | Much higher |
| Command | `npm run bot` | `npm run multi` |

---

## ⚡ Quick Start

### Step 1: Copy Configuration
```bash
cp config.multi.example.js config.multi.js
```

### Step 2: Edit Configuration

Open `config.multi.js` and configure:

```javascript
// Main settings
export default {
  formGroupId: '1651036',
  appointmentType: 'Loisirs',
  autoBook: true,
  primaryCheckInterval: 100,      // 0.1 seconds
  secondaryCheckInterval: 300000  // 5 minutes
};

// Accounts (First = PRIMARY, Others = SECONDARY)
export const accounts = [
  // PRIMARY - Aggressive checking
  {
    email: 'account1@example.com',
    password: 'Password1',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+213555123456'
  },
  
  // SECONDARY - Triggered when PRIMARY finds slots
  {
    email: 'account2@example.com',
    password: 'Password2',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+213666234567'
  }
];
```

### Step 3: Run the Bot

```bash
npm run multi
```

---

## 📋 Configuration Explained

### Check Intervals

```javascript
primaryCheckInterval: 100     // 0.1 seconds - VERY FAST!
secondaryCheckInterval: 300000 // 5 minutes - STANDBY MODE
```

**Why different speeds?**
- PRIMARY needs to catch slots the moment they appear
- SECONDARY accounts are backup, don't need constant checking
- This prevents rate limiting while maintaining speed

### Account Array

```javascript
export const accounts = [
  { /* Account 1 - PRIMARY */ },
  { /* Account 2 - SECONDARY */ },
  { /* Account 3 - SECONDARY */ }
];
```

**Important:**
- First account in array = PRIMARY (aggressive)
- All other accounts = SECONDARY (standby)
- Recommend 2-3 total accounts
- All must have valid TLS Contact credentials

---

## 🔥 How It Works

### Phase 1: Monitoring
```
PRIMARY:   Checks every 0.1s → [Check] → [Check] → [Check]...
SECONDARY: Checks every 5min → [Check]...........[Check]
SECONDARY: Checks every 5min → [Check]...........[Check]
```

### Phase 2: Slots Found!
```
PRIMARY:   [SLOTS FOUND!] → Tries to book immediately
           ↓ (if fails)
           └─→ TRIGGERS ALL SECONDARY ACCOUNTS
```

### Phase 3: Parallel Booking
```
PRIMARY:   [Booking attempt 1] ────┐
SECONDARY: [Booking attempt 2] ────┤ → RACE!
SECONDARY: [Booking attempt 3] ────┘
           ↓
        FIRST SUCCESS WINS!
```

### Phase 4: Success
```
✅ One account books successfully
🛑 All other accounts stop immediately
📱 Notification sent
```

---

## ⚙️ Advanced Configuration

### Adjust Check Speed

**More aggressive (faster, higher rate limit risk):**
```javascript
primaryCheckInterval: 50  // 0.05 seconds - EXTREME!
```

**More conservative (slower, safer):**
```javascript
primaryCheckInterval: 500  // 0.5 seconds - Still fast
```

**Recommended:** 100-200ms for optimal balance

### Multiple Secondary Accounts

Add as many as you want:
```javascript
export const accounts = [
  { /* PRIMARY */ },
  { /* SECONDARY 1 */ },
  { /* SECONDARY 2 */ },
  { /* SECONDARY 3 */ },
  // ... more accounts
];
```

### Disable Auto-Booking (Monitor Only)

```javascript
autoBook: false  // Will only notify, not book
```

---

## 🎯 Best Practices

### 1. Use 2-3 Accounts Total
- 1 PRIMARY + 1-2 SECONDARY is optimal
- More accounts = more complexity, not necessarily better

### 2. Valid Credentials
- All accounts must have valid TLS Contact logins
- Test each account manually first
- Don't use fake accounts

### 3. Check Interval
- **PRIMARY**: 100-200ms is sweet spot
- **SECONDARY**: 5 minutes is fine (they're backup)
- Don't go below 50ms (rate limiting risk)

### 4. Network Stability
- Stable internet connection required
- Consider running on VPS for 24/7 operation
- Use PM2 for auto-restart

---

## 📊 Expected Output

### Startup
```
🤖 MULTI-ACCOUNT TLS APPOINTMENT BOOKING BOT
======================================================================
📋 Configuration Summary:
   Total Accounts: 2
   PRIMARY Account: account1@example.com
   SECONDARY Accounts: 1
      - Account 2: account2@example.com

   Form Group ID: 1651036
   Appointment Type: Loisirs
   Auto-book: ✅ Enabled

   ⚡ PRIMARY check interval: 100ms (0.1s)
   🐌 SECONDARY check interval: 300000ms (5 min)

   Telegram notifications: ✅ Enabled
======================================================================

🚀 Strategy:
   1. PRIMARY account checks aggressively every 0.1 seconds
   2. SECONDARY accounts stay on standby (check every 5 min)
   3. When PRIMARY finds slots:
      - PRIMARY tries to book immediately
      - If fails, triggers ALL secondary accounts
      - All accounts compete in parallel
      - First successful booking wins!
======================================================================

🔄 [PRIMARY] Initializing session...
✅ [PRIMARY] Session initialized
🔐 [PRIMARY] Attempting login...
✅ [PRIMARY] Login successful

🔄 [SECONDARY-1] Initializing session...
✅ [SECONDARY-1] Session initialized
🔐 [SECONDARY-1] Attempting login...
✅ [SECONDARY-1] Login successful
```

### When Slots Found
```
🟢 [PRIMARY] Found 3 available slots!
📅 [PRIMARY] Attempting to book: 2025-01-15 at 09:00
✅ [PRIMARY] Slot reserved successfully
🎉 [PRIMARY] Appointment booked successfully!
📋 [PRIMARY] Confirmation: ABC123456

✅ Booking successful via PRIMARY!
✅ Booking completed successfully! Stopping all accounts.
```

### If PRIMARY Fails
```
🟢 [PRIMARY] Found 2 available slots!
📅 [PRIMARY] Attempting to book: 2025-01-15 at 09:00
❌ [PRIMARY] Booking failed: 409

🚀 Triggering all secondary accounts for parallel booking!

📅 [SECONDARY-1] Attempting to book: 2025-01-15 at 09:00
✅ [SECONDARY-1] Slot reserved successfully
🎉 [SECONDARY-1] Appointment booked successfully!
📋 [SECONDARY-1] Confirmation: XYZ789

✅ Booking successful via SECONDARY-1!
✅ Booking completed successfully! Stopping all accounts.
```

---

## 🆘 Troubleshooting

### ❌ "No accounts configured"
**Fix:** Make sure `config.multi.js` exists and has accounts array

### ❌ "Account X is missing fields"
**Fix:** Fill in all required fields (email, firstName, lastName, phone)

### ❌ Login fails for an account
**Fix:** 
- Test credentials manually on TLS website
- Make sure password is correct
- Check if 2FA is enabled (not supported)

### ⚠️ Rate limiting (429 errors)
**Fix:** Increase `primaryCheckInterval` from 100ms to 200-500ms

### 🐌 Too slow to catch slots
**Fix:** Decrease `primaryCheckInterval` from 100ms to 50ms (risky)

---

## 🔄 Switching Between Modes

### Single Account Mode
```bash
npm run bot  # Uses config.js, one account
```

### Multi-Account Mode
```bash
npm run multi  # Uses config.multi.js, multiple accounts
```

Both can run simultaneously on different machines!

---

## 💡 Pro Tips

1. **Test First**: Start with `autoBook: false` to test monitoring
2. **Stagger Checks**: Don't run multiple bots on same network
3. **Use VPS**: Deploy to cloud for 24/7 operation
4. **Monitor Logs**: Watch for patterns in slot availability
5. **Backup Strategy**: Keep single-account bot ready as fallback

---

## 🎉 Success Stories

With multi-account mode:
- **600x faster** checking (0.1s vs 60s)
- **Parallel booking** = higher success rate
- **Redundancy** = if one fails, others try
- **Smart triggering** = efficient resource usage

---

## 📞 Need Help?

- Check `TROUBLESHOOTING.md` for common issues
- Review `README.md` for basic setup
- Check `QUICK_START.md` for step-by-step guide

---

**Good luck with your appointment booking! 🎯**
