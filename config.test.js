/**
 * Test Configuration for TLS Booking Bot
 * This is a safe configuration for testing the bot without actual booking
 */
export default {
  // Appointment settings
  formGroupId: '1645832',
  appointmentType: 'Loisirs',
  countryCode: 'dz',
  centerCode: 'dzALG2be',
  client: 'be',

  // Personal information (REPLACE WITH YOUR REAL DATA)
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '+213000000000',

  // Bot behavior - SAFE SETTINGS FOR TESTING
  autoBook: false,              // Don't actually book during testing
  stopAfterBooking: false,      // Keep running for monitoring
  checkInterval: 30000,         // Check every 30 seconds (faster for testing)
  maxRetries: 1,                // Only retry once during testing

  // Notifications (optional - leave empty for testing)
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  
  notifyOnSlotFound: true,
  notifyOnBookingSuccess: true,
  notifyOnBookingFailure: true,

  // Additional fields (add if required by the form)
  additionalFields: {
    // Example fields that might be needed:
    // passportNumber: 'XXXXXXXXX',
    // dateOfBirth: '1990-01-01',
    // nationality: 'DZ',
  }
};
