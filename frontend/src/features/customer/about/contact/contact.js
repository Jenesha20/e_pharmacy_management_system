// contact.js - E-Pharmacy Contact Us Page Functionality

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
              // Populate user data after auth initialization
              setTimeout(populateUserData, 200);
            }, 100);
          };
          script.onerror = () => {
            console.error("Failed to load navbar script");
            // Try to populate user data even if navbar script fails
            setTimeout(populateUserData, 300);
          };
          document.head.appendChild(script);
        }
        
        // Reattach event listeners after loading
        setTimeout(attachEventListeners, 100);
      }
    })
    .catch(err => console.error("Error loading component:", err));
}

// Function to get current user data from localStorage
function getCurrentUser() {
  try {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Retrieved user from localStorage:', user);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
}

// Function to check if user is logged in
function isUserLoggedIn() {
  const user = getCurrentUser();
  return user !== null;
}

// Main function to populate user data in the form
function populateUserData() {
  try {
    const user = getCurrentUser();
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    
    if (!nameField || !emailField) {
      console.warn('Name or email field not found');
      return;
    }
    
    if (user) {
      // Populate name field - try different possible name fields
      let userName = '';
      if (user.first_name && user.last_name) {
        userName = `${user.first_name} ${user.last_name}`;
      } else if (user.first_name) {
        userName = user.first_name;
      } else if (user.name) {
        userName = user.name;
      } else if (user.username) {
        userName = user.username;
      }
      
      if (userName) {
        nameField.value = userName;
        nameField.style.borderLeft = '3px solid #10B981';
        console.log('Populated name:', userName);
      }
      
      // Populate email field
      if (user.email) {
        emailField.value = user.email;
        emailField.style.borderLeft = '3px solid #10B981';
        console.log('Populated email:', user.email);
      }
      
      // Add hint text for logged-in users
      addUserHint(true);
      
      console.log('User data populated successfully from localStorage');
      
    } else {
      // User is not logged in - clear fields
      clearUserData();
      addUserHint(false);
      console.log('No user logged in - fields kept empty for guest');
    }
  } catch (error) {
    console.error('Error populating user data:', error);
    clearUserData();
    addUserHint(false);
  }
}

// Function to clear user data from form (for guest users)
function clearUserData() {
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  
  if (nameField) {
    nameField.value = '';
    nameField.style.borderLeft = '';
    nameField.readOnly = false;
    nameField.placeholder = 'Enter your name';
  }
  
  if (emailField) {
    emailField.value = '';
    emailField.style.borderLeft = '';
    emailField.readOnly = false;
    emailField.placeholder = 'Enter your email';
  }
}

// Function to add hint text indicating login status
function addUserHint(isLoggedIn) {
  // Remove existing hints
  const existingNameHint = document.getElementById('name-hint');
  const existingEmailHint = document.getElementById('email-hint');
  
  if (existingNameHint) existingNameHint.remove();
  if (existingEmailHint) existingEmailHint.remove();
  
  if (isLoggedIn) {
    // Add hint for name field
    const nameField = document.getElementById('name');
    if (nameField && nameField.value) {
      const nameHint = document.createElement('div');
      nameHint.id = 'name-hint';
      nameHint.className = 'text-xs text-green-600 mt-1 flex items-center';
      nameHint.innerHTML = '<span class="material-icons text-sm mr-1">check_circle</span> Pre-filled from your account';
      nameField.parentNode.appendChild(nameHint);
    }
    
    // Add hint for email field
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
      const emailHint = document.createElement('div');
      emailHint.id = 'email-hint';
      emailHint.className = 'text-xs text-green-600 mt-1 flex items-center';
      emailHint.innerHTML = '<span class="material-icons text-sm mr-1">check_circle</span> Pre-filled from your account';
      emailField.parentNode.appendChild(emailHint);
    }
  }
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
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage('Please enter a valid email address', 'error');
    return;
  }
  
  // Get current user for additional data
  const currentUser = getCurrentUser();
  
  // Create message object
  const messageData = {
    name: name,
    email: email,
    subject: subject,
    message: message,
    is_read: false,
    created_at: new Date().toISOString(),
    user_id: currentUser ? currentUser.id : null,
    customer_id: currentUser ? currentUser.id : null
  };
  
  // Show loading state
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Sending...';
  submitButton.disabled = true;
  
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
    showMessage('Thank you for your message! We will get back to you soon.', 'success');
    
    // Reset form while preserving logged-in user data
    resetFormPreservingUserData();
    
    // Restore button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  })
  .catch(error => {
    console.error('Error sending message:', error);
    showMessage('Sorry, there was an error sending your message. Please try again later.', 'error');
    
    // Restore button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  });
}

// Function to reset form while preserving user data for logged-in users
function resetFormPreservingUserData() {
  const user = getCurrentUser();
  
  // Always clear these fields
  document.getElementById('subject').value = '';
  document.getElementById('message').value = '';
  
  // Only clear name and email if user is not logged in
  if (!user) {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
  } else {
    // Re-populate user data to ensure it's still there
    setTimeout(populateUserData, 100);
  }
}

// Function to show messages to user
function showMessage(message, type = 'info') {
  // Remove existing messages
  const existingMessage = document.getElementById('form-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.id = 'form-message';
  messageDiv.className = `p-4 rounded-md mb-4 ${
    type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
    type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
    'bg-blue-100 text-blue-800 border border-blue-200'
  }`;
  
  messageDiv.innerHTML = `
    <div class="flex items-center">
      <span class="material-icons mr-2 text-sm">${
        type === 'success' ? 'check_circle' :
        type === 'error' ? 'error' : 'info'
      }</span>
      <span>${message}</span>
    </div>
  `;
  
  // Insert message at the top of the form
  form.insertBefore(messageDiv, form.firstChild);
  
  // Auto-remove success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
}

// Function to attach event listeners
function attachEventListeners() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    // Remove existing event listener if any
    contactForm.removeEventListener('submit', handleContactFormSubmit);
    // Add new event listener
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
}

// Function to check auth status periodically
function startAuthMonitor() {
  // Check auth status every 10 seconds
  setInterval(() => {
    const currentUser = getCurrentUser();
    const nameField = document.getElementById('name');
    
    // If user data exists but fields are empty, repopulate
    if (currentUser && nameField && !nameField.value) {
      console.log('User logged in but fields empty - repopulating');
      populateUserData();
    }
    // If no user data but fields have values (user logged out), clear fields
    else if (!currentUser && nameField && nameField.value) {
      console.log('User logged out - clearing fields');
      clearUserData();
    }
  }, 10000);
}

// Function to handle storage events (when login/logout happens in other tabs)
function setupStorageListener() {
  window.addEventListener('storage', function(e) {
    if (e.key === 'currentUser') {
      console.log('Storage change detected for currentUser');
      setTimeout(populateUserData, 100);
    }
  });
}

// Initialize the page
function initPage() {
  attachEventListeners();
  
  // Populate user data after a short delay
  setTimeout(() => {
    populateUserData();
    console.log('Page initialized - user data populated');
  }, 500);
  
  // Start monitoring auth status
  startAuthMonitor();
  
  // Setup storage listener
  setupStorageListener();
}

// Load components and initialize page
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded - loading components');
  loadComponent("header", "/frontend/src/core/components/navbar.html");
  loadComponent("footer", "/frontend/src/core/components/footer.html");
  
  // Initialize page after components are loaded
  setTimeout(initPage, 1000);
});

// Custom event listeners for auth changes
window.addEventListener('userLoggedIn', function() {
  console.log('User logged in event received');
  setTimeout(populateUserData, 100);
});

window.addEventListener('userLoggedOut', function() {
  console.log('User logged out event received');
  setTimeout(() => {
    clearUserData();
    addUserHint(false);
  }, 100);
});

// Utility function to check login status (can be called from other scripts)
function checkLoginStatus() {
  return isUserLoggedIn();
}

// Utility function to get user info (can be called from other scripts)
function getUserInfo() {
  return getCurrentUser();
}

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    populateUserData,
    getCurrentUser,
    isUserLoggedIn,
    handleContactFormSubmit,
    checkLoginStatus,
    getUserInfo
  };
}