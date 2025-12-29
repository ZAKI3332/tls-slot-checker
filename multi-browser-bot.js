import BrowserBookingBot from './browser-booking-bot.js';

/**
 * Multi-Account Browser-Based Booking Bot
 * Manages multiple browser instances for parallel booking
 */
class MultiBrowserBookingBot {
  constructor(accounts, config) {
    this.accounts = accounts;
    this.config = config;
    this.bots = [];
    this.slotsFound = false;
    this.bookingSuccess = false;
  }

  /**
   * Initialize all browser instances
   */
  async initializeAllBots() {
    console.log(`🚀 Initializing ${this.accounts.length} browser instances...`);
    
    for (let i = 0; i < this.accounts.length; i++) {
      const account = this.accounts[i];
      const isPrimary = i === 0;
      const label = isPrimary ? 'PRIMARY' : `SECONDARY-${i}`;
      
      console.log(`\n🌐 [${label}] Setting up browser for ${account.email}...`);
      
      // Create bot instance with account config
      const botConfig = {
        ...this.config,
        ...account,
        checkInterval: isPrimary ? 
          (this.config.primaryCheckInterval || 100) : // 0.1 seconds for primary
          (this.config.secondaryCheckInterval || 300000) // 5 minutes for secondary
      };
      
      const bot = new BrowserBookingBot(botConfig);
      bot.label = label;
      bot.isPrimary = isPrimary;
      bot.accountEmail = account.email;
      
      // Initialize browser
      const initialized = await bot.initBrowser();
      if (initialized) {
        await bot.navigateToAppointmentPage();
        await bot.login();
        this.bots.push(bot);
        console.log(`✅ [${label}] Browser ready`);
      } else {
        console.error(`❌ [${label}] Failed to initialize browser`);
      }
    }
    
    console.log(`\n✅ ${this.bots.length}/${this.accounts.length} browsers initialized successfully\n`);
  }

  /**
   * Start multi-account booking bot
   */
  async startMultiAccountBot() {
    console.log('🤖 Starting Multi-Account Browser-Based Booking Bot...');
    console.log('⚙️  Configuration:', {
      totalAccounts: this.accounts.length,
      primaryCheckInterval: `${(this.config.primaryCheckInterval || 100) / 1000}s`,
      secondaryCheckInterval: `${(this.config.secondaryCheckInterval || 300000) / 1000}s`,
      autoBook: this.config.autoBook
    });

    // Initialize all bots
    await this.initializeAllBots();

    if (this.bots.length === 0) {
      console.error('❌ No bots initialized successfully. Exiting.');
      return;
    }

    // Start primary bot with aggressive checking
    const primaryBot = this.bots.find(b => b.isPrimary);
    if (primaryBot) {
      this.startPrimaryMonitoring(primaryBot);
    }

    // Start secondary bots with slower checking
    const secondaryBots = this.bots.filter(b => !b.isPrimary);
    secondaryBots.forEach(bot => {
      this.startSecondaryMonitoring(bot);
    });
  }

  /**
   * Primary bot monitoring (aggressive - 0.1s intervals)
   */
  async startPrimaryMonitoring(bot) {
    console.log(`\n🔴 [${bot.label}] Starting aggressive monitoring (${bot.config.checkInterval}ms intervals)...`);
    
    const check = async () => {
      if (this.bookingSuccess) return;
      
      try {
        const slots = await bot.checkAvailableSlots();
        
        if (slots.length > 0 && !this.slotsFound) {
          this.slotsFound = true;
          console.log(`\n🟢 [${bot.label}] SLOTS FOUND! Triggering all accounts...`);
          console.log('   Available slots:', slots);
          
          // Trigger all secondary bots immediately
          this.triggerAllBots(slots);
        }
      } catch (error) {
        console.error(`❌ [${bot.label}] Error checking slots:`, error.message);
      }
    };

    // Initial check
    await check();
    
    // Set up aggressive interval
    setInterval(check, bot.config.checkInterval);
  }

