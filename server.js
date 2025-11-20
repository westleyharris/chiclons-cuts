const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

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

// n8n webhook URL from environment variable
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

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

        // Prepare data for n8n webhook
        const appointmentData = {
            name,
            phone,
            haircutType: haircutName,
            date,
            time,
            timestamp: new Date().toISOString()
        };

        // Send webhook to n8n
        if (N8N_WEBHOOK_URL) {
            try {
                console.log('📤 Sending webhook to n8n:', N8N_WEBHOOK_URL);
                console.log('📦 Data being sent:', JSON.stringify(appointmentData, null, 2));
                
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(appointmentData)
                });

                const responseText = await response.text();
                console.log('📥 n8n response status:', response.status);
                console.log('📥 n8n response:', responseText);

                if (!response.ok) {
                    throw new Error(`n8n webhook returned ${response.status}: ${responseText}`);
                }

                console.log('✅ Webhook sent to n8n successfully');
            } catch (webhookError) {
                console.error('❌ Error sending webhook to n8n:', webhookError.message);
                console.error('❌ Full error:', webhookError);
                // Continue anyway - return success to user
            }
        } else {
            console.warn('⚠️  N8N_WEBHOOK_URL not set. Webhook not sent.');
        }

        res.json({
            success: true,
            message: 'Appointment booked successfully!',
            appointment: appointmentData
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
        n8nWebhook: !!N8N_WEBHOOK_URL
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 n8n Webhook: ${N8N_WEBHOOK_URL ? 'Configured' : 'Not configured'}`);
});
