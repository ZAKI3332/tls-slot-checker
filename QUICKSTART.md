# Quick Start Guide

## Setup in 5 Minutes

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Get Telegram Credentials

1. Create a Telegram bot:
   - Message [@BotFather](https://t.me/BotFather) on Telegram
   - Send `/newbot` and follow instructions
   - Copy your bot token

2. Get your chat ID:
   - Message [@userinfobot](https://t.me/userinfobot)
   - Copy your chat ID

### 3. Set Environment Variables

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token_here"
export TELEGRAM_CHAT_ID="your_chat_id_here"
```

Or create a `.env` file:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 4. Run the Bot

**Default Configuration (30-minute screenshots):**
```bash
python bot.py
```

**Custom Configuration:**
```bash
python example_usage.py
```

## What Happens Next?

1. Bot initializes browser drivers for 3 accounts
2. Starts periodic screenshot thread (runs every 30 minutes)
3. Sends screenshots to your Telegram with:
   - Account name
   - Current time
   - Current URL
   - Screenshot of browser window

## Customization

Edit `bot.py` to change:

```python
@dataclass
class Config:
    # Change screenshot interval (seconds)
    periodic_screenshot_interval: int = 1800  # 30 minutes
    
    # Enable/disable periodic screenshots
    enable_periodic_screenshots: bool = True
    
    # Run browser in background (no window)
    headless: bool = False
    
    # Screenshot storage location
    screenshot_dir: str = '/tmp/screenshots'
```

## Stopping the Bot

Press `Ctrl+C` - the bot will:
1. Stop the screenshot thread gracefully
2. Close all browser drivers
3. Send a shutdown notification to Telegram

## Troubleshooting

### "No module named 'selenium'"
```bash
pip install -r requirements.txt
```

### "ChromeDriver not found"
The bot uses `webdriver-manager` which automatically downloads ChromeDriver. Ensure Chrome/Chromium is installed:

```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser

# MacOS
brew install chromium
```

### "Telegram credentials not configured"
Check that environment variables are set:
```bash
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID
```

### Screenshots not sending
1. Verify Telegram credentials
2. Check bot logs for errors
3. Ensure drivers are initialized successfully

## Testing

Run the test suite:
```bash
python test_bot.py
```

Expected output:
```
============================================================
Testing TLS Slot Checker Bot - Periodic Screenshots Feature
============================================================
✓ Testing Config dataclass...
✓ Testing global variables...
✓ Testing thread creation...
✓ Testing Telegram functions...
✓ Testing screenshot interval configuration...
============================================================
✅ All tests passed!
============================================================
```

## Next Steps

- Customize account labels in `run_multi_three_accounts()`
- Adjust screenshot interval for your needs
- Modify slot checking logic in `check_slots()`
- Add more sophisticated Telegram notifications

## Support

For issues or questions, please open an issue on GitHub.
