# Chiclon's Cuts - Barber Shop Website

A modern, responsive website for Chiclon's Cuts barber shop featuring an interactive appointment booking system, service showcase, and professional design.

## 🌟 Features

### Core Features
- **Modern Responsive Design** - Works perfectly on all devices
- **Interactive Appointment Booking** - Easy-to-use calendar and time slot selection
- **Service Showcase** - Professional presentation of barber services with pricing
- **Gallery Section** - Display of haircut styles and work examples
- **About Section** - Information about Chiclon and his experience
- **Contact Information** - Multiple ways to get in touch
- **Mobile-First Design** - Optimized for mobile devices

### Appointment System Features
- **Date Picker** - Calendar integration with business hours
- **Time Slot Selection** - Available times based on selected date
- **Form Validation** - Real-time validation and error handling
- **Success Confirmation** - Modal with appointment details
- **Calendar Integration** - Simulated integration with Chiclon's calendar
- **Email Notifications** - Simulated confirmation emails

### Technical Features
- **Smooth Animations** - CSS animations and transitions
- **Accessibility** - ARIA labels and keyboard navigation
- **Performance Optimized** - Fast loading and smooth interactions
- **Cross-Browser Compatible** - Works on all modern browsers

## 🚀 Quick Start

### Prerequisites
- A modern web browser
- Basic knowledge of HTML/CSS/JavaScript (for customization)

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/yourusername/chiclons-cuts.git
   cd chiclons-cuts
   ```

2. **Open the Website**
   - Simply open `index.html` in your web browser
   - Or use a local server for development

3. **Local Development Server** (Optional)
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

## 📁 Project Structure

```
chiclons-cuts/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── README.md           # This file
└── .gitignore          # Git ignore file
```

## 🎨 Customization

### Colors and Branding
The website uses a professional color scheme that can be easily customized:

- **Primary Color**: `#2c3e50` (Dark Blue)
- **Accent Color**: `#e74c3c` (Red)
- **Background**: `#f8f9fa` (Light Gray)

To change colors, edit the CSS variables in `styles.css`.

### Content Updates
1. **Services**: Update the services section in `index.html`
2. **Pricing**: Modify prices in both HTML and JavaScript
3. **Contact Info**: Update address, phone, and email
4. **Business Hours**: Adjust in both HTML and JavaScript
5. **Images**: Replace placeholder elements with actual images

### Appointment System
The appointment system is currently simulated but can be integrated with:

- **Google Calendar API**
- **Outlook Calendar API**
- **Custom booking systems**
- **Email services** (SendGrid, Mailgun, etc.)

## 🌐 Deployment

### GitHub Pages Deployment

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/chiclons-cuts.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Your website will be available at:**
   ```
   https://yourusername.github.io/chiclons-cuts
   ```

### Other Deployment Options

- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use Firebase CLI
- **Traditional Web Hosting**: Upload files via FTP

## 🔧 Configuration

### Business Hours
Update business hours in `script.js`:

```javascript
const businessHours = {
    1: { start: 9, end: 18 }, // Monday
    2: { start: 9, end: 18 }, // Tuesday
    3: { start: 9, end: 18 }, // Wednesday
    4: { start: 9, end: 18 }, // Thursday
    5: { start: 9, end: 18 }, // Friday
    6: { start: 9, end: 17 }  // Saturday
};
```

### Services and Pricing
Update services in `index.html` and prices in `script.js`:

```javascript
const prices = {
    'classic-haircut': 25,
    'fade-style': 30,
    'beard-trim': 15,
    'premium-package': 40,
    'kids-cut': 20,
    'style-consultation': 10
};
```

### Contact Information
Update contact details in `index.html`:
- Address
- Phone number
- Email address
- Social media links

## 📱 Mobile Optimization

The website is fully optimized for mobile devices with:

- **Responsive Design** - Adapts to all screen sizes
- **Touch-Friendly** - Large buttons and easy navigation
- **Fast Loading** - Optimized for mobile networks
- **Mobile Navigation** - Hamburger menu for small screens

## 🔒 Security Considerations

For production use, consider implementing:

- **HTTPS** - Secure connections
- **Form Validation** - Server-side validation
- **CSRF Protection** - Cross-site request forgery protection
- **Input Sanitization** - Clean user inputs
- **Rate Limiting** - Prevent spam submissions

## 🚀 Future Enhancements

Potential features to add:

- **Online Payment Integration** - Stripe, PayPal
- **Real Calendar Integration** - Google Calendar API
- **Customer Reviews** - Review system
- **Photo Gallery** - Real image uploads
- **SMS Notifications** - Appointment reminders
- **Admin Dashboard** - Manage appointments
- **Multi-language Support** - International customers
- **Blog Section** - Hair care tips and trends

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For support or questions:
- Email: info@chiclonscuts.com
- Phone: (555) 123-4567
- Website: [Chiclon's Cuts](https://yourusername.github.io/chiclons-cuts)

## 🙏 Acknowledgments

- **Font Awesome** - Icons
- **Google Fonts** - Typography
- **Flatpickr** - Date picker
- **CSS Grid & Flexbox** - Layout system

---

**Built with ❤️ for Chiclon's Cuts** 