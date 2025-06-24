// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Initialize Flatpickr for date picker
const dateInput = document.getElementById('date');
if (dateInput) {
    flatpickr(dateInput, {
        minDate: 'today',
        maxDate: new Date().fp_incr(30), // Allow booking up to 30 days in advance
        disable: [
            function(date) {
                // Disable Sundays (0 = Sunday)
                return date.getDay() === 0;
            }
        ],
        dateFormat: 'Y-m-d',
        onChange: function(selectedDates, dateStr, instance) {
            // Update available times based on selected date
            updateAvailableTimes(dateStr);
        }
    });
}

// Update available times based on selected date
function updateAvailableTimes(selectedDate) {
    const timeSelect = document.getElementById('time');
    const selectedDay = new Date(selectedDate).getDay();
    
    // Clear existing options
    timeSelect.innerHTML = '<option value="">Pick a time</option>';
    
    // Define business hours
    const businessHours = {
        1: { start: 9, end: 18 }, // Monday
        2: { start: 9, end: 18 }, // Tuesday
        3: { start: 9, end: 18 }, // Wednesday
        4: { start: 9, end: 18 }, // Thursday
        5: { start: 9, end: 18 }, // Friday
        6: { start: 9, end: 17 }  // Saturday
    };
    
    if (businessHours[selectedDay]) {
        const { start, end } = businessHours[selectedDay];
        for (let hour = start; hour < end; hour++) {
            const timeString = hour.toString().padStart(2, '0') + ':00';
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = hour === 12 ? '12:00 PM' : 
                               hour > 12 ? (hour - 12) + ':00 PM' : 
                               hour + ':00 AM';
            timeSelect.appendChild(option);
        }
    }
}

// Appointment booking form handling
const appointmentForm = document.getElementById('appointmentForm');
if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const appointmentData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            date: formData.get('date'),
            time: formData.get('time'),
            notes: formData.get('notes')
        };
        
        // Validate form data
        if (!validateAppointmentData(appointmentData)) {
            return;
        }
        
        // Simulate booking process
        bookAppointment(appointmentData);
    });
}

// Validate appointment data
function validateAppointmentData(data) {
    const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showError(`Hey, you forgot to fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showError('That email doesn\'t look right. Can you check it?');
        return false;
    }
    
    // Validate phone format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
        showError('That phone number doesn\'t look right. Can you double-check it?');
        return false;
    }
    
    return true;
}

// Show error message
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 5000);
}

// Book appointment (simulate API call)
function bookAppointment(appointmentData) {
    // Show loading state
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;
    
    // Simulate API delay
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success modal
        showSuccessModal(appointmentData);
        
        // Reset form
        appointmentForm.reset();
        
        // Reset date picker
        if (window.fp) {
            window.fp.clear();
        }
    }, 2000);
}

// Show success modal
function showSuccessModal(appointmentData) {
    const modal = document.getElementById('successModal');
    const detailsDiv = modal.querySelector('.appointment-details');
    
    // Format appointment details
    const serviceNames = {
        'classic-haircut': 'Classic Haircut',
        'fade-style': 'Fade & Style',
        'beard-trim': 'Beard Trim'
    };
    
    const details = `
        <strong>Name:</strong> ${appointmentData.name}<br>
        <strong>Service:</strong> ${serviceNames[appointmentData.service] || appointmentData.service}<br>
        <strong>Date:</strong> ${formatDate(appointmentData.date)}<br>
        <strong>Time:</strong> ${formatTime(appointmentData.time)}<br>
        <strong>Email:</strong> ${appointmentData.email}<br>
        <strong>Phone:</strong> ${appointmentData.phone}
    `;
    
    detailsDiv.innerHTML = details;
    modal.style.display = 'block';
    
    // Add to Chiclon's calendar (simulate)
    addToChiclonsCalendar(appointmentData);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return hour === 12 ? '12:00 PM' : 
           hour > 12 ? (hour - 12) + ':00 PM' : 
           hour + ':00 AM';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Close modal with X button
document.querySelector('.close').addEventListener('click', closeModal);

// Add appointment to Chiclon's calendar (simulate)
function addToChiclonsCalendar(appointmentData) {
    // In a real implementation, this would integrate with:
    // - Google Calendar API
    // - Outlook Calendar API
    // - A custom booking system
    // - Email notifications
    
    console.log('Appointment added to Chiclon\'s calendar:', appointmentData);
    
    // Simulate sending confirmation email to danielcardo1535@gmail.com
    setTimeout(() => {
        console.log('Confirmation email sent to:', appointmentData.email);
        console.log('Notification sent to Chiclon at: danielcardo1535@gmail.com');
    }, 1000);
}

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Validate contact form
        if (!validateContactData(contactData)) {
            return;
        }
        
        // Simulate sending message
        sendContactMessage(contactData);
    });
}

// Validate contact data
function validateContactData(data) {
    const requiredFields = ['name', 'email', 'subject', 'message'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showError(`Hey, you forgot to fill in the ${field} field.`);
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showError('That email doesn\'t look right. Can you check it?');
        return false;
    }
    
    return true;
}

// Send contact message
function sendContactMessage(contactData) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showSuccessMessage('Message sent! We\'ll get back to you soon.');
        
        // Reset form
        contactForm.reset();
    }, 2000);
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .gallery-item, .contact-item');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Service price calculator (updated for 3 services)
function calculateServicePrice(services) {
    const prices = {
        'classic-haircut': 25,
        'fade-style': 30,
        'beard-trim': 15
    };
    
    return services.reduce((total, service) => total + (prices[service] || 0), 0);
}

// Initialize service selection change handler
const serviceSelect = document.getElementById('service');
if (serviceSelect) {
    serviceSelect.addEventListener('change', function() {
        const selectedService = this.value;
        if (selectedService) {
            // You could add price display logic here
            console.log('Selected service:', selectedService);
        }
    });
}

// Add loading animation for page load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('successModal');
        if (modal.style.display === 'block') {
            closeModal();
        }
    }
});

// Accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add ARIA labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (!input.getAttribute('aria-label') && input.placeholder) {
            input.setAttribute('aria-label', input.placeholder);
        }
    });
    
    // Add focus indicators
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea');
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid #e74c3c';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        });
    });
}); 