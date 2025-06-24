# Google Calendar Integration Setup Guide

This guide will walk you through setting up Google Calendar integration for Chiclon's Cuts website.

## 🚀 **Step 1: Set Up Google Cloud Project**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Click "Select a project" → "New Project"**
3. **Name:** `Chiclons Cuts Website`
4. **Click "Create"**

## 🔧 **Step 2: Enable Google Calendar API**

1. **In your project, go to "APIs & Services" → "Library"**
2. **Search for "Google Calendar API"**
3. **Click on it and press "Enable"**

## 🔑 **Step 3: Create OAuth 2.0 Credentials**

1. **Go to "APIs & Services" → "Credentials"**
2. **Click "Create Credentials" → "OAuth 2.0 Client IDs"**
3. **Choose "Web application"**
4. **Name:** `Chiclons Cuts Website`
5. **Authorized JavaScript origins:**
   - `http://localhost:3000` (for testing)
   - `https://westleyharris.github.io` (for live site)
6. **Authorized redirect URIs:**
   - `http://localhost:3000/auth/google/callback`
7. **Click "Create"**
8. **Download the JSON file** (save as `credentials.json`)

## 📧 **Step 4: Set Up Gmail App Password**

1. **Go to [Google Account Settings](https://myaccount.google.com/)**
2. **Security → 2-Step Verification** (enable if not already)
3. **Security → App passwords**
4. **Generate app password for "Mail"**
5. **Copy the 16-character password**

## 📁 **Step 5: Install Dependencies**

```bash
npm install
```

## ⚙️ **Step 6: Configure Environment Variables**

1. **Copy `env.example` to `.env`**
2. **Fill in your credentials:**

```env
# Google Calendar API Credentials
GOOGLE_CLIENT_ID=your_client_id_from_step_3
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_3
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Gmail for sending emails
EMAIL_USER=danielcardo1535@gmail.com
EMAIL_PASS=your_16_character_app_password

# Calendar ID (usually 'primary' for main calendar)
CALENDAR_ID=primary

# Server port
PORT=3000
```

## 🔐 **Step 7: Get Google Calendar Access Token**

1. **Run the server:**
   ```bash
   npm start
   ```

2. **Open your browser to:** `http://localhost:3000/auth/google`

3. **Sign in with danielcardo1535@gmail.com**

4. **Grant calendar permissions**

5. **Copy the access token from the response**

## 🚀 **Step 8: Test the Integration**

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open:** `http://localhost:3000`

3. **Try booking an appointment**

4. **Check:**
   - ✅ Appointment appears in Google Calendar
   - ✅ Confirmation email sent to client
   - ✅ Notification email sent to Chiclon

## 🌐 **Step 9: Deploy to Production**

### Option A: Deploy Backend to Heroku

1. **Create Heroku account**
2. **Install Heroku CLI**
3. **Create new app:**
   ```bash
   heroku create chiclons-cuts-backend
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set GOOGLE_CLIENT_ID=your_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret
   heroku config:set EMAIL_USER=danielcardo1535@gmail.com
   heroku config:set EMAIL_PASS=your_app_password
   heroku config:set CALENDAR_ID=primary
   ```

5. **Deploy:**
   ```bash
   git add .
   git commit -m "Add backend"
   git push heroku main
   ```

6. **Update frontend API URL in `script.js`:**
   ```javascript
   const apiUrl = 'https://chiclons-cuts-backend.herokuapp.com';
   ```

### Option B: Deploy to Railway

1. **Go to [Railway.app](https://railway.app/)**
2. **Connect your GitHub repository**
3. **Set environment variables**
4. **Deploy automatically**

## 📋 **What Happens When Someone Books**

1. **Client fills out appointment form**
2. **Backend validates the data**
3. **Creates Google Calendar event**
4. **Sends confirmation email to client**
5. **Sends notification email to Chiclon**
6. **Shows success message to client**

## 🔧 **Troubleshooting**

### Common Issues:

**"Invalid credentials"**
- Check your Google Client ID and Secret
- Make sure Calendar API is enabled

**"Email not sending"**
- Verify Gmail app password is correct
- Check 2-factor authentication is enabled

**"Calendar access denied"**
- Make sure you granted calendar permissions
- Check the calendar ID is correct

**"CORS errors"**
- Add your domain to authorized origins in Google Cloud Console

## 📞 **Support**

If you run into issues:
1. Check the server logs
2. Verify all environment variables are set
3. Test the Google Calendar API separately
4. Check Gmail app password is working

## 🎉 **Success!**

Once everything is working:
- ✅ Appointments automatically appear in Chiclon's Google Calendar
- ✅ Clients get confirmation emails
- ✅ Chiclon gets notification emails
- ✅ Calendar reminders are set up automatically
- ✅ Everything works on mobile and desktop

Your barber shop now has a professional booking system! 🎯 