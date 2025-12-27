# Quick Start Examples

This file contains practical examples for different use cases of the TLS booking bot.

## Example 1: Monitor Slots Only (No Auto-Booking)

**Use Case**: You want to know when slots are available, but you'll book manually.

**config.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Loisirs',
  
  firstName: 'Ahmed',
  lastName: 'Benali',
  email: 'ahmed.benali@email.com',
  phone: '+213555123456',
  
  autoBook: false,  // Only monitor, don't book
  checkInterval: 60000,  // Check every minute
  
  telegramBotToken: '123456:ABC-DEF...',
  telegramChatId: '123456789'
};
```

**Run:**
```bash
node bot.js
```

---

## Example 2: Full Auto-Booking with Stop After Success

**Use Case**: Let the bot book the first available slot and stop.

**config.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Loisirs',
  
  firstName: 'Fatima',
  lastName: 'Meziane',
  email: 'fatima.meziane@email.com',
  phone: '+213666234567',
  
  autoBook: true,             // Auto-book when found
  stopAfterBooking: true,     // Stop after booking
  checkInterval: 45000,       // Check every 45 seconds
  maxRetries: 3,              // Retry 3 times if booking fails
  
  telegramBotToken: '123456:ABC-DEF...',
  telegramChatId: '987654321'
};
```

**Run:**
```bash
node bot.js
```

---

## Example 3: Continuous Monitoring with Multiple Bookings

**Use Case**: Book multiple appointments for different family members.

**config.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Famille',
  
  firstName: 'Karim',
  lastName: 'Hamidi',
  email: 'karim.hamidi@email.com',
  phone: '+213777345678',
  
  autoBook: true,
  stopAfterBooking: false,    // Keep running after booking
  checkInterval: 60000,
  
  telegramBotToken: '123456:ABC-DEF...',
  telegramChatId: '111222333'
};
```

**Run:**
```bash
node bot.js
```

After first booking, manually update `firstName`, `lastName`, `email` for next family member and restart.

---

## Example 4: Using Environment Variables (Production)

**Use Case**: Keep sensitive data out of config files.

**config.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Loisirs',
  
  firstName: process.env.FIRST_NAME || 'YourFirstName',
  lastName: process.env.LAST_NAME || 'YourLastName',
  email: process.env.EMAIL || 'your.email@example.com',
  phone: process.env.PHONE || '+213XXXXXXXXX',
  password: process.env.PASSWORD || '',
  
  autoBook: true,
  stopAfterBooking: true,
  checkInterval: 60000,
  
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID
};
```

**Run:**
```bash
# Linux/Mac
export FIRST_NAME="Ahmed"
export LAST_NAME="Benali"
export EMAIL="ahmed@email.com"
export PHONE="+213555123456"
export TELEGRAM_BOT_TOKEN="123456:ABC..."
export TELEGRAM_CHAT_ID="123456789"
node bot.js

# Windows (PowerShell)
$env:FIRST_NAME="Ahmed"
$env:LAST_NAME="Benali"
$env:EMAIL="ahmed@email.com"
$env:PHONE="+213555123456"
$env:TELEGRAM_BOT_TOKEN="123456:ABC..."
$env:TELEGRAM_CHAT_ID="123456789"
node bot.js
```

---

## Example 5: Business Visa Appointment

**Use Case**: Booking for business visa with passport details.

**config.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Affaires',  // Business appointment
  
  firstName: 'Yasmine',
  lastName: 'Larbi',
  email: 'yasmine.larbi@company.com',
  phone: '+213888456789',
  
  autoBook: true,
  stopAfterBooking: true,
  checkInterval: 60000,
  
  // Additional business visa fields
  additionalFields: {
    passportNumber: 'AB1234567',
    dateOfBirth: '1985-03-15',
    nationality: 'DZ',
    companyName: 'Tech Solutions Algeria',
    businessPurpose: 'Conference attendance'
  },
  
  telegramBotToken: '123456:ABC-DEF...',
  telegramChatId: '444555666'
};
```

**Run:**
```bash
node bot.js
```

---

## Example 6: With Login (If Site Requires Authentication)

**Use Case**: Site requires login before booking.

**config.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Loisirs',
  
  firstName: 'Rachid',
  lastName: 'Brahim',
  email: 'rachid.brahim@email.com',
  phone: '+213999567890',
  password: 'YourSecurePassword123!',  // Site login password
  
  autoBook: true,
  stopAfterBooking: true,
  checkInterval: 60000,
  
  telegramBotToken: '123456:ABC-DEF...',
  telegramChatId: '777888999'
};
```

