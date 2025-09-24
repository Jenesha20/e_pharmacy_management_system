function loadComponent(id, filePath) {
  fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to load ${filePath}`);
      return res.text();
    })
    .then(data => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = data;
        
        // If this is the header component, we need to load the navbar script
        if (id === 'header') {
          // Load the navbar script
          const script = document.createElement('script');
          script.src = '/frontend/src/core/components/navbar.js';
          script.onload = () => {
            console.log("Navbar script loaded successfully");
            // Initialize auth after script is loaded
            setTimeout(() => {
              if (window.initAuth) {
                console.log("Calling initAuth after script load");
                window.initAuth();
              } else if (window.refreshAuth) {
                console.log("Calling refreshAuth after script load");
                window.refreshAuth();
              }
            }, 100);
          };
          script.onerror = () => {
            console.error("Failed to load navbar script");
          };
          document.head.appendChild(script);
        }
        
        // Reattach event listeners after loading
        setTimeout(attachEventListeners, 100);
      }
    })
    .catch(err => console.error("Error loading component:", err));
}

// Function to handle form submission
function handleContactFormSubmit(event) {
  event.preventDefault();
  
  // Get form data
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  
  // Basic validation
  if (!name || !email || !subject || !message) {
    alert('Please fill in all fields');
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  // Create message object
  const messageData = {
    name: name,
    email: email,
    subject: subject,
    message: message,
    is_read: false,
    created_at: new Date().toISOString()
  };
  
  // Send message to JSON server
  fetch('http://localhost:3000/customer_messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset form
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('message').value = '';
  })
  .catch(error => {
    console.error('Error sending message:', error);
    alert('Sorry, there was an error sending your message. Please try again later.');
  });
}

// Function to attach event listeners
function attachEventListeners() {
  const contactForm = document.querySelector('form');
  if (contactForm) {
    // Remove existing event listener if any
    contactForm.removeEventListener('submit', handleContactFormSubmit);
    // Add new event listener
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
}

// Initialize the page
function initPage() {
  attachEventListeners();
}

// Load components
document.addEventListener('DOMContentLoaded', function () {
  loadComponent("header", "/frontend/src/core/components/navbar.html");
  loadComponent("footer", "/frontend/src/core/components/footer.html");
  initPage();
});