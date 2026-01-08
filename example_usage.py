#!/usr/bin/env python3
"""
Example usage of the TLS Slot Checker Bot with periodic screenshots

This example shows how to customize the bot configuration and run it.
"""

import os
from bot import Config, run_multi_three_accounts

# Example: Customize configuration
def run_with_custom_config():
    """Run the bot with custom configuration"""
    from bot import CONFIG
    
    # Customize screenshot interval (15 minutes instead of 30)
    CONFIG.periodic_screenshot_interval = 900  # 15 minutes
    
    # Enable or disable periodic screenshots
    CONFIG.enable_periodic_screenshots = True
    
    # Run in headless mode (no visible browser window)
    CONFIG.headless = True
    
    # Custom screenshot directory
    CONFIG.screenshot_dir = '/tmp/bot_screenshots'
    
    print("Starting bot with custom configuration:")
    print(f"  - Screenshot interval: {CONFIG.periodic_screenshot_interval // 60} minutes")
    print(f"  - Periodic screenshots: {CONFIG.enable_periodic_screenshots}")
    print(f"  - Headless mode: {CONFIG.headless}")
    print(f"  - Screenshot directory: {CONFIG.screenshot_dir}")
    print()
    
    # Run the bot
    run_multi_three_accounts()


# Example: Run with environment variables
def run_with_env_vars():
    """Run the bot using environment variables for configuration"""
    
    # Set Telegram credentials via environment variables
    if not os.environ.get('TELEGRAM_BOT_TOKEN'):
        print("⚠️  Warning: TELEGRAM_BOT_TOKEN not set")
        print("   Set it with: export TELEGRAM_BOT_TOKEN='your_token_here'")
    
    if not os.environ.get('TELEGRAM_CHAT_ID'):
        print("⚠️  Warning: TELEGRAM_CHAT_ID not set")
        print("   Set it with: export TELEGRAM_CHAT_ID='your_chat_id_here'")
    
    print("\nStarting bot with environment variables...")
    
    # Run the bot with default configuration
    run_multi_three_accounts()


# Example: Run with disabled periodic screenshots
def run_without_periodic_screenshots():
    """Run the bot without periodic screenshot feature"""
    from bot import CONFIG
    
    # Disable periodic screenshots
    CONFIG.enable_periodic_screenshots = False
    
    print("Starting bot with periodic screenshots DISABLED")
    print("The bot will only check slots without sending periodic screenshots")
    print()
    
    # Run the bot
    run_multi_three_accounts()


if __name__ == '__main__':
    import sys
    
    print("=" * 60)
    print("TLS Slot Checker Bot - Example Usage")
    print("=" * 60)
    print()
    print("Choose an example to run:")
    print("  1. Run with custom configuration (15 min interval, headless)")
    print("  2. Run with environment variables (default config)")
    print("  3. Run without periodic screenshots")
    print()
    
    choice = input("Enter choice (1-3) or 'q' to quit: ").strip()
    
    if choice == '1':
        run_with_custom_config()
    elif choice == '2':
        run_with_env_vars()
    elif choice == '3':
        run_without_periodic_screenshots()
    elif choice.lower() == 'q':
        print("Exiting...")
        sys.exit(0)
    else:
        print("Invalid choice. Please run again and select 1, 2, or 3.")
        sys.exit(1)
