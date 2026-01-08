# TLS Slot Checker Bot

Automated TLS appointment slot checker with Telegram notifications and periodic screenshot monitoring.

## Features

- 🔍 **Multi-Account Support**: Monitor slots across multiple accounts simultaneously
- 📸 **Periodic Screenshots**: Automatically capture and send screenshots every 30 minutes
- 📱 **Telegram Integration**: Real-time notifications and screenshot delivery
- 🔄 **Continuous Monitoring**: 24/7 slot availability checking
- 🛡️ **Error Handling**: Graceful handling of driver failures and network issues

## Installation

### Prerequisites

- Python 3.8 or higher
- Chrome browser
- ChromeDriver (automatically managed by webdriver-manager)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ZAKI3332/tls-slot-checker.git
cd tls-slot-checker
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
export TELEGRAM_BOT_TOKEN="your_bot_token_here"
export TELEGRAM_CHAT_ID="your_chat_id_here"
```

Or create a `.env` file with:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## Usage

### Python Bot (with Selenium and Screenshots)

Run the multi-account bot with periodic screenshots:

```bash
python bot.py
```

The bot will:
- Initialize browser drivers for multiple accounts
- Start periodic screenshot capture (every 30 minutes by default)
- Monitor slot availability continuously
- Send screenshots and notifications to Telegram

### Node.js Checker (Simple API Monitor)

For lightweight API-only checking:

```bash
npm install
npm start
```

## Configuration

Edit the `Config` dataclass in `bot.py` to customize:

```python
@dataclass
class Config:
    # Telegram settings
    telegram_bot_token: str = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    telegram_chat_id: str = os.environ.get('TELEGRAM_CHAT_ID', '')
    
    # Periodic screenshot settings
    periodic_screenshot_interval: int = 1800  # 30 minutes in seconds
    enable_periodic_screenshots: bool = True
    
    # TLScontact settings
    tls_url: str = 'https://visas-be.tlscontact.com/appointment/...'
    
    # WebDriver settings
    headless: bool = False
    screenshot_dir: str = '/tmp/screenshots'
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `periodic_screenshot_interval` | int | 1800 | Interval between screenshots (seconds) |
| `enable_periodic_screenshots` | bool | True | Enable/disable periodic screenshots |
| `headless` | bool | False | Run browser in headless mode |
| `screenshot_dir` | str | /tmp/screenshots | Directory for temporary screenshots |

## Periodic Screenshot Feature

The bot automatically captures screenshots from all active browser sessions at regular intervals:

- **Interval**: Configurable (default: 30 minutes)
- **Thread-Safe**: Uses locks to safely access driver instances
- **Graceful Shutdown**: Properly stops on Ctrl+C
- **Error Handling**: Continues if one driver fails
- **Auto-Cleanup**: Removes screenshot files after sending

### Screenshot Caption Format

Each screenshot is sent with metadata:
```
📸 Periodic Check (30min)
Account: Salah account
Time: 2025-12-22 14:30:45
URL: https://visas-be.tlscontact.com/appointment/...
```

## Architecture

### Threading Model

- **Main Thread**: Manages driver lifecycle and slot checking
- **Screenshot Thread**: Runs independently, captures periodic screenshots
- **Stop Event**: Coordinates graceful shutdown across threads

### Driver Management

- `DRIVERS_MAP`: Global dictionary storing active WebDriver instances
- `DRIVERS_LOCK`: Threading lock for safe concurrent access
- Automatic cleanup on shutdown

### Error Handling

- Driver failures are logged and skipped
- Telegram send failures are logged but don't crash threads
- Network errors are caught and reported

## Troubleshooting

### Screenshots Not Sending

1. Verify Telegram credentials are set
2. Check screenshot directory permissions
3. Ensure drivers are initialized properly

### Driver Initialization Fails

1. Verify Chrome browser is installed
2. Check ChromeDriver compatibility
3. Try running in headless mode

### High Memory Usage

1. Reduce number of concurrent accounts
2. Enable headless mode
3. Decrease screenshot interval

## Development

### Project Structure

```
tls-slot-checker/
├── bot.py              # Main Python bot with Selenium
├── index.js            # Simple Node.js API checker
├── requirements.txt    # Python dependencies
├── package.json        # Node.js dependencies
├── .gitignore         # Git ignore patterns
└── README.md          # This file
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.