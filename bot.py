#!/usr/bin/env python3
"""
TLS Slot Checker Bot with Periodic Screenshot Notifications
"""
import os
import sys
import time
import logging
import threading
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Optional
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class Config:
    """Configuration for the TLS Slot Checker Bot"""
    # Telegram settings
    telegram_bot_token: str = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    telegram_chat_id: str = os.environ.get('TELEGRAM_CHAT_ID', '')
    
    # Periodic screenshot settings
    periodic_screenshot_interval: int = 1800  # 30 minutes in seconds
    enable_periodic_screenshots: bool = True
    
    # TLScontact settings
    tls_url: str = 'https://visas-be.tlscontact.com/appointment/dz/dzALG2be/table'
    
    # WebDriver settings
    headless: bool = False
    screenshot_dir: str = '/tmp/screenshots'


# Global configuration
CONFIG = Config()

# Global driver management
DRIVERS_MAP: Dict[str, webdriver.Chrome] = {}
DRIVERS_LOCK = threading.Lock()


def setup_chrome_driver(label: str) -> webdriver.Chrome:
    """
    Setup and return a Chrome WebDriver instance
    
    Args:
        label: Label/identifier for this driver instance
        
    Returns:
        Configured Chrome WebDriver
    """
    logger.info(f"Setting up Chrome driver for: {label}")
    
    chrome_options = Options()
    if CONFIG.headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver


