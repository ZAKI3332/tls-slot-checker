import fetch from 'node-fetch';
import { CookieJar } from './cookie-jar.js';

/**
 * Multi-Account TLS Booking Bot
 * Supports parallel booking with primary (aggressive) and secondary (standby) accounts
 */
class MultiAccountBookingBot {
  constructor(accounts, config) {
    this.accounts = accounts; // Array of account configurations
    this.config = config;
    this.baseUrl = 'https://visas-be.tlscontact.com';
    this.bots = [];
    this.slotsFound = false;
    this.bookingSuccess = false;
    
    // Initialize a bot instance for each account
    this.accounts.forEach((account, index) => {
      this.bots.push({
        index,
        isPrimary: index === 0,
        account,
        cookieJar: new CookieJar(),
        sessionInitialized: false,
        loggedIn: false,
        lastCheckTime: 0,
        checkInterval: index === 0 ? 
          (config.primaryCheckInterval || 100) : // 0.1 seconds default for primary
          (config.secondaryCheckInterval || 300000) // 5 minutes for secondary
      });
    });
  }

  /**
   * Get headers with cookies for a specific bot
   */
  getHeaders(bot) {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/json',
      'Origin': this.baseUrl,
      'Referer': `${this.baseUrl}/appointment/dz/dzALG2be/${this.config.formGroupId}`
    };
    
