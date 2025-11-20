const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
app.use(express.static('.'));

// Google Calendar Service Account setup (MUCH SIMPLER than OAuth!)
let calendar;
try {
    // Option 1: Load service account from JSON file
    const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        const auth = new google.auth.JWT(
            serviceAccount.client_email,
            null,
            serviceAccount.private_key,
            ['https://www.googleapis.com/auth/calendar']
        );
        calendar = google.calendar({ version: 'v3', auth });
        console.log('✅ Google Calendar Service Account loaded from file');
    } 
    // Option 2: Load from environment variable (for Railway)
    else if (process.env.GOOGLE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
        const auth = new google.auth.JWT(
            serviceAccount.client_email,
            null,
            serviceAccount.private_key,
            ['https://www.googleapis.com/auth/calendar']
        );
        calendar = google.calendar({ version: 'v3', auth });
        console.log('✅ Google Calendar Service Account loaded from environment');
    } else {
        console.warn('⚠️  No service account found. Calendar events will be skipped.');
        console.log('💡 To enable calendar: Create a service account and share your calendar with it.');
    }
} catch (error) {
    console.error('❌ Error loading service account:', error.message);
    console.log('💡 Calendar events will be skipped. Emails will still work.');
}

// Email setup
const EMAIL_USER = process.env.EMAIL_USER || 'danielcardo1535@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter = null;
if (EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
    console.log('✅ Email configured');
} else {
    console.warn('⚠️  EMAIL_PASS not set. Emails will not be sent.');
}

// Calendar ID - the email of the calendar you want to add events to
const CALENDAR_EMAIL = process.env.CALENDAR_EMAIL || 'danielcardo1535@gmail.com';

// Haircut type mapping
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

        // Validate
        if (!name || !phone || !haircutType || !date || !time) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        const haircutName = haircutTypeNames[haircutType] || haircutType;
        const eventDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(eventDateTime.getTime() + (60 * 60 * 1000));

        // Add to calendar (if service account is configured)
        let calendarEventId = null;
        if (calendar) {
            try {
                const event = {
                    summary: `${name} - ${haircutName}`,
                    description: `Client: ${name}\nPhone: ${phone}\nHaircut: ${haircutName}`,
                    start: {
                        dateTime: eventDateTime.toISOString(),
                        timeZone: 'America/Chicago',
                    },
                    end: {
                        dateTime: endDateTime.toISOString(),
                        timeZone: 'America/Chicago',
                    },
                };

                // Try using the calendar email as the calendar ID
                const calendarResponse = await calendar.events.insert({
                    calendarId: CALENDAR_EMAIL,
                    resource: event,
                });
                calendarEventId = calendarResponse.data.id;
                console.log('✅ Calendar event created:', calendarEventId);
            } catch (calendarError) {
                console.error('❌ Calendar error:', calendarError.message);
                console.error('❌ Calendar details:', {
                    calendarId: CALENDAR_EMAIL,
                    errorCode: calendarError.code,
                    errorResponse: calendarError.response?.data
                });
                // Continue even if calendar fails - still send emails
            }
        }

        // Send emails
        if (transporter) {
            const formattedDate = new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const formatTime = (timeString) => {
                const [hours] = timeString.split(':');
                const hour = parseInt(hours);
                return hour === 12 ? '12:00 PM' : 
                       hour > 12 ? (hour - 12) + ':00 PM' : 
                       hour + ':00 AM';
            };

            const emailHtml = `
                <h2>New Appointment Booked!</h2>
                <p><strong>Client Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Haircut Type:</strong> ${haircutName}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formatTime(time)}</p>
                <br>
                ${calendarEventId ? '<p>✅ Added to calendar</p>' : ''}
                <p><strong>Location:</strong> 5723 Sandshell Dr, Fort Worth, TX 76137</p>
                <p><strong>Phone:</strong> (346) 390-9960</p>
            `;

            // Send to both emails
            try {
                await transporter.sendMail({
                    from: EMAIL_USER,
                    to: 'danielcardo1535@gmail.com, westley.harris11@gmail.com',
                    subject: `New Appointment: ${name} - ${haircutName}`,
                    html: emailHtml
                });
                console.log('✅ Emails sent');
            } catch (emailError) {
                console.error('❌ Email error:', emailError.message);
                console.error('❌ Email error code:', emailError.code);
                // Continue even if email fails
            }
        }

        res.json({
            success: true,
            message: 'Appointment booked successfully!',
            appointment: { name, phone, haircutType: haircutName, date, time }
        });

    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error booking appointment. Please try again.'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        calendar: !!calendar,
        email: !!transporter
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email: ${EMAIL_USER}`);
    console.log(`📅 Calendar: ${calendar ? 'Enabled' : 'Disabled'}`);
});
