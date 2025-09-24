document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const backButton = document.getElementById("backButton");
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
  const passwordInput = document.getElementById("password");
  const passwordStrengthMeter = document.getElementById("passwordStrengthMeter");
  const passwordStrengthText = document.getElementById("passwordStrengthText");
  
  // Back button functionality
  backButton.addEventListener("click", () => {
    window.history.back();
  });
  
  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
  });
  
  // Toggle confirm password visibility
  toggleConfirmPassword.addEventListener("click", () => {
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    toggleConfirmPassword.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
  });
  
  // Password strength indicator
  passwordInput.addEventListener('input', function() {
    const strength = checkPasswordStrength(this.value);
    updatePasswordStrengthUI(strength);
  });
  
  function checkPasswordStrength(password) {
    // Initialize strength
    let strength = 0;
    
    // Validate password length
    if (password.length >= 8) strength++;
    
    // Check for mixed case
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength++;
    
    // Check for numbers
    if (password.match(/([0-9])/)) strength++;
    
    // Check for special characters
    if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/)) strength++;
    
    return strength;
  }
  
  function updatePasswordStrengthUI(strength) {
    let width = 0;
    let text = '';
    let color = '';
    
    switch(strength) {
      case 0:
        width = 0;
        text = '';
        color = 'bg-gray-300';
        break;
      case 1:
        width = 25;
        text = 'Weak';
        color = 'bg-red-500';
        break;
      case 2:
        width = 50;
        text = 'Fair';
        color = 'bg-yellow-500';
        break;
      case 3:
        width = 75;
        text = 'Good';
        color = 'bg-blue-500';
        break;
      case 4:
        width = 100;
        text = 'Strong';
        color = 'bg-green-500';
        break;
    }
    
    passwordStrengthMeter.style.width = `${width}%`;
    passwordStrengthMeter.className = `password-strength-meter-fill ${color}`;
    passwordStrengthText.textContent = text;
    passwordStrengthText.className = `text-xs mt-1 ${color.replace('bg-', 'text-')}`;
  }
  
  // Form validation and submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Get form values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreed = document.getElementById("agree").checked;
    
    let isValid = true;
    
    // Validate First Name
    if (!firstName) {
      showError("firstNameError", "First name is required");
      isValid = false;
    }
    
    // Validate Last Name
    if (!lastName) {
      showError("lastNameError", "Last name is required");
      isValid = false;
    }
    
    // Validate Email
    if (!email) {
      showError("emailError", "Email is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError("emailError", "Please enter a valid email address");
      isValid = false;
    }
    
    // Validate Phone Number
    if (!phoneNumber) {
      showError("phoneError", "Phone number is required");
      isValid = false;
    } else if (!isValidPhone(phoneNumber)) {
      showError("phoneError", "Please enter a valid phone number");
      isValid = false;
    }
    
    // Validate Password
    if (!password) {
      showError("passwordError", "Password is required");
      isValid = false;
    } else if (password.length < 8) {
      showError("passwordError", "Password must be at least 8 characters");
      isValid = false;
    }
    
    // Validate Confirm Password
    if (!confirmPassword) {
      showError("confirmPasswordError", "Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      showError("confirmPasswordError", "Passwords do not match");
      isValid = false;
    }
    
    // Validate Terms Agreement
    if (!agreed) {
      showError("agreeError", "You must agree to our Privacy Policy and Terms & Conditions");
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Disable submit button to prevent multiple submissions
    const submitButton = document.getElementById("submitButton");
    submitButton.disabled = true;
    submitButton.textContent = "Creating Account...";
    
    try {
      // Check if email already exists
      const emailCheckResponse = await fetch(`http://localhost:3000/customers?email=${encodeURIComponent(email)}`);
      if (!emailCheckResponse.ok) throw new Error("Failed to check email availability");
      
      const existingUsers = await emailCheckResponse.json();
      if (existingUsers.length > 0) {
        showError("emailError", "This email is already registered");
        submitButton.disabled = false;
        submitButton.textContent = "Create Account";
        return;
      }
      
      // Generate a unique customer ID
      const customersResponse = await fetch("http://localhost:3000/customers");
      const allCustomers = await customersResponse.json();
      const customerId = Math.max(...allCustomers.map(c => c.customer_id), 0) + 1;
      
      // Prepare user data according to your JSON structure
      const userData = {
        customer_id: customerId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: hashPassword(password), // In a real app, this should be properly hashed on the server
        phone_number: phoneNumber,
        date_of_birth: null, // Could add this field to your form if needed
        gender: null, // Could add this field to your form if needed
        role: "customer",
        created_at: new Date().toISOString()
      };
      
      // Send registration request
      const response = await fetch("http://localhost:3000/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error("Failed to register user");
      
      const newUser = await response.json();
      
      alert("Registration successful!");
      
      // Save new user as current user (auto-login after registration)
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      
      // Redirect to landing page
      window.location.href = "../../customer/auth/login/login.html";
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      submitButton.disabled = false;
      submitButton.textContent = "Create Account";
    }
  });
  
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
  }
  
  function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
      element.textContent = '';
    });
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function isValidPhone(phone) {
    // Basic phone validation - adjust based on your requirements
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
  
  function hashPassword(password) {
    // In a real application, this should be properly hashed using a secure algorithm
    // This is just a simple example - consider using bcrypt or similar in production
    return 'hashed_' + btoa(password);
  }
});