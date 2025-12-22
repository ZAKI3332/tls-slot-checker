"""
Simple test to validate the bot configuration and basic functionality
"""
import sys
import os
import threading
import time

# Add parent directory to path to import bot
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from bot import (
    Config,
    DRIVERS_MAP,
    DRIVERS_LOCK,
    send_telegram_message,
    periodic_screenshot_thread
)


def test_config():
    """Test configuration dataclass"""
    print("✓ Testing Config dataclass...")
    config = Config()
    
    assert hasattr(config, 'periodic_screenshot_interval')
    assert config.periodic_screenshot_interval == 1800
    
    assert hasattr(config, 'enable_periodic_screenshots')
    assert config.enable_periodic_screenshots == True
    
    assert hasattr(config, 'telegram_bot_token')
    assert hasattr(config, 'telegram_chat_id')
    
    print("  ✓ Config has all required attributes")
    print(f"  ✓ Screenshot interval: {config.periodic_screenshot_interval}s")
    print(f"  ✓ Periodic screenshots enabled: {config.enable_periodic_screenshots}")


def test_globals():
    """Test global variables"""
    print("\n✓ Testing global variables...")
    
    assert DRIVERS_MAP is not None
    assert isinstance(DRIVERS_MAP, dict)
    print("  ✓ DRIVERS_MAP initialized")
    
    assert DRIVERS_LOCK is not None
    assert hasattr(DRIVERS_LOCK, 'acquire') and hasattr(DRIVERS_LOCK, 'release')
    print("  ✓ DRIVERS_LOCK initialized")


def test_thread_creation():
    """Test periodic screenshot thread can be created"""
    print("\n✓ Testing thread creation...")
    
    stop_event = threading.Event()
    
    thread = threading.Thread(
        target=periodic_screenshot_thread,
        args=(stop_event,),
        daemon=True
    )
    
    assert thread is not None
    print("  ✓ Thread created successfully")
    
    # Start thread briefly
    thread.start()
    assert thread.is_alive()
    print("  ✓ Thread started successfully")
    
    # Stop thread
    stop_event.set()
    thread.join(timeout=2)
    assert not thread.is_alive()
    print("  ✓ Thread stopped gracefully")


def test_telegram_functions():
    """Test Telegram functions exist and are callable"""
    print("\n✓ Testing Telegram functions...")
    
    assert callable(send_telegram_message)
    print("  ✓ send_telegram_message is callable")
    
    # Test with empty credentials (should fail gracefully)
    result = send_telegram_message("Test message")
    assert isinstance(result, bool)
    print("  ✓ send_telegram_message returns boolean")


def test_screenshot_interval():
    """Test that screenshot interval can be configured"""
    print("\n✓ Testing screenshot interval configuration...")
    
    config = Config()
    
    # Test default value
    assert config.periodic_screenshot_interval == 1800
    print(f"  ✓ Default interval: {config.periodic_screenshot_interval}s (30 minutes)")
    
    # Test custom value
    custom_config = Config()
    custom_config.periodic_screenshot_interval = 900  # 15 minutes
    assert custom_config.periodic_screenshot_interval == 900
    print(f"  ✓ Custom interval: {custom_config.periodic_screenshot_interval}s (15 minutes)")


def main():
    """Run all tests"""
    print("=" * 60)
    print("Testing TLS Slot Checker Bot - Periodic Screenshots Feature")
    print("=" * 60)
    
    try:
        test_config()
        test_globals()
        test_thread_creation()
        test_telegram_functions()
        test_screenshot_interval()
        
        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        return 0
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
