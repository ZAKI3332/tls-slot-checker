import fetch from 'node-fetch';
import { CookieJar } from './cookie-jar.js';

/**
 * TLS Contact Appointment Booking Bot
 * Automates the process of booking appointments on TLS Contact website
 */
class TLSBookingBot {
  constructor(config) {
    this.config = config;
    this.cookieJar = new CookieJar();
    this.baseUrl = 'https://visas-be.tlscontact.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/json',
      'Origin': this.baseUrl,
      'Referer': `${this.baseUrl}/appointment/dz/dzALG2be/${config.formGroupId}`
    };
  }

  /**
   * Get headers with cookies
   */
  getHeaders() {
    const headers = { ...this.headers };
    const cookieString = this.cookieJar.getCookieString();
    if (cookieString) {
      headers['Cookie'] = cookieString;
    }
    return headers;
  }

  /**
   * Make API request with cookie handling
   */
  async makeRequest(url, options = {}) {
    const headers = this.getHeaders();
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    // Store cookies from response
    const setCookie = response.headers.raw()['set-cookie'];
    if (setCookie) {
      setCookie.forEach(cookie => this.cookieJar.setCookie(cookie));
    }

    return response;
  }

  /**
   * Initialize session by visiting the appointment page
   */
  async initializeSession() {
    console.log('🔄 Initializing session...');
    try {
      const url = `${this.baseUrl}/appointment/dz/dzALG2be/${this.config.formGroupId}`;
      const response = await this.makeRequest(url);
      
      if (response.ok) {
        console.log('✅ Session initialized successfully');
        return true;
      } else {
        console.log('⚠️  Session initialization returned status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error initializing session:', error.message);
      return false;
    }
  }

  /**
   * Check available appointment slots
   */
  async checkAvailableSlots() {
    console.log('🔍 Checking available slots...');
    try {
      const url = `${this.baseUrl}/services/customerservice/api/tls/appointment/dz/dzALG2be/table`;
      const params = new URLSearchParams({
        client: 'be',
        formGroupId: this.config.formGroupId,
        appointmentType: this.config.appointmentType || 'Loisirs',
        appointmentStage: 'appointment'
      });

      const response = await this.makeRequest(`${url}?${params}`);
      const data = await response.json();

      const availableSlots = [];
      for (const date in data) {
        for (const time in data[date]) {
          if (data[date][time] > 0) {
            availableSlots.push({ date, time, available: data[date][time] });
          }
        }
      }

      console.log(`✅ Found ${availableSlots.length} available slots`);
      return availableSlots;
    } catch (error) {
      console.error('❌ Error checking slots:', error.message);
      return [];
    }
  }

  /**
   * Login to the system (if authentication is required)
   */
  async login() {
    if (!this.config.email || !this.config.password) {
      console.log('ℹ️  No credentials provided, skipping login');
      return true;
    }

    console.log('🔐 Attempting login...');
    try {
      const url = `${this.baseUrl}/services/customerservice/api/login`;
      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          email: this.config.email,
          password: this.config.password
        })
      });

      if (response.ok) {
        console.log('✅ Login successful');
        return true;
      } else {
        const errorData = await response.text();
        console.error('❌ Login failed:', response.status, errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Error during login:', error.message);
      return false;
    }
  }

  /**
   * Book an appointment with the given slot and user details
   */
  async bookAppointment(slot, retryCount = 0) {
    const maxRetries = this.config.maxRetries || 3;
    
    console.log(`📅 Attempting to book appointment for ${slot.date} at ${slot.time}...`);
    
    try {
      // Step 1: Reserve the slot
      const reserveUrl = `${this.baseUrl}/services/customerservice/api/tls/appointment/reserve`;
      const reserveResponse = await this.makeRequest(reserveUrl, {
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

      const reserveData = await reserveResponse.json();
      console.log('✅ Slot reserved:', reserveData);

      // Step 2: Submit appointment details
      const bookingUrl = `${this.baseUrl}/services/customerservice/api/tls/appointment/book`;
      const bookingPayload = {
        formGroupId: this.config.formGroupId,
        date: slot.date,
        time: slot.time,
        appointmentType: this.config.appointmentType || 'Loisirs',
        client: 'be',
        // User details
        firstName: this.config.firstName,
        lastName: this.config.lastName,
        email: this.config.email,
        phone: this.config.phone,
        ...this.config.additionalFields
      };

      const bookingResponse = await this.makeRequest(bookingUrl, {
        method: 'POST',
        body: JSON.stringify(bookingPayload)
      });

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        console.log('🎉 Appointment booked successfully!');
        console.log('📋 Booking details:', bookingData);
        return { success: true, data: bookingData };
      } else {
        const errorText = await bookingResponse.text();
        console.error('❌ Booking failed:', bookingResponse.status, errorText);
        
        // Retry if configured
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying... (Attempt ${retryCount + 1}/${maxRetries})`);
          await this.sleep(2000);
          return await this.bookAppointment(slot, retryCount + 1);
        }
        
        return { success: false, error: errorText };
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
   * Main booking flow - continuously monitor and book when available
   */
  async startBookingBot() {
    console.log('🤖 Starting TLS Appointment Booking Bot...');
    console.log('⚙️  Configuration:', {
      formGroupId: this.config.formGroupId,
      appointmentType: this.config.appointmentType,
      checkInterval: this.config.checkInterval || 60000,
      autoBook: this.config.autoBook
    });

    // Initialize session
    await this.initializeSession();

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
              await this.sendNotification('🎉 Appointment booked successfully!', result.data);
              
              // Stop monitoring after successful booking
              if (this.config.stopAfterBooking) {
                console.log('✅ Booking completed. Stopping bot.');
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
        text += '\n\n' + JSON.stringify(data, null, 2);
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
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default TLSBookingBot;
