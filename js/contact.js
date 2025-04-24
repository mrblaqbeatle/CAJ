// contact.js - Contact Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the contact form
    const contactForm = document.getElementById('inquiry-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // In a real implementation, this would send to a server
            console.log('Form submission:', { name, email, subject, message });
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Initialize map (placeholder for actual map implementation)
    initializeMap();
});

function initializeMap() {
    // This would be replaced with actual map API code (Google Maps, Mapbox, etc.)
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-placeholder';
    mapContainer.innerHTML = `
        <div style="height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;">
            <p style="color: #666;">Map would be displayed here</p>
        </div>
    `;
    
    const mapElement = document.querySelector('.map-container');
    if (mapElement) {
        mapElement.appendChild(mapContainer);
    }
}