  /**
   * Secondary bot monitoring (standby mode - 5 minute intervals)
   */
  async startSecondaryMonitoring(bot) {
    console.log(`🟡 [${bot.label}] Starting standby monitoring (${bot.config.checkInterval / 1000}s intervals)...`);
    
    const check = async () => {
      if (this.bookingSuccess) return;
      
      // Only check if primary hasn't found slots yet
      if (!this.slotsFound) {
        try {
          const slots = await bot.checkAvailableSlots();
          
          if (slots.length > 0) {
            console.log(`🟢 [${bot.label}] Found slots in standby mode`);
            this.triggerAllBots(slots);
          }
        } catch (error) {
          console.error(`❌ [${bot.label}] Error in standby check:`, error.message);
        }
      }
    };

    // Set up interval for periodic checks
    setInterval(check, bot.config.checkInterval);
  }

  /**
   * Trigger all bots to attempt booking in parallel
   */
  async triggerAllBots(slots) {
    if (this.bookingSuccess) return;
    
    console.log(`\n⚡ PARALLEL BOOKING INITIATED - All ${this.bots.length} accounts competing...`);
    
    // Sort slots by preference
    slots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
    
    const targetSlot = slots[0];
    console.log(`🎯 Target slot: ${targetSlot.date} at ${targetSlot.time}\n`);

    // Start all bots attempting to book simultaneously
    const bookingPromises = this.bots.map(async (bot) => {
      if (this.bookingSuccess) return null;
      
      try {
        console.log(`📱 [${bot.label}] Attempting booking...`);
        const result = await bot.bookAppointment(targetSlot);
        
        if (result.success && !this.bookingSuccess) {
          this.bookingSuccess = true;
          console.log(`\n🎉🎉🎉 [${bot.label}] WON THE RACE! Booking successful! 🎉🎉🎉`);
          console.log(`    Account: ${bot.accountEmail}`);
          if (result.confirmationNumber) {
            console.log(`    Confirmation: ${result.confirmationNumber}`);
          }
          
          // Send success notification
          await this.sendSuccessNotification(bot, result);
          
          // Stop all other bots
          this.stopAllBots();
          
          return result;
        } else if (result.success) {
          console.log(`⏭️  [${bot.label}] Booking succeeded but another account already won`);
        } else {
          console.log(`❌ [${bot.label}] Booking failed: ${result.error}`);
        }
        
        return result;
      } catch (error) {
        console.error(`❌ [${bot.label}] Error during booking:`, error.message);
        return null;
      }
    });

    // Wait for first successful booking or all to complete
    await Promise.race([
      ...bookingPromises,
      new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.bookingSuccess) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      })
    ]);

    // Check results after race
    if (!this.bookingSuccess) {
      console.log('\n⚠️  All booking attempts failed. Continuing to monitor...');
      this.slotsFound = false; // Reset to continue monitoring
    }
  }

  /**
   * Send success notification
   */
  async sendSuccessNotification(winningBot, result) {
    if (!this.config.telegramBotToken || !this.config.telegramChatId) {
      return;
    }

    try {
      const message = `
🎉 BOOKING SUCCESSFUL! 🎉

Winner: ${winningBot.label}
Account: ${winningBot.accountEmail}
${result.confirmationNumber ? `Confirmation: ${result.confirmationNumber}` : ''}

All ${this.bots.length} accounts participated in the race.
      `.trim();

      const url = `https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.config.telegramChatId,
          text: message
        })
      });
    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
    }
  }

  /**
   * Stop all bots and cleanup
   */
  async stopAllBots() {
    console.log('\n🛑 Stopping all browsers...');
    
    for (const bot of this.bots) {
      try {
        await bot.cleanup();
      } catch (error) {
        console.error(`❌ Error cleaning up [${bot.label}]:`, error.message);
      }
    }
    
    console.log('✅ All browsers stopped');
    
    if (this.config.stopAfterBooking) {
      setTimeout(() => process.exit(0), 2000);
    }
  }
}

export default MultiBrowserBookingBot;
