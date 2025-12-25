@echo off
REM Setup script for ZAKI3332's TLS Booking Bot (Windows)
REM This script will create your configuration with your credentials

echo 🚀 TLS Booking Bot Setup - Auto-Login Configuration
echo ====================================================
echo.

REM Check if config.js already exists
if exist config.js (
    echo ⚠️  config.js already exists!
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo ❌ Setup cancelled. Your existing config.js is unchanged.
        exit /b 1
    )
)

REM Copy from example
copy config.example.js config.js >nul

REM Use PowerShell to update the configuration
powershell -Command "(Get-Content config.js) -replace \"formGroupId: '1645832'\", \"formGroupId: '1651036'\" | Set-Content config.js"
powershell -Command "(Get-Content config.js) -replace \"email: 'your.email@example.com'\", \"email: 'amourfaycal1@outlook.com'\" | Set-Content config.js"
powershell -Command "(Get-Content config.js) -replace \"password: ''\", \"password: 'Visa@1990'\" | Set-Content config.js"

echo ✅ Configuration file created: config.js
echo.
echo ✅ Pre-configured settings:
echo    📧 Email: amourfaycal1@outlook.com
echo    🔑 Password: ******** (Visa@1990)
echo    🆔 Form Group ID: 1651036
echo    🤖 Auto-login: ENABLED
echo    📅 Auto-booking: ENABLED
echo.
echo ⚠️  IMPORTANT: Now edit config.js and fill in:
echo    - firstName (line ~39): YOUR_FIRST_NAME → Your actual first name
echo    - lastName (line ~40): YOUR_LAST_NAME → Your actual last name
echo    - phone (line ~42): +213XXXXXXXXX → Your actual phone number
echo.
echo 📝 Quick edit: Open config.js in Notepad or any text editor
echo.
echo ▶️  After editing, run:
echo    npm install       (if not done yet)
echo    npm run bot       (to start the bot)
echo.
echo 🎯 The bot will automatically login and book appointments!
echo.

pause
