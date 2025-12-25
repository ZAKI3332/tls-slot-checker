# What You Need to Make the TLS Booking Bot Work

This document provides a complete checklist of everything required to successfully deploy and run the TLS Contact appointment booking bot.

## 📋 COMPLETE REQUIREMENTS CHECKLIST

### 1. System Requirements

#### Software
- [ ] **Node.js 18+** installed and working
  - Check: `node --version` (should show v18.0.0 or higher)
  - Download: https://nodejs.org/
  
- [ ] **npm** (comes with Node.js)
  - Check: `npm --version`

#### Hardware
- [ ] Computer/Server with stable internet connection
- [ ] Minimum 100MB free RAM
- [ ] Minimum 50MB free disk space

#### Operating System
- [ ] Windows 10+, macOS 10.13+, or Linux (Ubuntu 18.04+)

---

### 2. Information from TLS Contact Website

You need to gather this information from the TLS Contact website:

#### A. Appointment URL
- [ ] Your complete appointment URL
  - Example: `https://visas-be.tlscontact.com/appointment/dz/dzALG2be/1645832`
  - Where to get it: Navigate to the appointment booking page and copy the URL

#### B. Form Group ID
- [ ] Extract the Form Group ID from your URL
  - From the example above: `1645832` (the number at the end)
  - This is **REQUIRED**

#### C. Appointment Type
- [ ] Determine your appointment type (one of these):
  - `Loisirs` (Tourism/Leisure)
  - `Affaires` (Business)
  - `Famille` (Family)
  - `Etudes` (Studies)
  - Other (check the website)

#### D. Country and Center Codes
- [ ] Country code from URL
  - Example from URL: `dz` (Algeria)
  
- [ ] Center code from URL
  - Example from URL: `dzALG2be` (Algiers center for Belgium)
  
- [ ] Client country
  - Example: `be` (Belgium)

---

### 3. Personal Information Required

#### Essential Information
- [ ] **First Name** (as in passport)
- [ ] **Last Name** (as in passport)
- [ ] **Email Address** (valid and accessible)
- [ ] **Phone Number** (with country code, e.g., +213XXXXXXXXX)

#### Additional Information (May Be Required)
- [ ] **Passport Number**
- [ ] **Date of Birth** (YYYY-MM-DD format)
- [ ] **Nationality** (country code, e.g., DZ)
- [ ] **Passport Expiry Date**
- [ ] **Place of Birth**
- [ ] **Address**

**How to know what's required:**
1. Visit the booking form on TLS Contact
2. Note all mandatory fields (marked with *)
3. Prepare all this information before running the bot

---

### 4. Authentication (If Required)

Some TLS Contact sites require login:

- [ ] Check if the site requires login to book appointments
- [ ] If yes, create an account on TLS Contact website
- [ ] Note your login credentials:
  - [ ] Email/Username
  - [ ] Password

**How to check:** Try to access the booking page. If it redirects to login, authentication is required.

---

### 5. Telegram Notifications (Optional but Recommended)

To receive instant notifications:

