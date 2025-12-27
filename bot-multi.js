import MultiAccountBookingBot from './multi-account-bot.js';

/**
 * Multi-Account Bot Launcher
 * Run with: node bot-multi.js
 */

async function main() {
  try {
    // Load configuration
    let config, accounts;
    try {
      const configModule = await import('./config.multi.js');
      config = configModule.default;
      accounts = configModule.accounts;
      console.log('✅ Multi-account configuration loaded from config.multi.js');
    } catch (error) {
      console.error('❌ Error loading config.multi.js');
      console.error('💡 Please copy config.multi.example.js to config.multi.js and fill in your details');
      console.error('   Command: cp config.multi.example.js config.multi.js');
      process.exit(1);
    }

    // Validate configuration
    if (!accounts || accounts.length === 0) {
      console.error('❌ No accounts configured!');
      console.error('💡 Please add at least one account in config.multi.js');
      process.exit(1);
    }

    // Validate required fields for each account
    const requiredFields = ['email', 'firstName', 'lastName', 'phone'];
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const missingFields = requiredFields.filter(field => 
        !account[field] || 
        account[field] === 'YOUR_FIRST_NAME' || 
        account[field] === 'YOUR_LAST_NAME' ||
        account[field] === '+213XXXXXXXXX'
      );
      
      if (missingFields.length > 0) {
        console.error(`❌ Account ${i + 1} is missing or has invalid fields:`);
        missingFields.forEach(field => console.error(`   - ${field}`));
        console.error('\n💡 Please update config.multi.js with actual details');
        process.exit(1);
      }
    }

    // Display configuration summary
    console.log('\n' + '='.repeat(70));
    console.log('🤖 MULTI-ACCOUNT TLS APPOINTMENT BOOKING BOT');
    console.log('='.repeat(70));
    console.log('📋 Configuration Summary:');
    console.log(`   Total Accounts: ${accounts.length}`);
    console.log(`   PRIMARY Account: ${accounts[0].email}`);
    if (accounts.length > 1) {
      console.log(`   SECONDARY Accounts: ${accounts.length - 1}`);
      for (let i = 1; i < accounts.length; i++) {
        console.log(`      - Account ${i + 1}: ${accounts[i].email}`);
      }
    }
    console.log(`\n   Form Group ID: ${config.formGroupId}`);
    console.log(`   Appointment Type: ${config.appointmentType}`);
    console.log(`   Auto-book: ${config.autoBook ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`\n   ⚡ PRIMARY check interval: ${config.primaryCheckInterval || 100}ms (0.${(config.primaryCheckInterval || 100)/10}s)`);
    console.log(`   🐌 SECONDARY check interval: ${config.secondaryCheckInterval || 300000}ms (${(config.secondaryCheckInterval || 300000)/60000} min)`);
    console.log(`\n   Telegram notifications: ${config.telegramBotToken ? '✅ Enabled' : '❌ Disabled'}`);
    console.log('='.repeat(70));
    console.log('\n🚀 Strategy:');
    console.log('   1. PRIMARY account checks aggressively every 0.1 seconds');
    console.log('   2. SECONDARY accounts stay on standby (check every 5 min)');
    console.log('   3. When PRIMARY finds slots:');
    console.log('      - PRIMARY tries to book immediately');
    console.log('      - If fails, triggers ALL secondary accounts');
    console.log('      - All accounts compete in parallel');
    console.log('      - First successful booking wins!');
    console.log('='.repeat(70) + '\n');

    // Warning about aggressive checking
    if ((config.primaryCheckInterval || 100) < 50) {
      console.log('⚠️  WARNING: Primary check interval is VERY aggressive (<50ms)');
      console.log('   This may cause rate limiting. Recommended: 100-500ms\n');
    }

    // Create and start the multi-account bot
    const bot = new MultiAccountBookingBot(accounts, config);
    await bot.start();

  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Multi-account bot stopped by user. Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Multi-account bot stopped. Goodbye!');
  process.exit(0);
});

// Start the multi-account bot
main();
