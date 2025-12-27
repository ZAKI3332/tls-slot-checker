#!/bin/bash

# Setup script for ZAKI3332's TLS Booking Bot
# This script will create your configuration with your credentials

echo "🚀 TLS Booking Bot Setup - Auto-Login Configuration"
echo "===================================================="
echo ""

# Check if config.js already exists
if [ -f "config.js" ]; then
    echo "⚠️  config.js already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Your existing config.js is unchanged."
        exit 1
    fi
fi

# Copy from example
cp config.example.js config.js

# Use sed to update the configuration
# Update formGroupId
sed -i "s/formGroupId: '1645832'/formGroupId: '1651036'/" config.js

# Update email
sed -i "s/email: 'your.email@example.com'/email: 'amourfaycal1@outlook.com'/" config.js

# Update password
sed -i "s/password: ''/password: 'Visa@1990'/" config.js

# Update autoBook to true (if not already)
sed -i "s/autoBook: true/autoBook: true/" config.js

echo "✅ Configuration file created: config.js"
echo ""
echo "✅ Pre-configured settings:"
echo "   📧 Email: amourfaycal1@outlook.com"
echo "   🔑 Password: ******** (Visa@1990)"
echo "   🆔 Form Group ID: 1651036"
echo "   🤖 Auto-login: ENABLED"
echo "   📅 Auto-booking: ENABLED"
echo ""
echo "⚠️  IMPORTANT: Now edit config.js and fill in:"
echo "   - firstName (line ~39): YOUR_FIRST_NAME → Your actual first name"
echo "   - lastName (line ~40): YOUR_LAST_NAME → Your actual last name"
echo "   - phone (line ~42): +213XXXXXXXXX → Your actual phone number"
echo ""
echo "📝 Quick edit command:"
echo "   nano config.js    (or use any text editor)"
echo ""
echo "▶️  After editing, run:"
echo "   npm install       (if not done yet)"
echo "   npm run bot       (to start the bot)"
echo ""
echo "🎯 The bot will automatically login and book appointments!"

