# How the TLS Booking Bot Works

This document explains the bot's architecture and workflow.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER                                     │
│  (Provides configuration and personal information)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ config.js
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BOT.JS                                      │
│  (Main entry point - loads config, validates, starts bot)    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ starts
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               BOOKING-BOT.JS                                  │
│  (Core logic - monitoring, session, booking)                 │
│                                                               │
│  Components:                                                  │
│  • Session Management                                         │
│  • Slot Monitoring                                            │
│  • Login Handler                                              │
│  • Booking Engine                                             │
│  • Notification System                                        │
└──────┬──────────────────────────────────┬───────────────────┘
       │                                   │
       │ uses                              │ uses
       ▼                                   ▼
┌──────────────────┐            ┌──────────────────────┐
│  COOKIE-JAR.JS   │            │  TELEGRAM API         │
│  (Session mgmt)  │            │  (Notifications)      │
└──────┬───────────┘            └───────────────────────┘
       │
       │ maintains cookies for
       ▼
┌─────────────────────────────────────────────────────────────┐
│              TLS CONTACT SERVER                              │
│  (https://visas-be.tlscontact.com)                          │
│                                                               │
│  Endpoints:                                                   │
│  • GET  /appointment/{country}/{center}/{formGroupId}        │
│  • GET  /api/tls/appointment/.../table (check slots)        │
│  • POST /api/login (authentication)                          │
│  • POST /api/tls/appointment/reserve (reserve slot)         │
│  • POST /api/tls/appointment/book (book appointment)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Bot Workflow

### 1. Initialization Phase

```
START
  │
  ├─> Load config.js
  │   ├─> Validate required fields
  │   └─> Display configuration summary
  │
  ├─> Create TLSBookingBot instance
  │   └─> Initialize cookie jar
  │
  └─> Start booking bot
      └─> Enter main flow
```

### 2. Main Workflow Loop

```
┌──────────────────────────────────────────────────────────┐
│                    MAIN LOOP                              │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │  1. Initialize Session                       │        │
│  │     • Visit appointment page                 │        │
│  │     • Store session cookies                  │        │
│  └─────────────┬────────────────────────────────┘        │
│                │                                          │
│                ▼                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  2. Login (if credentials provided)          │        │
│  │     • POST credentials to login API          │        │
│  │     • Store authentication token/cookie      │        │
│  └─────────────┬────────────────────────────────┘        │
│                │                                          │
│                ▼                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  3. Check Available Slots                    │        │
│  │     • GET slot availability API              │        │
│  │     • Parse response for available slots     │        │
│  └─────────────┬────────────────────────────────┘        │
│                │                                          │
│                ▼                                          │
│           ┌─────────┐                                     │
│           │ Slots   │  NO                                 │
│           │ Found?  ├────────┐                           │
│           └────┬────┘        │                           │
│                │ YES         │                           │
│                ▼             ▼                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Send Telegram    │  │ Wait and Loop   │              │
│  │ Notification     │  │ (checkInterval) │              │
│  └────┬─────────────┘  └─────────────────┘              │
│       │                        ▲                          │
│       ▼                        │                          │
│  ┌──────────┐                 │                          │
│  │ autoBook │  NO             │                          │
│  │ Enabled? ├─────────────────┘                          │
│  └────┬─────┘                                            │
│       │ YES                                               │
│       ▼                                                   │
│  ┌─────────────────────────────────────────────┐        │
│  │  4. Reserve Slot                             │        │
│  │     • POST to reserve API                    │        │
│  │     • Get reservation ID                     │        │
│  └─────────────┬────────────────────────────────┘        │
│                │                                          │
│                ▼                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  5. Book Appointment                         │        │
│  │     • POST personal details to booking API   │        │
│  │     • Receive confirmation                   │        │
│  └─────────────┬────────────────────────────────┘        │
│                │                                          │
│                ▼                                          │
│           ┌─────────┐                                     │
│           │ Booking │  NO   ┌──────────────────┐        │
│           │Success? ├───────┤ Retry Logic       │        │
│           └────┬────┘       │ (maxRetries)      │        │
│                │ YES        └──────────────────┘        │
│                ▼                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  6. Send Success Notification                │        │
│  └─────────────┬────────────────────────────────┘        │
│                │                                          │
│                ▼                                          │
│           ┌────────────┐                                  │
│           │ stopAfter  │  YES                             │
│           │ Booking?   ├────────> STOP BOT                │
│           └────┬───────┘                                  │
│                │ NO                                        │
│                └────────> Continue Loop                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📡 API Communication Flow

### Successful Booking Flow

```
Bot                          TLS Server                    Result
│                                │                           │
├─ GET /appointment/...         │                           │
│  Initialize Session            │                           │
│                                ├─> Returns HTML + Cookies  │
│                                │   Store cookies ──────────►
│                                │                           │
├─ GET /api/.../table           │                           │
│  Check Slots                   │                           │
│                                ├─> Returns available slots │
│                                │   {date: time: count} ────►
│                                │                           │
├─ POST /api/login (optional)   │                           │
│  Authenticate                  │                           │
│                                ├─> Returns auth token      │
│                                │   Store token ────────────►
│                                │                           │
├─ POST /api/.../reserve        │                           │
│  Reserve slot                  │                           │
│  {date, time, formGroupId}    │                           │
│                                ├─> Returns reservation ID  │
│                                │   Hold slot for 15 min ───►
│                                │                           │
├─ POST /api/.../book           │                           │
│  Book appointment              │                           │
│  {personal details, slot}     │                           │
│                                ├─> Returns confirmation    │
│                                │   Booking complete! ──────►
│                                │                           │
└─ Send Telegram notification   │                           │
   User receives confirmation   └───────────────────────────►
```

### Failed Booking Scenario

```
Bot                          TLS Server                    Action
│                                │                           │
├─ POST /api/.../reserve        │                           │
│                                ├─> 409 Conflict            │
│                                │   Slot taken ─────────────┤
│                                │                           │
│  ┌──────────────┐             │                           │
│  │ Retry Logic  │             │                           │
│  │ (3 attempts) │             │                           ▼
│  └──────┬───────┘             │                    Log error
│         │                      │                           │
│         ├─ Try next slot       │                           │
│         │  or wait and retry   │                           │
│         │                      │                           │
│         └─ POST /api/.../book  │                           │
│            with different slot │                           │
│                                ├─> 200 OK                  │
│                                │   Success! ───────────────►
│                                │                           │
└─ Send success notification    └───────────────────────────►
```

---

## 🍪 Cookie Management

```
┌────────────────────────────────────────────────────────┐
│              COOKIE JAR                                 │
│                                                         │
│  Purpose: Maintain session state across requests       │
│                                                         │
│  Stored Cookies:                                        │
│  • Session ID (PHPSESSID, JSESSIONID, etc.)           │
│  • CSRF tokens                                          │
│  • Authentication tokens                                │
│  • Tracking cookies                                     │
│                                                         │
│  Lifecycle:                                             │
│  1. Receive Set-Cookie from server                     │
│  2. Parse and store cookie                             │
│  3. Include in subsequent requests                      │
│  4. Update when server sends new values                │
│  5. Clear on session end                               │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 Security & Privacy

```
┌─────────────────────────────────────────────────────────┐
│                 SECURITY MEASURES                        │
│                                                          │
│  Configuration Security:                                 │
│  • config.js is gitignored (not committed)             │
│  • Support for environment variables                    │
│  • Credentials only in memory, not logged               │
│                                                          │
│  Network Security:                                       │
│  • HTTPS only communication                             │
│  • Valid User-Agent headers                             │
│  • Session cookies properly managed                     │
│                                                          │
│  Data Privacy:                                           │
│  • No data sent to third parties (except Telegram)     │
│  • Personal info only sent to TLS server                │
│  • Cookies cleared after session                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Bot Modes Comparison

### Mode 1: Monitor Only (index.js)
```
Timer ───> Check Slots ───> Found? ───> Notify ───> Continue
  │            ▲              │ No
  │            │              └─────────────────┘
  └────────────┘ (5 minutes)
```

### Mode 2: Full Automation (bot.js)
```
Timer ───> Check Slots ───> Found? ───> Reserve ───> Book ───> Stop
  │            ▲              │ No                      │
  │            │              └─────────────────────────┘
  └────────────┘ (configurable)
```

---

## ⚡ Performance Characteristics

- **Memory Usage**: ~50-100 MB
- **CPU Usage**: Minimal (mostly idle)
- **Network Usage**: ~10-50 KB per check
- **Check Duration**: 1-3 seconds per cycle
- **Booking Speed**: 2-5 seconds (reserve + book)

---

## 🔧 Key Components Explained

### 1. booking-bot.js (Core Engine)
- Session initialization and management
- Slot checking logic
- Authentication handling
- Booking automation
- Retry and error handling
- Notification system

### 2. cookie-jar.js (Session State)
- Cookie parsing and storage
- Cookie string generation
- Session persistence

### 3. bot.js (Entry Point)
- Configuration loading and validation
- Error handling
- Graceful shutdown
- User interface (console output)

### 4. config.js (User Settings)
- Personal information
- Bot behavior configuration
- API endpoint customization
- Notification settings

---

## 🚦 Error Handling Strategy

```
┌─────────────────────────────────────────────────────────┐
│                  ERROR TYPES                             │
│                                                          │
│  Network Errors:                                         │
│  • Retry with exponential backoff                       │
│  • Log error and continue monitoring                    │
│                                                          │
│  Rate Limiting (429):                                    │
│  • Increase check interval automatically                │
│  • Wait specified time before retry                     │
│                                                          │
│  Booking Conflicts (409):                                │
│  • Try next available slot                              │
│  • Retry up to maxRetries times                         │
│                                                          │
│  Authentication Errors (401):                            │
│  • Re-login and retry                                   │
│  • Alert user if credentials invalid                    │
│                                                          │
│  Server Errors (500):                                    │
│  • Wait and retry                                       │
│  • Continue monitoring                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Success Factors

For the bot to work successfully:

1. ✅ Valid configuration (correct formGroupId, personal info)
2. ✅ Stable internet connection
3. ✅ Slots actually become available
4. ✅ Proper credentials (if login required)
5. ✅ Reasonable check interval (not rate-limited)
6. ✅ Quick booking (slots can be taken by others)
7. ✅ Correct appointment type and center

---

This architecture ensures:
- **Reliability**: Continuous monitoring with error recovery
- **Speed**: Fast booking when slots appear
- **Simplicity**: Easy configuration and operation
- **Safety**: Configurable auto-booking, secure credential handling
- **Transparency**: Detailed logging of all actions