    const cookieString = bot.cookieJar.getCookieString();
    if (cookieString) {
      headers['Cookie'] = cookieString;
    }
    return headers;
  }

  /**
   * Make API request with cookie handling
   */
  async makeRequest(bot, url, options = {}) {
    const headers = this.getHeaders(bot);
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    // Store cookies from response
    const setCookie = response.headers.raw()['set-cookie'];
    if (setCookie) {
      setCookie.forEach(cookie => bot.cookieJar.setCookie(cookie));
    }

    return response;
  }

  /**
   * Initialize session for a bot
   */
  async initializeSession(bot) {
    const accountLabel = bot.isPrimary ? 'PRIMARY' : `SECONDARY-${bot.index}`;
    console.log(`🔄 [${accountLabel}] Initializing session...`);
    
    try {
      const url = `${this.baseUrl}/appointment/dz/dzALG2be/${this.config.formGroupId}`;
      const response = await this.makeRequest(bot, url);
      
      if (response.ok) {
        bot.sessionInitialized = true;
        console.log(`✅ [${accountLabel}] Session initialized`);
        return true;
      } else {
        console.log(`⚠️  [${accountLabel}] Session initialization returned status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ [${accountLabel}] Error initializing session:`, error.message);
      return false;
    }
  }

  /**
   * Login for a specific bot
   */
  async login(bot) {
    if (!bot.account.email || !bot.account.password) {
      return true; // No credentials, skip login
    }

    const accountLabel = bot.isPrimary ? 'PRIMARY' : `SECONDARY-${bot.index}`;
    console.log(`🔐 [${accountLabel}] Attempting login...`);
    
    try {
      const url = `${this.baseUrl}/services/customerservice/api/login`;
      const response = await this.makeRequest(bot, url, {
        method: 'POST',
        body: JSON.stringify({
          email: bot.account.email,
          password: bot.account.password
        })
      });

      if (response.ok) {
        bot.loggedIn = true;
        console.log(`✅ [${accountLabel}] Login successful`);
        return true;
      } else {
        const errorData = await response.text();
        console.error(`❌ [${accountLabel}] Login failed:`, response.status, errorData);
        return false;
      }
    } catch (error) {
      console.error(`❌ [${accountLabel}] Error during login:`, error.message);
      return false;
    }
  }

  /**
   * Check available slots for a bot
   */
  async checkAvailableSlots(bot) {
    const accountLabel = bot.isPrimary ? 'PRIMARY' : `SECONDARY-${bot.index}`;
    
    try {
      const url = `${this.baseUrl}/services/customerservice/api/tls/appointment/dz/dzALG2be/table`;
      const params = new URLSearchParams({
        client: 'be',
        formGroupId: this.config.formGroupId,
        appointmentType: this.config.appointmentType || 'Loisirs',
        appointmentStage: 'appointment'
      });

      const response = await this.makeRequest(bot, `${url}?${params}`);
      
      if (!response.ok) {
        console.error(`❌ [${accountLabel}] API returned error: ${response.status}`);
        return [];
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Try to re-login
        if (bot.account.email && bot.account.password) {
          await this.login(bot);
        }
        return [];
      }
      
      const data = await response.json();
      const availableSlots = [];
      
      for (const date in data) {
        for (const time in data[date]) {
          if (data[date][time] > 0) {
            availableSlots.push({ date, time, available: data[date][time] });
          }
        }
      }

      if (availableSlots.length > 0 && bot.isPrimary) {
        console.log(`🟢 [${accountLabel}] Found ${availableSlots.length} available slots!`);
      }
      
      return availableSlots;
    } catch (error) {
      console.error(`❌ [${accountLabel}] Error checking slots:`, error.message);
      return [];
    }
  }

  /**
   * Book appointment for a bot
   */
  async bookAppointment(bot, slot, retryCount = 0) {
    const accountLabel = bot.isPrimary ? 'PRIMARY' : `SECONDARY-${bot.index}`;
    const maxRetries = this.config.maxRetries || 3;
    
    console.log(`📅 [${accountLabel}] Attempting to book: ${slot.date} at ${slot.time}`);
    
    try {
      // Reserve slot
      const reserveUrl = `${this.baseUrl}/services/customerservice/api/tls/appointment/reserve`;
      const reserveResponse = await this.makeRequest(bot, reserveUrl, {
        method: 'POST',
        body: JSON.stringify({
          formGroupId: this.config.formGroupId,
          date: slot.date,
          time: slot.time,
          client: 'be',
          appointmentType: this.config.appointmentType || 'Loisirs'
        })
      });

      if (!reserveResponse.ok) {
        throw new Error(`Failed to reserve slot: ${reserveResponse.status}`);
      }

      console.log(`✅ [${accountLabel}] Slot reserved successfully`);

      // Book appointment
      const bookingUrl = `${this.baseUrl}/services/customerservice/api/tls/appointment/book`;
      const bookingPayload = {
        formGroupId: this.config.formGroupId,
        date: slot.date,
        time: slot.time,
        appointmentType: this.config.appointmentType || 'Loisirs',
        client: 'be',
        firstName: bot.account.firstName,
        lastName: bot.account.lastName,
        email: bot.account.email,
        phone: bot.account.phone,
        ...this.config.additionalFields
      };

      const bookingResponse = await this.makeRequest(bot, bookingUrl, {
        method: 'POST',
        body: JSON.stringify(bookingPayload)
      });

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        console.log(`🎉 [${accountLabel}] Appointment booked successfully!`);
        if (bookingData.confirmationNumber) {
          console.log(`📋 [${accountLabel}] Confirmation: ${bookingData.confirmationNumber}`);
        }
        return { success: true, data: bookingData, accountLabel };
      } else {
        const errorText = await bookingResponse.text();
        console.error(`❌ [${accountLabel}] Booking failed:`, bookingResponse.status);
        
        if (retryCount < maxRetries) {
          console.log(`🔄 [${accountLabel}] Retrying... (${retryCount + 1}/${maxRetries})`);
          await this.sleep(2000);
          return await this.bookAppointment(bot, slot, retryCount + 1);
        }
        
        return { success: false, error: errorText, accountLabel };
      }
    } catch (error) {
      console.error(`❌ [${accountLabel}] Error booking:`, error.message);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 [${accountLabel}] Retrying... (${retryCount + 1}/${maxRetries})`);
        await this.sleep(2000);
        return await this.bookAppointment(bot, slot, retryCount + 1);
      }
      
      return { success: false, error: error.message, accountLabel };
    }
  }

  /**
   * Trigger secondary accounts when primary finds slots
   */
  async triggerSecondaryAccounts(slots) {
    console.log('🚀 Triggering all secondary accounts for parallel booking!');
    this.slotsFound = true;
    
    const bookingPromises = this.bots.map(async (bot) => {
      if (!bot.isPrimary && slots.length > 0) {
        // Each secondary bot tries to book the first available slot
        return await this.bookAppointment(bot, slots[0]);
      }
      return null;
    });

    const results = await Promise.all(bookingPromises);
    
    // Check if any booking succeeded
    const successfulBooking = results.find(r => r && r.success);
    if (successfulBooking) {
      this.bookingSuccess = true;
      console.log(`✅ Booking successful via ${successfulBooking.accountLabel}!`);
      await this.sendNotification('🎉 Appointment booked!', successfulBooking.data);
      return true;
    }
    
    return false;
  }

  /**
   * Monitor slots with a specific bot
   */
  async monitorBot(bot) {
    const accountLabel = bot.isPrimary ? 'PRIMARY' : `SECONDARY-${bot.index}`;
    
    // Initialize session and login
    if (!bot.sessionInitialized) {
      await this.initializeSession(bot);
    }
    
    if (!bot.loggedIn && bot.account.email && bot.account.password) {
      await this.login(bot);
    }

    // Main monitoring loop
    while (!this.bookingSuccess) {
      const now = Date.now();
      
      // Check if it's time for this bot to check
      if (now - bot.lastCheckTime >= bot.checkInterval) {
        bot.lastCheckTime = now;
        
        if (bot.isPrimary) {
          // Primary account: aggressive checking
          const slots = await this.checkAvailableSlots(bot);
          
          if (slots.length > 0 && !this.slotsFound) {
            await this.sendNotification(`🟢 ${slots.length} slot(s) found!`, slots);
            
            if (this.config.autoBook) {
              // Try to book with primary first
              const result = await this.bookAppointment(bot, slots[0]);
              
              if (result.success) {
                this.bookingSuccess = true;
                return;
              }
              
              // If primary fails, trigger all secondary accounts
              const secondarySuccess = await this.triggerSecondaryAccounts(slots);
              if (secondarySuccess) {
                return;
              }
            }
          }
        } else {
          // Secondary account: only check if primary hasn't found slots yet
          if (!this.slotsFound) {
            const slots = await this.checkAvailableSlots(bot);
            if (slots.length > 0) {
              console.log(`🟢 [${accountLabel}] Also found ${slots.length} slots`);
            }
          }
        }
      }
      
      // Sleep briefly to prevent tight loop
      await this.sleep(bot.isPrimary ? 50 : 1000);
      
      if (this.config.stopAfterBooking && this.bookingSuccess) {
        break;
      }
    }
  }

  /**
   * Start multi-account monitoring
   */
  async start() {
    console.log('🤖 Starting Multi-Account TLS Booking Bot...');
    console.log('='.repeat(60));
    console.log(`📊 Configuration:`);
    console.log(`   Accounts: ${this.accounts.length} (1 PRIMARY + ${this.accounts.length - 1} SECONDARY)`);
    console.log(`   Primary check interval: ${this.bots[0].checkInterval}ms`);
    console.log(`   Secondary check interval: ${this.bots[1]?.checkInterval || 'N/A'}ms`);
    console.log(`   Form Group ID: ${this.config.formGroupId}`);
    console.log(`   Auto-book: ${this.config.autoBook ? '✅' : '❌'}`);
    console.log('='.repeat(60));

    // Start monitoring for all bots in parallel
    const monitoringPromises = this.bots.map(bot => this.monitorBot(bot));
    
    try {
      await Promise.race(monitoringPromises);
      
      if (this.bookingSuccess) {
        console.log('\n✅ Booking completed successfully! Stopping all accounts.');
      }
    } catch (error) {
      console.error('❌ Fatal error:', error);
    }
  }

  /**
   * Send notification via Telegram
   */
  async sendNotification(message, data = null) {
    if (!this.config.telegramBotToken || !this.config.telegramChatId) {
      return;
    }

    try {
      let text = message;
      if (data) {
        const safeData = this.filterSensitiveData(data);
        text += '\n\n' + JSON.stringify(safeData, null, 2);
      }

      const url = `https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.config.telegramChatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
    } catch (error) {
      console.error('❌ Failed to send Telegram notification:', error.message);
    }
  }

  /**
   * Filter sensitive data
   */
  filterSensitiveData(data) {
    if (!data) return data;
    if (Array.isArray(data)) return data.map(item => this.filterSensitiveData(item));
    if (typeof data !== 'object') return data;
    
    const filtered = { ...data };
    const sensitiveFields = ['password', 'passportNumber', 'email', 'phone', 'dateOfBirth', 'reservationId', 'token'];
    sensitiveFields.forEach(field => {
      if (filtered[field]) delete filtered[field];
    });
    
    return filtered;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MultiAccountBookingBot;
