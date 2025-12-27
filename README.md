# TLS Contact Appointment Booking Bot 🤖

Automated bot for booking appointments on TLS Contact website (https://visas-be.tlscontact.com). This bot monitors available appointment slots and can automatically book appointments when they become available.

## ✨ Features

- **🔍 Automatic Slot Detection**: Continuously monitors the TLS Contact website for available appointment slots
- **📅 Automatic Booking**: Books appointments automatically when slots are found
- **🔐 Session Management**: Handles cookies and session management for stable API communication
- **🔄 Retry Logic**: Implements smart retry mechanisms for booking attempts
- **📱 Telegram Notifications**: Sends real-time notifications via Telegram when slots are found or bookings succeed
- **⚙️ Configurable**: Highly customizable with preferences for dates, times, and booking behavior
- **🛡️ Error Handling**: Robust error handling with detailed logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A TLS Contact appointment URL (e.g., https://visas-be.tlscontact.com/appointment/dz/dzALG2be/1645832)
- Your personal information (name, email, phone number, passport details)
- (Optional) Telegram bot token for notifications

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ZAKI3332/tls-slot-checker.git
cd tls-slot-checker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure the bot**
```bash
cp config.example.js config.js
```

Edit `config.js` with your details:
```javascript
export default {
  formGroupId: '1645832', // From your appointment URL
  appointmentType: 'Loisirs',
  
  // Your personal information
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+213XXXXXXXXX',
  
  // Bot behavior
  autoBook: true,              // Auto-book when slots found
  stopAfterBooking: true,      // Stop after successful booking
  checkInterval: 60000,        // Check every 60 seconds
  
  // Optional: Telegram notifications
  telegramBotToken: 'YOUR_BOT_TOKEN',
  telegramChatId: 'YOUR_CHAT_ID'
};
```

4. **Run the bot**
```bash
npm start
```

Or run the full automation:
```bash
node bot.js
```

## 📖 Usage

### Basic Slot Checking (Monitor Only)

To only monitor slots without booking:

```javascript
// In config.js
export default {
  // ... other config
  autoBook: false,  // Disable automatic booking
};
```

```bash
node index.js
```

### Automatic Booking

To enable automatic booking when slots are found:

```javascript
// In config.js
export default {
  // ... other config
  autoBook: true,
  stopAfterBooking: true,
};
```

```bash
node bot.js
```

### Using as a Module

```javascript
import TLSBookingBot from './booking-bot.js';

const config = {
  formGroupId: '1645832',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+213XXXXXXXXX',
  autoBook: true
};

const bot = new TLSBookingBot(config);
await bot.startBookingBot();
```

## ⚙️ Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `formGroupId` | string | ✅ | Form group ID from appointment URL |
| `appointmentType` | string | ✅ | Type of appointment (e.g., 'Loisirs', 'Affaires') |
| `firstName` | string | ✅ | Your first name |
| `lastName` | string | ✅ | Your last name |
| `email` | string | ✅ | Your email address |
| `phone` | string | ✅ | Your phone number |
| `password` | string | ❌ | Password if login is required |
| `autoBook` | boolean | ❌ | Enable automatic booking (default: false) |
| `stopAfterBooking` | boolean | ❌ | Stop bot after booking (default: true) |
| `checkInterval` | number | ❌ | Check interval in ms (default: 60000) |
| `maxRetries` | number | ❌ | Max booking retry attempts (default: 3) |
| `telegramBotToken` | string | ❌ | Telegram bot token for notifications |
| `telegramChatId` | string | ❌ | Telegram chat ID for notifications |
| `additionalFields` | object | ❌ | Extra fields required by the form |

## 🔔 Setting Up Telegram Notifications

1. **Create a Telegram Bot**
   - Open Telegram and search for [@BotFather](https://t.me/botfather)
   - Send `/newbot` and follow instructions
   - Copy the bot token

2. **Get Your Chat ID**
   - Search for [@userinfobot](https://t.me/userinfobot) on Telegram
   - Start a chat to get your chat ID

3. **Configure**
   ```javascript
   export default {
     // ... other config
     telegramBotToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
     telegramChatId: '123456789'
   };
   ```

Or use environment variables:
```bash
export TELEGRAM_BOT_TOKEN="your_token_here"
export TELEGRAM_CHAT_ID="your_chat_id_here"
node bot.js
```

## 🔧 How It Works

The bot operates in the following steps:

1. **Session Initialization**: Creates a session with the TLS Contact website
2. **Authentication** (if required): Logs in with provided credentials
3. **Slot Monitoring**: Regularly checks for available appointment slots
4. **Notification**: Sends alerts when slots are found
5. **Booking**: Automatically books the appointment with your details
6. **Confirmation**: Confirms successful booking and stops (if configured)

### API Endpoints Used

The bot interacts with these TLS Contact API endpoints:

- **Slot Availability**: `/services/customerservice/api/tls/appointment/dz/dzALG2be/table`
- **Slot Reservation**: `/services/customerservice/api/tls/appointment/reserve`
- **Appointment Booking**: `/services/customerservice/api/tls/appointment/book`
- **Authentication** (if needed): `/services/customerservice/api/login`

## 📁 Project Structure

```
tls-slot-checker/
├── bot.js                 # Main entry point with configuration loading
├── booking-bot.js         # Core booking automation logic
├── cookie-jar.js          # Cookie management for session handling
├── index.js               # Simple slot checker (monitor only)
├── config.example.js      # Configuration template
├── config.js              # Your actual configuration (gitignored)
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## 🛠️ Development

### Running in Development Mode

```bash
node --watch bot.js
```

### Testing Individual Components

```javascript
import TLSBookingBot from './booking-bot.js';

const bot = new TLSBookingBot(config);

// Test slot checking only
const slots = await bot.checkAvailableSlots();
console.log('Available slots:', slots);

// Test session initialization
await bot.initializeSession();
```

## 🔒 Security Notes

- **Never commit `config.js`** with real credentials (it's in `.gitignore`)
- Use environment variables for sensitive data in production
- The bot stores session cookies temporarily in memory only
- Review API requests if you're concerned about data being sent

## 🐛 Troubleshooting

### Bot not finding slots
- Check that your `formGroupId` is correct
- Verify the appointment URL is accessible
- Ensure your internet connection is stable

### Booking fails
- Verify all required personal information is correct
- Check if additional fields are required (passport number, etc.)
- Ensure the slot is still available (high competition)

### Telegram notifications not working
- Verify bot token and chat ID are correct
- Ensure you've started a chat with your bot
- Check internet connectivity

## 📝 Example Logs

```
🤖 Starting TLS Appointment Booking Bot...
⚙️  Configuration: {
  formGroupId: '1645832',
  appointmentType: 'Loisirs',
  checkInterval: 60000,
  autoBook: true
}
🔄 Initializing session...
✅ Session initialized successfully
🔍 Checking available slots...
✅ Found 3 available slots
🟢 Available slots found: [
  { date: '2025-01-15', time: '09:00', available: 2 },
  { date: '2025-01-15', time: '10:30', available: 1 },
  { date: '2025-01-16', time: '14:00', available: 3 }
]
📅 Attempting to book appointment for 2025-01-15 at 09:00...
✅ Slot reserved: { reservationId: 'xxx123' }
🎉 Appointment booked successfully!
📋 Booking details: { confirmationNumber: 'ABC123', ... }
✅ Booking completed. Stopping bot.
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This bot is for educational and personal use only. Use responsibly and in accordance with TLS Contact's terms of service. The authors are not responsible for any misuse or consequences of using this software.

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙋‍♂️ Support

If you encounter issues or have questions:
1. Check the troubleshooting section
2. Review your configuration
3. Open an issue on GitHub

---

Made with ❤️ for easier appointment booking