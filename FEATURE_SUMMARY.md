# Periodic Screenshot Notifications - Feature Summary

## Overview
This feature automatically captures and sends screenshots from all active browser sessions every 30 minutes to monitor the bot's operation via Telegram.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Main Thread                          │
│  - Initializes drivers for multiple accounts           │
│  - Manages driver lifecycle                            │
│  - Performs slot checking                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ starts
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Periodic Screenshot Thread                 │
│  - Runs independently in background                     │
│  - Wakes every 30 minutes (configurable)               │
│  - Iterates through DRIVERS_MAP                        │
│  - Captures screenshots                                │
│  - Sends to Telegram                                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ uses
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  DRIVERS_MAP (shared)                   │
│  - Protected by DRIVERS_LOCK                           │
│  - Stores active WebDriver instances                   │
│  - Thread-safe access                                  │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Configuration (`Config` dataclass)
```python
@dataclass
class Config:
    periodic_screenshot_interval: int = 1800  # 30 minutes
    enable_periodic_screenshots: bool = True
    telegram_bot_token: str = ...
    telegram_chat_id: str = ...
```

### 2. Thread-Safe Driver Storage
```python
DRIVERS_MAP: Dict[str, webdriver.Chrome] = {}
DRIVERS_LOCK = threading.Lock()
```

### 3. Periodic Screenshot Thread
```python
def periodic_screenshot_thread(stop_event: threading.Event):
    """
    - Runs in background
    - Wakes every CONFIG.periodic_screenshot_interval seconds
    - Locks DRIVERS_MAP for safe access
    - Captures and sends screenshots
    - Handles errors gracefully
    """
```

### 4. Integration Point
```python
def run_multi_three_accounts():
    # Initialize drivers
    # Start periodic screenshot thread
    screenshot_thread = threading.Thread(
        target=periodic_screenshot_thread,
        args=(stop_event,),
        daemon=True
    )
    screenshot_thread.start()
    
    # Main loop...
    
    # Cleanup
    stop_event.set()
    screenshot_thread.join(timeout=10)
```

## Flow Diagram

```
Start Bot
   │
   ├─→ Initialize Drivers (account1, account2, account3)
   │     └─→ Store in DRIVERS_MAP
   │
   ├─→ Start Periodic Screenshot Thread
   │     │
   │     └─→ Loop:
   │           ├─→ Wait 30 minutes (interruptible)
   │           ├─→ Lock DRIVERS_MAP
   │           ├─→ For each driver:
   │           │     ├─→ Capture screenshot
   │           │     ├─→ Generate caption
   │           │     └─→ Send to Telegram
   │           └─→ Unlock DRIVERS_MAP
   │
   ├─→ Main Loop (slot checking)
   │
   └─→ Shutdown:
         ├─→ Set stop_event
         ├─→ Wait for screenshot thread
         └─→ Close all drivers
```

## Screenshot Caption Example

```
📸 Periodic Check (30min)
Account: Salah account
Time: 2025-12-22 14:30:45
URL: https://visas-be.tlscontact.com/appointment/dz/dzALG2be/...
```

## Error Handling

### Scenario 1: Driver Failure
- **Issue**: Driver becomes unresponsive or crashes
- **Handling**: Log error, skip that driver, continue with others
- **Result**: Other drivers continue sending screenshots

### Scenario 2: Screenshot Capture Failure
- **Issue**: Cannot capture screenshot from a driver
- **Handling**: Log error, skip that driver
- **Result**: Thread continues running

### Scenario 3: Telegram Send Failure
- **Issue**: Network error or API failure
- **Handling**: Log error, don't crash thread
- **Result**: Thread continues for next interval

### Scenario 4: Graceful Shutdown
- **Trigger**: Ctrl+C or exception in main thread
- **Handling**: 
  1. Set stop_event
  2. Screenshot thread exits immediately (doesn't wait for interval)
  3. Join thread with 10-second timeout
  4. Close all drivers
  5. Send shutdown notification

## Thread Safety

### DRIVERS_LOCK Usage
```python
# Thread 1 (Main): Adding/removing drivers
with DRIVERS_LOCK:
    DRIVERS_MAP[label] = driver

# Thread 2 (Screenshot): Reading drivers
with DRIVERS_LOCK:
    for label, driver in list(DRIVERS_MAP.items()):
        # Process driver safely
```

### Why Thread-Safe?
- Multiple threads access DRIVERS_MAP concurrently
- Main thread may modify (add/remove drivers)
- Screenshot thread reads and iterates
- Lock prevents race conditions

## Configuration Examples

### Example 1: Quick Screenshots (15 min)
```python
CONFIG.periodic_screenshot_interval = 900
```

### Example 2: Hourly Screenshots
```python
CONFIG.periodic_screenshot_interval = 3600
```

### Example 3: Disable Feature
```python
CONFIG.enable_periodic_screenshots = False
```

### Example 4: Headless Mode
```python
CONFIG.headless = True
```

## Benefits

✅ **Monitoring**: Continuous visibility into bot status
✅ **Debugging**: Visual evidence of UI state
✅ **Detection**: Identify blocks, errors, or UI changes
✅ **Automation**: No manual intervention required
✅ **Reliability**: Graceful error handling
✅ **Flexibility**: Configurable interval and behavior

## Testing

Run the test suite:
```bash
python test_bot.py
```

Tests verify:
- ✅ Config dataclass attributes
- ✅ Global variables initialization
- ✅ Thread creation and lifecycle
- ✅ Telegram functions
- ✅ Interval configuration

## Files Modified/Created

| File | Purpose | Size |
|------|---------|------|
| `bot.py` | Main implementation | 14KB |
| `test_bot.py` | Test suite | 3.9KB |
| `example_usage.py` | Usage examples | 3.2KB |
| `requirements.txt` | Dependencies | 59B |
| `.gitignore` | Git ignore rules | 402B |
| `README.md` | Documentation | 4.8KB |
| `QUICKSTART.md` | Quick start guide | 3.2KB |

## Dependencies

```
selenium>=4.15.0         # Browser automation
requests>=2.31.0         # Telegram API calls
webdriver-manager>=4.0.0 # Automatic ChromeDriver management
```

## Deployment Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Set Telegram credentials: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- [ ] Configure screenshot interval if needed
- [ ] Test with `python test_bot.py`
- [ ] Run bot: `python bot.py`
- [ ] Verify first screenshot received within 30 minutes
- [ ] Monitor logs for errors

## Future Enhancements

Potential improvements:
- 📊 Add screenshot comparison to detect changes
- 🔔 Alert on screenshot failures after N attempts
- 📁 Option to store screenshots locally for history
- 🎨 Add more metadata (memory usage, CPU, etc.)
- 🔄 Configurable retry logic for failed sends
- 📈 Statistics on screenshot success rate

---

**Status**: ✅ Fully Implemented and Tested
**Version**: 1.0.0
**Last Updated**: 2025-12-22
