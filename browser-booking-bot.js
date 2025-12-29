import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use stealth plugin to bypass Cloudflare
puppeteer.use(StealthPlugin());

/**
 * TLS Contact Appointment Booking Bot with Puppeteer
 * Uses browser automation to bypass Cloudflare protection
 */
class BrowserBookingBot {
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://visas-be.tlscontact.com';
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  /**
   * Initialize browser with stealth mode
   */
  async initBrowser() {
    console.log('🌐 Launching browser...');
    try {
      this.browser = await puppeteer.launch({
        headless: 'new', // Use new headless mode
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Set user agent to look like real browser
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      console.log('✅ Browser initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing browser:', error.message);
      return false;
    }
  }

  /**
   * Navigate to appointment page and handle Cloudflare
   */
  async navigateToAppointmentPage() {
    console.log('🔄 Navigating to appointment page...');
    try {
      const url = `${this.baseUrl}/appointment/dz/dzALG2be/${this.config.formGroupId}`;
      
      // Navigate to the page
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      // Wait a bit for potential Cloudflare check
      await this.sleep(3000);

      // Check if we're past Cloudflare (page should have content)
      const pageContent = await this.page.content();
      if (pageContent.includes('Just a moment')) {
        console.log('⏳ Cloudflare challenge detected, waiting...');
        await this.page.waitForNavigation({ 
          waitUntil: 'networkidle2',
          timeout: 30000 
        }).catch(() => console.log('⚠️  Navigation timeout, continuing...'));
      }

      console.log('✅ Successfully navigated to appointment page');
      return true;
    } catch (error) {
      console.error('❌ Error navigating to page:', error.message);
      return false;
    }
  }

  /**
   * Login to TLS Contact
   */
  async login() {
    if (!this.config.email || !this.config.password) {
      console.log('ℹ️  No credentials provided, skipping login');
      return true;
    }

    if (this.isLoggedIn) {
      console.log('ℹ️  Already logged in');
      return true;
    }

    console.log('🔐 Attempting login...');
    try {
      // Look for login button or form
      const loginButtonExists = await this.page.$('button[type="submit"]').then(el => !!el);
      
      if (!loginButtonExists) {
        console.log('ℹ️  No login form found, may already be logged in');
        this.isLoggedIn = true;
        return true;
      }

      // Fill in email
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
      await this.page.type('input[type="email"], input[name="email"]', this.config.email);
      
      // Fill in password
      await this.page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 5000 });
      await this.page.type('input[type="password"], input[name="password"]', this.config.password);
      
      // Click login button
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation or success indicator
      await Promise.race([
        this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
        this.page.waitForSelector('.user-profile, .account-menu', { timeout: 10000 })
      ]).catch(() => console.log('⚠️  Login timeout, checking status...'));

      // Check if login was successful
      const currentUrl = this.page.url();
      const pageContent = await this.page.content();
      
      if (pageContent.includes('logout') || pageContent.includes('account') || !currentUrl.includes('login')) {
        console.log('✅ Login successful');
        this.isLoggedIn = true;
        return true;
      } else {
        console.error('❌ Login failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Error during login:', error.message);
      return false;
    }
  }

  /**
   * Check available appointment slots
   */
  async checkAvailableSlots() {
    console.log('🔍 Checking available slots...');
    try {
      // Navigate to appointment page if not there
      const currentUrl = this.page.url();
      if (!currentUrl.includes(this.config.formGroupId)) {
        await this.navigateToAppointmentPage();
      }

      // Wait for the calendar/slot elements to load
      await this.page.waitForSelector('.calendar, .appointment-slots, [data-testid="calendar"]', { 
        timeout: 10000 
      }).catch(() => console.log('⚠️  Calendar elements not found, trying alternative method...'));

      // Try to extract slots from the page
      const slots = await this.page.evaluate(() => {
        const availableSlots = [];
        
        // Try different selectors for slots
        const slotElements = document.querySelectorAll('.available-slot, .slot[data-available="true"], .appointment-time.available');
        
        slotElements.forEach(slot => {
          const date = slot.getAttribute('data-date') || slot.querySelector('[data-date]')?.getAttribute('data-date');
          const time = slot.getAttribute('data-time') || slot.querySelector('[data-time]')?.getAttribute('data-time');
          
          if (date && time) {
            availableSlots.push({ date, time, available: 1 });
          }
        });

        return availableSlots;
      });

      // Alternative: Check via API call interception
      if (slots.length === 0) {
        // Try to get slots from network requests
        const apiSlots = await this.getSlotsViaAPI();
        if (apiSlots.length > 0) {
          console.log(`✅ Found ${apiSlots.length} available slots via API`);
          return apiSlots;
        }
      }

      console.log(`✅ Found ${slots.length} available slots`);
      return slots;
    } catch (error) {
      console.error('❌ Error checking slots:', error.message);
      return [];
    }
  }

  /**
   * Get slots via intercepted API calls
   */
  async getSlotsViaAPI() {
    try {
      // Enable request interception
      await this.page.setRequestInterception(true);
      
      let slotsData = null;
      
      // Intercept API responses
      this.page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/tls/appointment') || url.includes('/table')) {
          try {
            const contentType = response.headers()['content-type'];
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              if (data && typeof data === 'object') {
                slotsData = data;
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });

      // Trigger a refresh or navigation to get new data
      await this.page.reload({ waitUntil: 'networkidle2' });
      
      // Wait a bit for API calls
      await this.sleep(3000);
      
      // Parse slots data
      if (slotsData) {
        const availableSlots = [];
        for (const date in slotsData) {
          for (const time in slotsData[date]) {
            if (slotsData[date][time] > 0) {
              availableSlots.push({ date, time, available: slotsData[date][time] });
            }
          }
        }
        return availableSlots;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error getting slots via API:', error.message);
      return [];
    }
  }

  /**
   * Book an appointment
   */
  async bookAppointment(slot, retryCount = 0) {
    const maxRetries = this.config.maxRetries || 3;
    
    console.log(`📅 Attempting to book appointment for ${slot.date} at ${slot.time}...`);
    
    try {
      // Find and click the slot element
      const slotClicked = await this.page.evaluate((slotDate, slotTime) => {
        const slots = document.querySelectorAll('.available-slot, .slot[data-available="true"], .appointment-time.available');
        for (const slot of slots) {
          const date = slot.getAttribute('data-date') || slot.querySelector('[data-date]')?.getAttribute('data-date');
          const time = slot.getAttribute('data-time') || slot.querySelector('[data-time]')?.getAttribute('data-time');
          
          if (date === slotDate && time === slotTime) {
            slot.click();
            return true;
          }
        }
        return false;
      }, slot.date, slot.time);

      if (!slotClicked) {
        console.error('❌ Could not find slot element to click');
        return { success: false, error: 'Slot element not found' };
      }

      // Wait for booking form
      await this.page.waitForSelector('form, .booking-form', { timeout: 5000 });
      
      // Fill in personal details if fields are present
      if (this.config.firstName) {
        await this.fillFieldIfExists('input[name="firstName"], input[id="firstName"]', this.config.firstName);
      }
      if (this.config.lastName) {
        await this.fillFieldIfExists('input[name="lastName"], input[id="lastName"]', this.config.lastName);
      }
      if (this.config.phone) {
        await this.fillFieldIfExists('input[name="phone"], input[id="phone"]', this.config.phone);
      }
      
      // Click confirm/submit button
      await this.page.click('button[type="submit"], .confirm-button, .book-button');
      
      // Wait for confirmation
      await Promise.race([
        this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
        this.page.waitForSelector('.success, .confirmation', { timeout: 10000 })
      ]).catch(() => console.log('⚠️  Confirmation timeout, checking status...'));

      // Check if booking was successful
      const pageContent = await this.page.content();
      if (pageContent.includes('success') || pageContent.includes('confirmed') || pageContent.includes('confirmation')) {
        console.log('🎉 Appointment booked successfully!');
        
        // Try to extract confirmation number
        const confirmationNumber = await this.page.evaluate(() => {
          const confirmEl = document.querySelector('.confirmation-number, .reference-number');
          return confirmEl ? confirmEl.textContent.trim() : null;
        });
        
        if (confirmationNumber) {
          console.log('📋 Confirmation number:', confirmationNumber);
        }
        
        return { success: true, confirmationNumber };
      } else {
        console.error('❌ Booking may have failed');
        
        // Retry if configured
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying... (Attempt ${retryCount + 1}/${maxRetries})`);
          await this.sleep(2000);
          return await this.bookAppointment(slot, retryCount + 1);
        }
        
        return { success: false, error: 'Booking confirmation not found' };
      }
    } catch (error) {
      console.error('❌ Error booking appointment:', error.message);
      
      // Retry if configured
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying... (Attempt ${retryCount + 1}/${maxRetries})`);
        await this.sleep(2000);
        return await this.bookAppointment(slot, retryCount + 1);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper to fill field if it exists
   */
  async fillFieldIfExists(selector, value) {
    try {
      const field = await this.page.$(selector);
      if (field) {
        await this.page.type(selector, value);
      }
    } catch (error) {
      // Field doesn't exist, skip
    }
  }

  /**
   * Main booking flow
   */
  async startBookingBot() {
    console.log('🤖 Starting Browser-Based TLS Appointment Booking Bot...');
    console.log('⚙️  Configuration:', {
      formGroupId: this.config.formGroupId,
      appointmentType: this.config.appointmentType,
      checkInterval: this.config.checkInterval || 60000,
      autoBook: this.config.autoBook
    });

    // Initialize browser
    const browserInit = await this.initBrowser();
    if (!browserInit) {
      console.error('❌ Failed to initialize browser');
      return;
    }

    // Navigate to appointment page
    await this.navigateToAppointmentPage();

    // Login if credentials provided
    if (this.config.email && this.config.password) {
      await this.login();
    }

    // Main monitoring loop
    const checkAndBook = async () => {
      try {
        const slots = await this.checkAvailableSlots();

        if (slots.length > 0) {
          console.log('🟢 Available slots found:', slots);
          
          // Send notification
          await this.sendNotification(`🟢 ${slots.length} slot(s) available!`, slots);

          // Auto-book if enabled
          if (this.config.autoBook) {
            // Sort slots by preference (earliest date first)
            slots.sort((a, b) => {
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              return a.time.localeCompare(b.time);
            });

            // Try to book the first available slot
            const result = await this.bookAppointment(slots[0]);
            
            if (result.success) {
              await this.sendNotification('🎉 Appointment booked successfully!', result);
              
              // Stop monitoring after successful booking
              if (this.config.stopAfterBooking) {
                console.log('✅ Booking completed. Stopping bot.');
                await this.cleanup();
                return true; // Signal to stop
              }
            } else {
              await this.sendNotification('❌ Booking failed', result.error);
            }
          }
        } else {
          console.log(`[${new Date().toISOString()}] ⚪ No slots available yet...`);
        }
      } catch (error) {
        console.error('❌ Error in monitoring loop:', error);
      }
      
      return false; // Continue monitoring
    };

    // Initial check
    const shouldStop = await checkAndBook();
    if (shouldStop) return;

    // Set up interval for continuous monitoring
    const interval = this.config.checkInterval || 60000; // Default 1 minute
    console.log(`⏰ Monitoring every ${interval / 1000} seconds...`);
    
    setInterval(async () => {
      const shouldStop = await checkAndBook();
      if (shouldStop) {
        process.exit(0);
      }
    }, interval);
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
        // Filter sensitive data before sending
        const safeData = this.filterSensitiveData(data);
        text += '\n\n' + JSON.stringify(safeData, null, 2);
      }

      const url = `https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`;
      const response = await fetch(url, {
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
   * Filter sensitive data from objects
   */
  filterSensitiveData(data) {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => this.filterSensitiveData(item));
    }
    
    if (typeof data !== 'object') {
      return data;
    }
    
    const filtered = { ...data };
    const sensitiveFields = [
      'password', 'passportNumber', 'passport_number', 'email', 'phone',
      'dateOfBirth', 'date_of_birth', 'reservationId', 'reservation_id',
      'token', 'sessionId', 'session_id'
    ];
    
    sensitiveFields.forEach(field => {
      if (filtered[field]) {
        delete filtered[field];
      }
    });
    
    return filtered;
  }

  /**
   * Cleanup browser resources
   */
  async cleanup() {
    console.log('🧹 Cleaning up browser resources...');
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default BrowserBookingBot;
