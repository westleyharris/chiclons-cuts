const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure CORS to allow requests from production domain
const corsOptions = {
    origin: [
        'https://chiclon.com',
        'http://chiclon.com',
        'https://www.chiclon.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Load Google OAuth credentials from JSON file or environment variables
let credentials;
try {
    // Try to load from JSON file first (for local development)
    const credentialsPath = path.join(__dirname, 'client_secret_792276807257-2i6hddj44f4200atbsj0de2qssbh30hk.apps.googleusercontent.com.json');
    if (fs.existsSync(credentialsPath)) {
        credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        console.log('✅ Loaded Google credentials from JSON file');
    } else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        // Use environment variables (for Railway/production)
        credentials = {
            web: {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET
            }
        };
        console.log('✅ Loaded Google credentials from environment variables');
    } else {
        throw new Error('Google OAuth credentials not found. Please provide credentials.json or set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }
    
    // Validate credentials structure
    if (!credentials || !credentials.web || !credentials.web.client_id || !credentials.web.client_secret) {
        throw new Error('Invalid credentials structure. Missing client_id or client_secret.');
    }
} catch (error) {
    console.error('❌ Error loading Google credentials:', error.message);
    console.log('\n📋 Make sure you have either:');
    console.log('1. A client_secret_*.json file in the project root, OR');
    console.log('2. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables set');
    console.log('\n💡 For Railway deployment, set these environment variables in your Railway dashboard.');
    process.exit(1); // Exit if credentials aren't available
}

// Google Calendar setup
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = 'primary'; // Use primary calendar

// Get backend URL from environment or use default
const BACKEND_URL = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || `http://localhost:${PORT}`;
const REDIRECT_URI = `${BACKEND_URL}/auth/google/callback`;

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    REDIRECT_URI
);

// Store tokens (in production, use a database)
let accessToken = null;
let refreshToken = null;

// Email transporter setup
let transporter = null;

// Try to configure email from environment variables (for Railway/production)
const EMAIL_USER = process.env.EMAIL_USER || 'danielcardo1535@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS;

if (EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
    console.log('✅ Email transporter configured from environment variables');
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/setup', (req, res) => {
    res.sendFile(__dirname + '/setup.html');
});

// Google OAuth flow
app.get('/auth/google', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    
    try {
        const { tokens } = await oauth2Client.getToken(code);
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token;
        
        oauth2Client.setCredentials(tokens);
        
        res.send(`
            <h2>✅ Google Calendar Connected!</h2>
            <p>Your Google Calendar is now connected to Chiclon's Cuts.</p>
            <p>You can now close this window and test the booking system.</p>
            <script>
                setTimeout(() => {
                    window.close();
                }, 3000);
            </script>
        `);
        
        console.log('✅ Google Calendar access granted!');
        
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.send(`
            <h2>❌ Error Connecting to Google Calendar</h2>
            <p>Please try again or check the setup guide.</p>
        `);
    }
});

// Configure email (call this after setting up Gmail app password)
// Note: In production, use EMAIL_PASS environment variable instead
app.post('/configure-email', (req, res) => {
    const { emailPassword } = req.body;
    
    if (!emailPassword) {
        return res.status(400).json({ success: false, message: 'Email password required' });
    }
    
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: emailPassword
        }
    });
    
    res.json({ success: true, message: 'Email configured successfully' });
});

// Map haircut types to readable names
const haircutTypeNames = {
    'taper-fade': 'Taper Fade',
    'low-fade': 'Low Fade',
    'high-fade': 'High Fade',
    'mid-fade': 'Mid Fade',
    'burst-fade': 'Burst Fade',
    'mullet': 'Mullet',
    'v-fade': 'V Fade'
};

// Book appointment endpoint
app.post('/api/book-appointment', async (req, res) => {
    try {
        const { name, phone, haircutType, date, time } = req.body;

        // Validate required fields
        if (!name || !phone || !haircutType || !date || !time) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        // Check if we have calendar access
        if (!accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Google Calendar not connected. Please connect your calendar first.'
            });
        }

        // Get readable haircut type name
        const haircutName = haircutTypeNames[haircutType] || haircutType;

        // Create calendar event
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        // Parse date and time - date is in YYYY-MM-DD format, time is in HH:MM format
        const eventDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(eventDateTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

        const event = {
            summary: `${name} - ${haircutName}`,
            description: `
Client: ${name}
Phone: ${phone}
Haircut Type: ${haircutName}
Date: ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${formatTimeForDisplay(time)}
            `.trim(),
            start: {
                dateTime: eventDateTime.toISOString(),
                timeZone: 'America/Chicago', // Fort Worth timezone
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Chicago',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 30 }, // 30 minutes before
                ],
            },
        };

        // Add event to calendar
        const calendarResponse = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
        });

        // Format date for email
        const formattedDate = new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Send email notification to both emails if transporter is configured
        if (transporter) {
            const emailOptions = {
                from: 'danielcardo1535@gmail.com',
                to: 'danielcardo1535@gmail.com, westley.harris11@gmail.com',
                subject: `New Appointment: ${name} - ${haircutName}`,
                html: `
                    <h2>New Appointment Booked!</h2>
                    <p><strong>Client Name:</strong> ${name}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Haircut Type:</strong> ${haircutName}</p>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${formatTimeForDisplay(time)}</p>
                    <br>
                    <p>This appointment has been added to your Google Calendar.</p>
                    <p><strong>Location:</strong> 5723 Sandshell Dr, Fort Worth, TX 76137</p>
                    <p><strong>Your Phone:</strong> (346) 390-9960</p>
                `
            };

            // Send email to both addresses
            await transporter.sendMail(emailOptions);
        }

        res.json({
            success: true,
            message: 'Appointment booked successfully!',
            eventId: calendarResponse.data.id,
            appointment: {
                name,
                phone,
                haircutType: haircutName,
                date,
                time
            }
        });

    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error booking appointment. Please try again.'
        });
    }
});

// Helper function to format time for display
function formatTimeForDisplay(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return hour === 12 ? '12:00 PM' : 
           hour > 12 ? (hour - 12) + ':00 PM' : 
           hour + ':00 AM';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Chiclon\'s Cuts API is running',
        calendarConnected: !!accessToken,
        emailConfigured: !!transporter
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Chiclon's Cuts server running on port ${PORT}`);
    console.log(`🌐 Backend URL: ${BACKEND_URL}`);
    console.log(`📅 Calendar integration: ${CALENDAR_ID}`);
    console.log(`📧 Email notifications: ${EMAIL_USER}`);
    console.log(`🔗 Connect calendar: ${BACKEND_URL}/auth/google`);
    console.log(`✅ CORS enabled for: https://chiclon.com`);
}); 