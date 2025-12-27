/**
 * Configuration Template for TLS Booking Bot
 * 
 * Copy this file to config.js and fill in your details
 */
export default {
  // ============================================
  // APPOINTMENT SETTINGS
  // ============================================
  
  /**
   * Form Group ID from the appointment URL
   * Example: https://visas-be.tlscontact.com/appointment/dz/dzALG2be/1645832
   * The formGroupId is: 1645832
   */
  formGroupId: '1645832',
  
  /**
   * Appointment type
   * Common values: 'Loisirs', 'Affaires', 'Famille', 'Etudes'
   */
  appointmentType: 'Loisirs',
  
  /**
   * Country and center codes
   * Example: dz (Algeria), dzALG2be (Algiers center for Belgium)
   */
  countryCode: 'dz',
  centerCode: 'dzALG2be',
  client: 'be',

  // ============================================
  // PERSONAL INFORMATION
  // ============================================
  
  /**
   * Your personal details for booking
   */
  firstName: 'YOUR_FIRST_NAME',
  lastName: 'YOUR_LAST_NAME',
  email: 'your.email@example.com',  // Used for both contact and login
  phone: '+213XXXXXXXXX',
  
  /**
   * Additional fields that might be required
   * Uncomment and fill as needed
   */
  // passportNumber: 'XXXXXXXXX',
  // dateOfBirth: 'YYYY-MM-DD',
  // nationality: 'DZ',
  
  // ============================================
  // AUTHENTICATION (Optional)
  // ============================================
  
  /**
   * If the site requires login, provide password
   * Leave empty if no login is required
   */
  password: '', // Only if login is required (email is used from above)
  
  // ============================================
  // BOT BEHAVIOR
  // ============================================
  
  /**
   * Enable automatic booking when slots are found
   * Set to false to only monitor without booking
   */
  autoBook: true,
  
  /**
   * Stop the bot after successfully booking an appointment
   */
  stopAfterBooking: true,
  
  /**
   * Check interval in milliseconds
   * Default: 60000 (1 minute)
   * Recommended: Don't set below 30000 to avoid rate limiting
   */
  checkInterval: 60000,
  
  /**
   * Maximum number of retries for booking
   */
  maxRetries: 3,
  
  /**
   * Preferred dates (optional)
   * If specified, bot will prioritize these dates
   * Format: ['YYYY-MM-DD', 'YYYY-MM-DD']
   */
  // preferredDates: ['2025-01-15', '2025-01-16'],
  
  /**
   * Preferred time slots (optional)
   * If specified, bot will prioritize these times
   * Format: ['HH:mm', 'HH:mm']
   */
  // preferredTimes: ['09:00', '10:00', '11:00'],

  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  /**
   * Telegram Bot Configuration (Optional)
   * Get these from @BotFather on Telegram
   */
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  
  /**
   * Additional notification options
   */
  notifyOnSlotFound: true,
  notifyOnBookingSuccess: true,
  notifyOnBookingFailure: true,

  // ============================================
  // ADVANCED SETTINGS
  // ============================================
  
  /**
   * Additional form fields that might be required
   * Add any extra fields needed by the booking form
   */
  additionalFields: {
    // Example:
    // visaType: 'Tourist',
    // travelPurpose: 'Tourism',
    // appointmentStage: 'appointment'
  }
};
