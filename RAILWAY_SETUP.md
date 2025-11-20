# Railway Deployment Setup Guide

This guide will help you deploy the backend to Railway and connect it to your frontend.

## Step 1: Deploy to Railway

1. **Go to [Railway.app](https://railway.app/)**
2. **Create a new project** (or use existing)
3. **Click "New" → "GitHub Repo"**
4. **Select your repository**
5. **Railway will automatically detect the Node.js app and deploy it**

## Step 2: Set Environment Variables

In your Railway project dashboard:

1. Go to your service → **Variables** tab
2. Add these environment variables:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
EMAIL_USER=danielcardo1535@gmail.com
EMAIL_PASS=your_gmail_app_password_here
```

### How to get these values:

**GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET:**
- Open your `client_secret_792276807257-2i6hddj44f4200atbsj0de2qssbh30hk.apps.googleusercontent.com.json` file
- Copy `client_id` → paste as `GOOGLE_CLIENT_ID`
- Copy `client_secret` → paste as `GOOGLE_CLIENT_SECRET`

**EMAIL_PASS:**
- Go to Google Account → Security → App passwords
- Generate app password for "Mail"
- Copy the 16-character password → paste as `EMAIL_PASS`

## Step 3: Get Your Railway URL

1. In Railway dashboard, go to your service
2. Click on **Settings** → **Networking**
3. Click **Generate Domain** (or use the default one)
4. Copy the public domain (e.g., `https://your-app.railway.app`)

## Step 4: Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `https://your-railway-url.railway.app/auth/google/callback`
   - (Replace with your actual Railway URL)

## Step 5: Update Frontend to Use Backend URL

1. Open `script.js`
2. Find line 187 (the `apiUrl` line)
3. Replace `https://your-backend-url.com` with your Railway URL:
   ```javascript
   const apiUrl = isLocalhost ? 'http://localhost:3000' : 'https://your-app.railway.app';
   ```
4. Commit and push to GitHub (your frontend will redeploy)

## Step 6: Connect Google Calendar

1. Visit: `https://your-railway-url.railway.app/auth/google`
2. Sign in with `danielcardo1535@gmail.com`
3. Grant calendar permissions
4. You should see "Google Calendar Connected!"

## Step 7: Test the Booking System

1. Go to `https://chiclon.com`
2. Fill out the booking form
3. Click "Book It"
4. Check:
   - ✅ Appointment appears in Google Calendar
   - ✅ Email sent to danielcardo1535@gmail.com
   - ✅ Email sent to westley.harris11@gmail.com

## Troubleshooting

**Backend not starting:**
- Check Railway logs for errors
- Verify all environment variables are set correctly

**CORS errors:**
- Make sure `https://chiclon.com` is in the CORS origins (already configured in server.js)

**Calendar not connecting:**
- Verify redirect URI is added to Google Cloud Console
- Check Railway logs for OAuth errors

**Emails not sending:**
- Verify `EMAIL_PASS` is set correctly (16-character app password)
- Check Railway logs for email errors

## Your Railway URL

After deployment, your backend URL will be something like:
`https://chiclons-cuts-production.railway.app`

Update this in `script.js` and in Google Cloud Console redirect URIs!

