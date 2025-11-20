# Simple Setup Guide (No OAuth!)

This is a MUCH simpler setup that doesn't require OAuth flows or refresh tokens.

## What You Need:

1. **Email** - Just need Gmail app password (already have this)
2. **Calendar** - Use a Service Account (one-time setup, no user interaction)

## Step 1: Create Google Service Account (One Time)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **Service Account**
4. Name it: `chiclons-cuts-calendar`
5. Click **Create and Continue**
6. Skip role assignment, click **Done**
7. Click on the service account you just created
8. Go to **Keys** tab → **Add Key** → **Create new key**
9. Choose **JSON** format
10. Download the JSON file
11. **Rename it to:** `service-account-key.json`
12. **Put it in your project folder**

## Step 2: Share Calendar with Service Account

1. Open [Google Calendar](https://calendar.google.com/)
2. Click the **Settings** gear → **Settings**
3. On the left, click **Settings for my calendars** → Select your calendar
4. Scroll down to **Share with specific people**
5. Click **Add people**
6. **Paste the service account email** (from the JSON file, it's the `client_email` field)
7. Give it **Make changes to events** permission
8. Click **Send**

## Step 3: Deploy to Railway

### Option A: Upload the JSON file (Easiest)
1. Add `service-account-key.json` to your project
2. Push to GitHub
3. Railway will use it automatically

### Option B: Use Environment Variable (More Secure)
1. Open the `service-account-key.json` file
2. Copy the entire JSON content
3. In Railway → Variables, add:
   - **Name:** `GOOGLE_SERVICE_ACCOUNT`
   - **Value:** (paste the entire JSON)
4. Delete the JSON file from your project (don't commit it)

## Step 4: Set Environment Variables in Railway

Add these to Railway:
- `EMAIL_USER` = `danielcardo1535@gmail.com` (or `westley.harris11@gmail.com`)
- `EMAIL_PASS` = (your Gmail app password)
- `CALENDAR_EMAIL` = `danielcardo1535@gmail.com` (the calendar to add events to)

## Step 5: Update package.json

Change the start script to use the simple server:
```json
"start": "node server-simple.js"
```

## That's It!

- ✅ No OAuth flow needed
- ✅ No refresh tokens
- ✅ No user interaction
- ✅ Works forever
- ✅ Much simpler!

The service account acts as a "robot" that can add events to your calendar. You just share the calendar with it once, and it works forever.