def send_telegram_message(message: str) -> bool:
    """
    Send a text message via Telegram
    
    Args:
        message: Text message to send
        
    Returns:
        True if successful, False otherwise
    """
    if not CONFIG.telegram_bot_token or not CONFIG.telegram_chat_id:
        logger.warning("Telegram credentials not configured")
        return False
    
    try:
        url = f"https://api.telegram.org/bot{CONFIG.telegram_bot_token}/sendMessage"
        payload = {
            'chat_id': CONFIG.telegram_chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        logger.info("Telegram message sent successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {e}")
        return False


def send_telegram_photo_with_keyboard(
    photo_path: str,
    caption: str,
    keyboard: Optional[Dict] = None
) -> bool:
    """
    Send a photo via Telegram with optional caption and keyboard
    
    Args:
        photo_path: Path to the photo file
        caption: Caption text for the photo
        keyboard: Optional inline keyboard markup
        
    Returns:
        True if successful, False otherwise
    """
    if not CONFIG.telegram_bot_token or not CONFIG.telegram_chat_id:
        logger.warning("Telegram credentials not configured")
        return False
    
    if not os.path.exists(photo_path):
        logger.error(f"Photo file not found: {photo_path}")
        return False
    
    try:
        url = f"https://api.telegram.org/bot{CONFIG.telegram_bot_token}/sendPhoto"
        
        with open(photo_path, 'rb') as photo_file:
            files = {'photo': photo_file}
            data = {
                'chat_id': CONFIG.telegram_chat_id,
                'caption': caption,
                'parse_mode': 'HTML'
            }
            
            if keyboard:
                data['reply_markup'] = keyboard
            
            response = requests.post(url, files=files, data=data, timeout=30)
            response.raise_for_status()
            logger.info(f"Telegram photo sent successfully: {photo_path}")
            return True
    except Exception as e:
        logger.error(f"Failed to send Telegram photo: {e}")
        return False


def capture_screenshot(driver: webdriver.Chrome, label: str) -> Optional[str]:
    """
    Capture a screenshot from a driver instance
    
    Args:
        driver: WebDriver instance
        label: Label/identifier for the driver
        
    Returns:
        Path to saved screenshot file, or None if failed
    """
    try:
        # Ensure screenshot directory exists
        Path(CONFIG.screenshot_dir).mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"periodic_{label}_{timestamp}.png"
        filepath = os.path.join(CONFIG.screenshot_dir, filename)
        
        # Capture screenshot
        driver.save_screenshot(filepath)
        logger.info(f"Screenshot captured: {filepath}")
        return filepath
    except Exception as e:
        logger.error(f"Failed to capture screenshot for {label}: {e}")
        return None


def get_driver_info(driver: webdriver.Chrome) -> Dict[str, str]:
    """
    Get current information from a driver
    
    Args:
        driver: WebDriver instance
        
    Returns:
        Dictionary with driver info (url, title, etc.)
    """
    info = {
        'url': 'N/A',
        'title': 'N/A'
    }
    
    try:
        info['url'] = driver.current_url
    except Exception as e:
        logger.debug(f"Could not get current URL: {e}")
    
    try:
        info['title'] = driver.title
    except Exception as e:
        logger.debug(f"Could not get page title: {e}")
    
    return info


def periodic_screenshot_thread(stop_event: threading.Event):
    """
    Background thread that periodically captures and sends screenshots
    from all active drivers
    
    Args:
        stop_event: Threading event to signal shutdown
    """
    logger.info("Periodic screenshot thread started")
    logger.info(f"Screenshot interval: {CONFIG.periodic_screenshot_interval} seconds")
    
    while not stop_event.is_set():
        # Wait for the interval or until stop event is set
        if stop_event.wait(timeout=CONFIG.periodic_screenshot_interval):
            # Stop event was set, exit loop
            break
        
        logger.info("Starting periodic screenshot capture...")
        
        # Lock to safely access DRIVERS_MAP
        with DRIVERS_LOCK:
            if not DRIVERS_MAP:
                logger.info("No active drivers to capture screenshots from")
                continue
            
            # Iterate through all active drivers
            for label, driver in list(DRIVERS_MAP.items()):
                try:
                    # Check if driver is still alive
                    if not driver or not driver.session_id:
                        logger.warning(f"Driver {label} is not active, skipping")
                        continue
                    
                    # Get driver info
                    driver_info = get_driver_info(driver)
                    
                    # Capture screenshot
                    screenshot_path = capture_screenshot(driver, label)
                    
                    if screenshot_path:
                        # Prepare caption
                        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        caption = (
                            f"📸 Periodic Check (30min)\n"
                            f"Account: {label}\n"
                            f"Time: {current_time}\n"
                            f"URL: {driver_info['url']}"
                        )
                        
                        # Send to Telegram
                        send_success = send_telegram_photo_with_keyboard(
                            photo_path=screenshot_path,
                            caption=caption
                        )
                        
                        if send_success:
                            logger.info(f"Periodic screenshot sent for {label}")
                        else:
                            logger.error(f"Failed to send screenshot for {label}")
                        
                        # Clean up screenshot file after sending
                        try:
                            os.remove(screenshot_path)
                        except Exception as e:
                            logger.debug(f"Could not remove screenshot file: {e}")
                    
                except Exception as e:
                    logger.error(f"Error processing driver {label}: {e}")
                    continue
        
        logger.info("Periodic screenshot capture completed")
    
    logger.info("Periodic screenshot thread stopped")


def check_slots(driver: webdriver.Chrome, label: str) -> None:
    """
    Check for available slots using the driver
    
    Args:
        driver: WebDriver instance
        label: Label for this driver/account
    """
    try:
        logger.info(f"Checking slots for {label}...")
        driver.get(CONFIG.tls_url)
        time.sleep(5)  # Wait for page to load
        
        # This is a placeholder - actual slot checking logic would go here
        logger.info(f"Slot check completed for {label}")
        
    except Exception as e:
        logger.error(f"Error checking slots for {label}: {e}")


def run_multi_three_accounts():
    """
    Main function to run the bot with multiple accounts
    Manages driver lifecycle and periodic screenshots
    """
    logger.info("Starting multi-account TLS slot checker...")
    
    # Stop event for graceful shutdown
    stop_event = threading.Event()
    
    # Account labels
    accounts = [
        "Salah account",
        "Second account",
        "Third account"
    ]
    
    try:
        # Initialize drivers for all accounts
        logger.info("Initializing drivers for all accounts...")
        with DRIVERS_LOCK:
            for account_label in accounts:
                try:
                    driver = setup_chrome_driver(account_label)
                    DRIVERS_MAP[account_label] = driver
                    logger.info(f"Driver initialized for {account_label}")
                except Exception as e:
                    logger.error(f"Failed to initialize driver for {account_label}: {e}")
        
        # Start periodic screenshot thread if enabled
        screenshot_thread = None
        if CONFIG.enable_periodic_screenshots:
            logger.info("Starting periodic screenshot thread...")
            screenshot_thread = threading.Thread(
                target=periodic_screenshot_thread,
                args=(stop_event,),
                daemon=True,
                name="PeriodicScreenshotThread"
            )
            screenshot_thread.start()
        
        # Initial slot check for all accounts
        with DRIVERS_LOCK:
            for label, driver in DRIVERS_MAP.items():
                check_slots(driver, label)
        
        # Send startup notification
        send_telegram_message(
            "🤖 TLS Slot Checker Bot Started\n"
            f"Accounts: {len(DRIVERS_MAP)}\n"
            f"Periodic screenshots: {'Enabled' if CONFIG.enable_periodic_screenshots else 'Disabled'}\n"
            f"Screenshot interval: {CONFIG.periodic_screenshot_interval // 60} minutes"
        )
        
        # Main loop - keep running
        logger.info("Bot is running. Press Ctrl+C to stop...")
        while True:
            time.sleep(60)  # Sleep for 1 minute
            
            # Periodic slot check (every 5 minutes)
            with DRIVERS_LOCK:
                for label, driver in list(DRIVERS_MAP.items()):
                    try:
                        check_slots(driver, label)
                    except Exception as e:
                        logger.error(f"Error in main loop for {label}: {e}")
    
    except KeyboardInterrupt:
        logger.info("Shutdown signal received...")
    
    finally:
        logger.info("Shutting down bot...")
        
        # Signal stop event to terminate periodic screenshot thread
        stop_event.set()
        
        # Wait for screenshot thread to finish
        if screenshot_thread and screenshot_thread.is_alive():
            logger.info("Waiting for screenshot thread to finish...")
            screenshot_thread.join(timeout=10)
        
        # Close all drivers
        with DRIVERS_LOCK:
            logger.info("Closing all drivers...")
            for label, driver in list(DRIVERS_MAP.items()):
                try:
                    driver.quit()
                    logger.info(f"Driver closed for {label}")
                except Exception as e:
                    logger.error(f"Error closing driver for {label}: {e}")
            DRIVERS_MAP.clear()
        
        # Send shutdown notification
        send_telegram_message("🛑 TLS Slot Checker Bot Stopped")
        
        logger.info("Bot shutdown complete")


if __name__ == '__main__':
    try:
        run_multi_three_accounts()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
