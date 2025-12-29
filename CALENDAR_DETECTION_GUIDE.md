# Calendar Detection Guide for TLS Contact

## Problem: Calendar Elements Not Found

If you're seeing errors like:
- "Calendar elements not found"
- "ERR_ABORTED at https://visas-be.tlscontact.com/..."

This means the bot needs to learn the exact HTML structure of YOUR TLS Contact appointment page.

## Solution: Help the Bot Find the Calendar

### Step 1: Inspect Your Page

1. **Open your appointment URL in Chrome:**
   ```
   https://visas-be.tlscontact.com/appointment/dz/dzALG2be/YOUR_FORM_GROUP_ID
   ```

2. **Login to your account**

3. **Right-click on the calendar** and select "Inspect" (or press F12)

4. **Find the calendar container in the HTML**
   - Look for elements with classes like:
     - `calendar`, `appointment-calendar`, `datepicker`
     - `calendar-day`, `day-cell`, `date-cell`
     - `available`, `disabled`, `unavailable`

### Step 2: Document the Structure

Please provide me with:

1. **Calendar Container:**
   ```html
   <div class="WHAT_CLASS_IS_HERE">
     <!-- This is the main calendar wrapper -->
   </div>
   ```

2. **Day Cells (for dates):**
   ```html
   <td class="WHAT_CLASS_IS_HERE" data-date="2024-01-15">
     <!-- This represents one day -->
   </td>
   ```

3. **Available vs Unavailable:**
   - What class or attribute indicates a day is AVAILABLE?
   - What class or attribute indicates a day is UNAVAILABLE?
   - Example:
     ```html
     <td class="day available">     <!-- Available -->
     <td class="day disabled">      <!-- Not available -->
     ```

4. **Time Slots (if shown):**
   ```html
   <button class="WHAT_CLASS_IS_HERE">10:00 AM</button>
   ```

5. **No Slots Message:**
   - When there are NO appointments, what text appears?
   - What element contains this text?
   - Example: "No appointments available" or "Aucun rendez-vous disponible"

### Step 3: Share with Me

Once you have this info, share it in a comment like this:

```
@copilot Calendar structure found:
- Container: <div class="calendar-wrapper">
- Day cells: <td class="calendar-day" data-date="...">
- Available class: "available"
- Disabled class: "disabled"
- No slots message: <div class="alert">No appointments available</div>
```

### Step 4: I'll Update the Code

With this information, I can update the bot to use the exact selectors for YOUR TLS Contact page.

## Temporary Workaround: Visual Mode

If you want to see what's happening:

1. **Edit browser-booking-bot.js**
2. **Find line 27:** `headless: 'new',`
3. **Change to:** `headless: false,`
4. **Run the bot** - you'll see the browser window
5. **Watch what it's doing** - helps with debugging

## Common TLS Contact Structures

Here are patterns I've seen on different TLS Contact sites:

### Pattern 1: Standard Calendar
```html
<table class="calendar">
  <td class="day available" data-date="2024-01-15">
    <span>15</span>
  </td>
  <td class="day disabled" data-date="2024-01-16">
    <span>16</span>
  </td>
</table>
```

### Pattern 2: Angular-based
```html
<div class="appointment-calendar">
  <button class="calendar-day" [ngClass]="{'available': hasSlots}">
    <span>15</span>
  </button>
</div>
```

### Pattern 3: React-based
```html
<div data-testid="calendar">
  <div class="day" data-available="true" data-date="2024-01-15">
    15
  </div>
</div>
```

## Current Detection Logic

The bot currently tries these selectors (in order):

1. `td.calendar-day:not(.disabled):not(.unavailable)`
2. `button.calendar-day:not(:disabled)`
3. `.day-cell.available`
4. `[data-available="1"]`
5. `[data-available="true"]`
6. `a.appointment-slot`
7. `button.appointment-slot`

If none of these match YOUR page, we need to add the correct ones!

## Need More Help?

If you're not comfortable with HTML inspection, you can:

1. **Take screenshots** of:
   - The calendar view
   - The browser DevTools with the calendar element selected

2. **Run in visual mode** (see above) and take a video

3. **Share the output** when you run the bot - it helps with debugging

The key is finding the exact HTML structure your TLS Contact center uses!
