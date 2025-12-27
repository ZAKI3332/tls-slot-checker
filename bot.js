import TLSBookingBot from './booking-bot.js';

/**
 * Main entry point for the TLS Booking Bot
 * 
 * This file loads configuration and starts the booking automation
 */

async function main() {
  try {
    // Load configuration
    let config;
    try {
      const configModule = await import('./config.js');
      config = configModule.default;
      console.log('✅ Configuration loaded from config.js');
    } catch (error) {
      console.error('❌ Error loading config.js');
      console.error('💡 Please copy config.example.js to config.js and fill in your details');
      console.error('   Command: cp config.example.js config.js');
      process.exit(1);
    }

    // Validate required configuration
    const requiredFields = ['formGroupId', 'firstName', 'lastName', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !config[field] || config[field] === 'YOUR_FIRST_NAME' || config[field] === 'YOUR_LAST_NAME' || config[field] === 'your.email@example.com');
    
    if (missingFields.length > 0) {
      console.error('❌ Missing or invalid required configuration fields:');
      missingFields.forEach(field => console.error(`   - ${field}`));
      console.error('\n💡 Please update config.js with your actual details');
      process.exit(1);
    }

    // Display configuration summary
    console.log('\n' + '='.repeat(60));
    console.log('🤖 TLS APPOINTMENT BOOKING BOT');
    console.log('='.repeat(60));
    console.log('📋 Configuration Summary:');
    console.log(`   Form Group ID: ${config.formGroupId}`);
    console.log(`   Appointment Type: ${config.appointmentType}`);
    console.log(`   Name: ${config.firstName} ${config.lastName}`);
    console.log(`   Email: ${config.email}`);
    console.log(`   Phone: ${config.phone}`);
    console.log(`   Auto-book: ${config.autoBook ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Check interval: ${(config.checkInterval || 60000) / 1000}s`);
    console.log(`   Notifications: ${config.telegramBotToken ? '✅ Telegram enabled' : '❌ No notifications'}`);
    console.log('='.repeat(60) + '\n');

    // Create and start the bot
    const bot = new TLSBookingBot(config);
    await bot.startBookingBot();

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Bot stopped by user. Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Bot stopped. Goodbye!');
  process.exit(0);
});

// Start the bot
main();
