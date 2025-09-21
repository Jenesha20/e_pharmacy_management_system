document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const loginBtn = document.getElementById("loginBtn");
  const loginText = document.getElementById("loginText");
  const loginSpinner = document.getElementById("loginSpinner");
  const togglePassword = document.getElementById("togglePassword");
  const backButton = document.getElementById("backButton");

  if (!form) return;
  
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Check if there's a remembered email
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    document.getElementById('rememberMe').checked = true;
  }

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? 'visibility_off' : 'visibility';
  });

  // Form validation
  const validateForm = () => {
    let isValid = true;
    
    // Email validation
    if (!emailInput.value.trim()) {
      showError(emailError, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailError, 'Please enter a valid email address');
      isValid = false;
    } else {
      hideError(emailError);
    }
    
    // Password validation
    if (!passwordInput.value) {
      showError(passwordError, 'Password is required');
      isValid = false;
    } else {
      hideError(passwordError);
    }
    
    return isValid;
  };
 
  const isValidEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const showError = (element, message) => {
    element.textContent = message;
    element.classList.remove('hidden');
  };

  const hideError = (element) => {
    element.textContent = '';
    element.classList.add('hidden');
  };

  // Function to decode Base64 encoded password
  const decodePasswordHash = (passwordHash) => {
    if (passwordHash.startsWith('hashed_')) {
      const base64String = passwordHash.substring(7); // Remove 'hashed_' prefix
      try {
        // Decode Base64 string
        return atob(base64String);
      } catch (error) {
        console.error('Error decoding password hash:', error);
        return null;
      }
    }
    return passwordHash; // Return as is if not prefixed with 'hashed_'
  };

  // Input event listeners for real-time validation
  emailInput.addEventListener('input', () => {
    if (emailInput.value.trim() && isValidEmail(emailInput.value)) {
      hideError(emailError);
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.value) {
      hideError(passwordError);
    }
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Show loading state
    loginText.classList.add('hidden');
    loginSpinner.classList.remove('hidden');
    loginBtn.disabled = true;

    try {
      // Using the customers endpoint
      const response = await fetch("http://localhost:3000/customers");
      if (!response.ok) throw new Error("Failed to fetch users");

      const users = await response.json();
      
      // Find user by email
      const user = users.find(u => u.email === email);
      
      if (user) {
        // Decode the stored password hash
        const decodedPassword = decodePasswordHash(user.password_hash);
        
        // Compare the entered password with the decoded password
        if (decodedPassword && password === decodedPassword) {
          // Store email if "Remember me" is checked
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          
          // Store user data in localStorage
          localStorage.setItem("currentUser", JSON.stringify(user));
//           // After successful login
 const id=localStorage.getItem("currentUser");
 console.log(localStorage.getItem(id));

          
          // Show success message
          showNotification('Login successful! Redirecting...', 'success');
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = "../../../customer/home/landing/landing.html";
          }, 1000);
        } else {
          showNotification('Invalid email or password.', 'error');
          // Reset loading state
          loginText.classList.remove('hidden');
          loginSpinner.classList.add('hidden');
          loginBtn.disabled = false;
        }
      } else {
        showNotification('Invalid email or password.', 'error');
        // Reset loading state
        loginText.classList.remove('hidden');
        loginSpinner.classList.add('hidden');
        loginBtn.disabled = false;
      }
    } catch (error) {
      console.error(error);
      showNotification('Something went wrong. Please try again.', 'error');
      // Reset loading state
      loginText.classList.remove('hidden');
      loginSpinner.classList.add('hidden');
      loginBtn.disabled = false;
    }
  });

  // Notification function
  function showNotification(message, type) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.fixed-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `fixed-notification fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('translate-x-0', 'opacity-100');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('translate-x-0', 'opacity-100');
      notification.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
});