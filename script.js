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
let datePicker;
if (dateInput) {
    datePicker = flatpickr(dateInput, {
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
    
    // Clear existing options
    timeSelect.innerHTML = '<option value="">Pick a time</option>';
    
    if (!selectedDate) return;
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Define business hours
    const businessHours = {
        1: { start: 7, end: 19 }, // Monday
        2: { start: 7, end: 19 }, // Tuesday
        3: { start: 7, end: 19 }, // Wednesday
        4: { start: 7, end: 19 }, // Thursday
        5: { start: 7, end: 19 }, // Friday
        6: { start: 7, end: 19 }  // Saturday
    };
    
    if (businessHours[dayOfWeek]) {
        const { start, end } = businessHours[dayOfWeek];
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
            phone: formData.get('phone'),
            haircutType: formData.get('haircutType'),
            date: formData.get('date'),
            time: formData.get('time')
        };
        
        // Validate form data
        if (!validateAppointmentData(appointmentData)) {
            return;
        }
        
        // Book appointment with backend
        bookAppointment(appointmentData);
    });
}

// Validate appointment data
function validateAppointmentData(data) {
    const requiredFields = ['name', 'phone', 'haircutType', 'date', 'time'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
            showError(`Hey, you forgot to fill in the ${fieldName} field.`);
            return false;
        }
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

// Book appointment with backend API
async function bookAppointment(appointmentData) {
    // Show loading state
    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;
    
    try {
        // Determine API URL based on environment
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocalhost ? 'http://localhost:3000' : 'https://chiclons-cuts-production.up.railway.app';
        
        const response = await fetch(`${apiUrl}/api/book-appointment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success modal
            showSuccessModal(result.appointment);
            
            // Reset form
            appointmentForm.reset();
            
            // Reset date picker
            if (datePicker) {
                datePicker.clear();
            }
        } else {
            showError(result.message || 'Something went wrong. Please try again.');
        }
        
    } catch (error) {
        console.error('Error booking appointment:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Show success modal
function showSuccessModal(appointmentData) {
    const modal = document.getElementById('successModal');
    const detailsDiv = modal.querySelector('.appointment-details');
    
    // Format the date for display
    const formattedDate = formatDate(appointmentData.date);
    
    const details = `
        <strong>Name:</strong> ${appointmentData.name}<br>
        <strong>Haircut Type:</strong> ${appointmentData.haircutType}<br>
        <strong>Date:</strong> ${formattedDate}<br>
        <strong>Time:</strong> ${formatTime(appointmentData.time)}<br>
        <strong>Phone:</strong> ${appointmentData.phone}
    `;
    
    detailsDiv.innerHTML = details;
    modal.style.display = 'block';
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

// Initialize haircut type selection change handler
const haircutTypeSelect = document.getElementById('haircutType');
if (haircutTypeSelect) {
    haircutTypeSelect.addEventListener('change', function() {
        const selectedHaircutType = this.value;
        if (selectedHaircutType) {
            // You could add price display logic here
            console.log('Selected haircut type:', selectedHaircutType);
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