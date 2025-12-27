/**
 * Multi-Account Configuration for TLS Booking Bot
 * Supports PRIMARY (aggressive checking) + SECONDARY accounts (standby)
 */

export default {
  // ============================================
  // APPOINTMENT SETTINGS
  // ============================================
  
  formGroupId: '1651036',
  appointmentType: 'Loisirs',
  countryCode: 'dz',
  centerCode: 'dzALG2be',
  client: 'be',

  // ============================================
  // BOT BEHAVIOR
  // ============================================
  
  /**
   * Enable automatic booking when slots are found
   */
  autoBook: true,
  
  /**
   * Stop all accounts after one successful booking
   */
  stopAfterBooking: true,
  
  /**
   * PRIMARY account check interval (milliseconds)
   * Default: 100ms (0.1 seconds) - Very aggressive!
   * Minimum: 50ms
   */
  primaryCheckInterval: 100,
  
  /**
   * SECONDARY accounts check interval (milliseconds)
   * Default: 300000ms (5 minutes)
   * They stay idle until PRIMARY triggers them
   */
  secondaryCheckInterval: 300000,
  
  /**
   * Maximum number of retries for booking
   */
  maxRetries: 3,

  // ============================================
  // NOTIFICATIONS (Optional)
  // ============================================
  
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  
  // ============================================
  // ADVANCED SETTINGS
  // ============================================
  
  additionalFields: {
    // Add any extra fields required by the booking form
  }
};

/**
 * ACCOUNTS CONFIGURATION
 * Define multiple accounts for parallel booking
 * 
 * IMPORTANT:
 * - First account is PRIMARY (aggressive checking every 0.1s)
 * - Other accounts are SECONDARY (check every 5 min, triggered when PRIMARY finds slots)
 */
export const accounts = [
  // ============================================
  // PRIMARY ACCOUNT (Account 1)
  // ============================================
  {
    email: 'amourfaycal1@outlook.com',
    password: 'Visa@1990',
    firstName: 'YOUR_FIRST_NAME',      // ⚠️ CHANGE THIS
    lastName: 'YOUR_LAST_NAME',        // ⚠️ CHANGE THIS
    phone: '+213XXXXXXXXX',            // ⚠️ CHANGE THIS
  },
  
  // ============================================
  // SECONDARY ACCOUNT 2 (Optional)
  // ============================================
  // Uncomment and fill in to enable a second account
  /*
  {
    email: 'account2@example.com',
    password: 'Password2',
    firstName: 'FirstName2',
    lastName: 'LastName2',
    phone: '+213YYYYYYYYY',
  },
  */
  
  // ============================================
  // SECONDARY ACCOUNT 3 (Optional)
  // ============================================
  // Uncomment and fill in to enable a third account
  /*
  {
    email: 'account3@example.com',
    password: 'Password3',
    firstName: 'FirstName3',
    lastName: 'LastName3',
    phone: '+213ZZZZZZZZZ',
  },
  */
];

/**
 * HOW IT WORKS:
 * 
 * 1. PRIMARY account (first in array):
 *    - Checks slots aggressively every 0.1 seconds
 *    - When slots are found, tries to book immediately
 *    - If booking fails, triggers all SECONDARY accounts
 * 
 * 2. SECONDARY accounts (others in array):
 *    - Check slots slowly every 5 minutes (as backup)
 *    - Stay idle until PRIMARY triggers them
 *    - When triggered, all try to book in parallel
 *    - First one to succeed wins
 * 
 * 3. Strategy:
 *    - Maximum speed with PRIMARY account
 *    - Maximum redundancy with SECONDARY accounts
 *    - All accounts compete when slots are found
 *    - Stops immediately after first successful booking
 */
