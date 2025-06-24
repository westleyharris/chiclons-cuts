const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Load Google OAuth credentials from JSON file
const credentialsPath = path.join(__dirname, 'client_secret_792276807257-2i6hddj44f4200atbsj0de2qssbh30hk.apps.googleusercontent.com.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Google Calendar setup
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = 'primary'; // Use primary calendar

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    'http://localhost:3000/auth/google/callback'
);

// Store tokens (in production, use a database)
let accessToken = null;
let refreshToken = null;

// Email transporter setup (will be configured after getting app password)
let transporter = null;

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
app.post('/configure-email', (req, res) => {
    const { emailPassword } = req.body;
    
    if (!emailPassword) {
        return res.status(400).json({ success: false, message: 'Email password required' });
    }
    
    transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: 'danielcardo1535@gmail.com',
            pass: emailPassword
        }
    });
    
    res.json({ success: true, message: 'Email configured successfully' });
});

// Book appointment endpoint
app.post('/api/book-appointment', async (req, res) => {
    try {
        const { name, email, phone, service, date, time, notes } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !service || !date || !time) {
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

        // Create calendar event
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const eventDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(eventDateTime.getTime() + (60 * 60 * 1000)); // 1 hour duration

        const event = {
            summary: `Appointment: ${name} - ${service}`,
            description: `
                Client: ${name}
                Email: ${email}
                Phone: ${phone}
                Service: ${service}
                Notes: ${notes || 'None'}
            `,
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

        // Send emails if transporter is configured
        if (transporter) {
            // Send confirmation email to client
            const clientMailOptions = {
                from: 'danielcardo1535@gmail.com',
                to: email,
                subject: 'Appointment Confirmed - Chiclon\'s Cuts',
                html: `
                    <h2>Your appointment is confirmed!</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Service:</strong> ${service}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Location:</strong> 5723 Sandshell Dr, Fort Worth, TX 76137</p>
                    <p><strong>Phone:</strong> (346) 390-9960</p>
                    <br>
                    <p>See you soon!</p>
                    <p>- Chiclon's Cuts</p>
                `
            };

            // Send notification email to Chiclon
            const chiclonMailOptions = {
                from: 'danielcardo1535@gmail.com',
                to: 'danielcardo1535@gmail.com',
                subject: 'New Appointment Booked - Chiclon\'s Cuts',
                html: `
                    <h2>New appointment booked!</h2>
                    <p><strong>Client:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Service:</strong> ${service}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Notes:</strong> ${notes || 'None'}</p>
                    <br>
                    <p>This appointment has been added to your Google Calendar.</p>
                `
            };

            // Send emails
            await transporter.sendMail(clientMailOptions);
            await transporter.sendMail(chiclonMailOptions);
        }

        res.json({
            success: true,
            message: 'Appointment booked successfully!',
            eventId: calendarResponse.data.id,
            appointment: {
                name,
                email,
                phone,
                service,
                date,
                time,
                notes
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
    console.log(`📅 Calendar integration: ${CALENDAR_ID}`);
    console.log(`📧 Email notifications: danielcardo1535@gmail.com`);
    console.log(`🔗 Connect calendar: http://localhost:${PORT}/auth/google`);
}); 