**Run:**
```bash
node bot.js
```

---

## Example 7: Running as a Service with PM2

**Use Case**: Keep bot running 24/7 in the background.

**Setup:**
```bash
# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start bot.js --name tls-booking

# Check status
pm2 status

# View real-time logs
pm2 logs tls-booking

# Stop bot
pm2 stop tls-booking

# Restart bot (after config change)
pm2 restart tls-booking

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

---

## Example 8: Testing Before Auto-Booking

**Use Case**: Test the bot behavior before enabling auto-booking.

**config.test.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Loisirs',
  
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '+213000000000',
  
  autoBook: false,  // SAFE: Only monitor
  checkInterval: 30000,  // Faster checks for testing
  
  telegramBotToken: '123456:ABC-DEF...',
  telegramChatId: '123456789'
};
```

**Create test script (test-bot.js):**
```javascript
import TLSBookingBot from './booking-bot.js';
import config from './config.test.js';

const bot = new TLSBookingBot(config);

// Test only slot checking
console.log('Testing slot checking...');
const slots = await bot.checkAvailableSlots();
console.log('Found slots:', slots);
```

**Run:**
```bash
node test-bot.js
```

---

## Example 9: Multiple Appointment Types

**Use Case**: Monitor different appointment types simultaneously.

**Create separate configs:**

**config.tourism.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Loisirs',
  firstName: 'Ahmed',
  lastName: 'Benali',
  email: 'ahmed@email.com',
  phone: '+213555123456',
  autoBook: true,
  stopAfterBooking: true,
  checkInterval: 60000,
  telegramBotToken: '123456:ABC...',
  telegramChatId: '123456789'
};
```

**config.business.js:**
```javascript
export default {
  formGroupId: '1645832',
  appointmentType: 'Affaires',
  firstName: 'Ahmed',
  lastName: 'Benali',
  email: 'ahmed@email.com',
  phone: '+213555123456',
  autoBook: true,
  stopAfterBooking: true,
  checkInterval: 60000,
  telegramBotToken: '123456:ABC...',
  telegramChatId: '123456789'
};
```

**Run in separate terminals:**
```bash
# Terminal 1
node -e "import('./bot.js').then(m => m.default)" --loader ./config.tourism.js

# Terminal 2  
node -e "import('./bot.js').then(m => m.default)" --loader ./config.business.js
```

Or use PM2:
```bash
pm2 start bot.js --name tls-tourism -- --config config.tourism.js
pm2 start bot.js --name tls-business -- --config config.business.js
```

---

## Common Commands Cheat Sheet

```bash
# Basic monitoring (no auto-booking)
npm start

# Full automation with booking
npm run bot

# Or directly
node bot.js

# Test configuration
node --check config.js

# Test syntax of all files
node --check booking-bot.js && node --check bot.js

# Check for available slots once (no monitoring)
node -e "import('./booking-bot.js').then(async ({default: Bot}) => { const bot = new Bot({formGroupId: '1645832', appointmentType: 'Loisirs'}); const slots = await bot.checkAvailableSlots(); console.log(slots); })"

# Run with PM2
pm2 start bot.js --name tls-bot

# View PM2 logs
pm2 logs tls-bot --lines 100

# Monitor PM2 process
pm2 monit
```

---

## Pro Tips

1. **Start with autoBook: false** to test configuration
2. **Use Telegram notifications** to stay updated without watching logs
3. **Set checkInterval to 60000 or higher** to avoid rate limiting
4. **Use PM2 for 24/7 operation** instead of keeping terminal open
5. **Test with a shorter checkInterval first** (30 seconds) to verify it works
6. **Keep bot running continuously** - slots appear unpredictably
7. **Have valid personal information ready** before enabling auto-booking
8. **Monitor logs for the first hour** to ensure everything works

---

## What to Expect

### When Slots Are Found:
```
🔍 Checking available slots...
✅ Found 3 available slots
🟢 Available slots found: [
  { date: '2025-01-15', time: '09:00', available: 2 },
  { date: '2025-01-15', time: '10:30', available: 1 },
  { date: '2025-01-16', time: '14:00', available: 3 }
]
```

### During Auto-Booking:
```
📅 Attempting to book appointment for 2025-01-15 at 09:00...
✅ Slot reserved: { reservationId: 'xxx123' }
🎉 Appointment booked successfully!
📋 Booking details: { confirmationNumber: 'ABC123', ... }
✅ Booking completed. Stopping bot.
```

### Telegram Notification:
```
🟢 3 slot(s) available!

[{"date":"2025-01-15","time":"09:00","available":2}...]
```

---

Happy booking! 🎉
