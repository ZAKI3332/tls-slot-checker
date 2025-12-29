import BrowserBookingBot from './browser-booking-bot.js';

/**
 * Main entry point for the TLS Booking Bot
 * 
 * Now uses Puppeteer with stealth plugin to bypass Cloudflare protection
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
    console.log('🤖 TLS APPOINTMENT BOOKING BOT (Browser Mode)');
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
    console.log(`   Mode: 🌐 Browser-based (bypasses Cloudflare)`);
    console.log('='.repeat(60) + '\n');

    // Create and start the browser-based bot
    const bot = new BrowserBookingBot(config);
    
    // Handle graceful shutdown
    const cleanup = async () => {
      console.log('\n\n🧹 Shutting down gracefully...');
      await bot.cleanup();
      console.log('👋 Bot stopped. Goodbye!');
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    // Start the bot
    await bot.startBookingBot();

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Start the bot
main();