#### A. Create Telegram Bot
- [ ] Open Telegram app
- [ ] Search for `@BotFather`
- [ ] Send `/newbot` command
- [ ] Follow instructions to create bot
- [ ] Save the **Bot Token** (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

#### B. Get Your Chat ID
- [ ] Search for `@userinfobot` on Telegram
- [ ] Start a chat
- [ ] Save your **Chat ID** (a number like: `123456789`)

#### C. Start Your Bot
- [ ] Find your bot in Telegram (search for the name you gave it)
- [ ] Click **Start** to begin a conversation

---

### 6. Bot Configuration Decisions

Before running, decide:

#### A. Booking Behavior
- [ ] **Auto-booking**: Do you want the bot to book automatically?
  - `autoBook: true` = Yes, book automatically
  - `autoBook: false` = No, just notify me

- [ ] **Stop after booking**: Should bot stop after first successful booking?
  - `stopAfterBooking: true` = Yes, stop after booking
  - `stopAfterBooking: false` = No, keep monitoring

#### B. Monitoring Settings
- [ ] **Check interval**: How often to check for slots?
  - Recommended: `60000` (60 seconds)
  - Minimum: `30000` (30 seconds) - lower may cause rate limiting
  - Maximum: `300000` (5 minutes) - might miss slots

- [ ] **Max retries**: How many times to retry failed booking?
  - Recommended: `3`
  - Range: 1-5

---

### 7. Server/Hosting Requirements (For 24/7 Operation)

If you want the bot running continuously:

#### Option 1: Personal Computer
- [ ] Computer can stay on 24/7
- [ ] Stable internet connection
- [ ] Uninterrupted power supply (or backup)

#### Option 2: Cloud Server (VPS)
- [ ] VPS provider account (DigitalOcean, Linode, AWS EC2, etc.)
- [ ] Server with Node.js installed
- [ ] SSH access to server
- [ ] Basic Linux knowledge

#### Option 3: Raspberry Pi
- [ ] Raspberry Pi 3 or newer
- [ ] SD card with Raspberry Pi OS
- [ ] Internet connection (ethernet recommended)
- [ ] Power supply

---

## 🚀 SETUP STEPS SUMMARY

Once you have all the above, follow these steps:

### Step 1: Install Software
```bash
# Verify Node.js
node --version

# If not installed, download from nodejs.org
```

### Step 2: Clone Repository
```bash
git clone https://github.com/ZAKI3332/tls-slot-checker.git
cd tls-slot-checker
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Create Configuration
```bash
# Copy example config
cp config.example.js config.js

# Edit with your favorite text editor
nano config.js
# or
code config.js
# or
notepad config.js
```

### Step 5: Fill in Configuration
Edit `config.js` with ALL the information you gathered:
- Form Group ID
- Appointment type
- Personal information
- Bot behavior settings
- Telegram credentials (if using)

### Step 6: Test Configuration
```bash
# Test that config is valid
node --check config.js

# Test monitoring (no auto-booking)
npm start
# Let it run for a minute, then press Ctrl+C
```

### Step 7: Run the Bot
```bash
# For manual monitoring only
npm start

# For full automation with booking
npm run bot
```

### Step 8: Set Up 24/7 Operation (Optional)
```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start bot.js --name tls-booking-bot

# Save PM2 configuration
pm2 save

# Set to start on boot
pm2 startup
```

---

## 🔍 VERIFICATION CHECKLIST

Before enabling auto-booking, verify:

### Configuration Verification
- [ ] config.js exists and is filled out correctly
- [ ] No placeholder values remain (like "YOUR_FIRST_NAME")
- [ ] formGroupId matches your appointment URL
- [ ] Email and phone are your actual contact details
- [ ] All required personal information is provided

### Bot Testing
- [ ] Bot starts without errors
- [ ] Bot successfully checks for slots
- [ ] Telegram notifications work (if configured)
- [ ] No rate limiting errors (429) appear

### Safety Checks
- [ ] Understand that auto-booking will book real appointments
- [ ] Personal information is accurate (wrong info = invalid booking)
- [ ] Telegram bot is working for notifications
- [ ] You're ready to attend the appointment if booked

---

## 📊 WHAT THE BOT NEEDS FROM THE SERVER

The bot interacts with these TLS Contact server endpoints:

### 1. Appointment Page
- **URL**: `https://visas-be.tlscontact.com/appointment/dz/dzALG2be/{formGroupId}`
- **Purpose**: Initialize session and cookies
- **What bot needs**: Session cookies returned by server

### 2. Slot Availability API
- **URL**: `/services/customerservice/api/tls/appointment/dz/dzALG2be/table`
- **Purpose**: Check available appointment slots
- **What bot needs**: JSON response with dates, times, and availability counts
- **Example response**:
```json
{
  "2025-01-15": {
    "09:00": 2,
    "10:30": 1
  }
}
```

### 3. Slot Reservation API (When Booking)
- **URL**: `/services/customerservice/api/tls/appointment/reserve`
- **Purpose**: Reserve a specific slot before booking
- **What bot sends**: Date, time, form group ID
- **What bot needs**: Reservation ID from server

### 4. Booking API (When Auto-Booking Enabled)
- **URL**: `/services/customerservice/api/tls/appointment/book`
- **Purpose**: Complete the appointment booking
- **What bot sends**: All personal information + reserved slot details
- **What bot needs**: Confirmation number and booking details

### 5. Authentication API (If Login Required)
- **URL**: `/services/customerservice/api/login`
- **Purpose**: Authenticate user before booking
- **What bot sends**: Email and password
- **What bot needs**: Authentication token or session cookie

---

## 🛡️ IMPORTANT NOTES

### About Auto-Booking
- **Auto-booking books REAL appointments** - make sure all information is correct
- Bookings are binding - you must attend or properly cancel
- Wrong information may invalidate your appointment

### About Rate Limiting
- TLS Contact servers may rate-limit excessive requests
- **Minimum recommended interval**: 30 seconds
- **Recommended interval**: 60 seconds
- If rate-limited, increase interval and wait before retrying

### About Slot Competition
- Multiple people compete for the same slots
- Bot tries to book the first available slot found
- Even with a bot, you may not always get a slot (human competition)
- The bot retries automatically if booking fails

### About Data Privacy
- config.js contains sensitive information - never share it
- The repository .gitignore prevents committing config.js
- Use environment variables for production deployments
- Telegram bot tokens should be kept secret

---

## ✅ READY TO START?

If you have all the items in the requirements checklist, you're ready to:

1. **Set up the bot** (5 minutes)
2. **Configure with your details** (10 minutes)
3. **Test monitoring mode** (5 minutes)
4. **Enable auto-booking** (if desired)
5. **Let it run** (continuously until slot is booked)

---

## 🆘 NEED HELP?

If you're missing something or unclear:

1. Read the **SETUP_GUIDE.md** for detailed step-by-step instructions
2. Check **EXAMPLES.md** for practical configuration examples
3. Review **API_DOCUMENTATION.md** to understand how it works
4. Open a GitHub issue if you have questions

Good luck with your appointment booking! 🎉
