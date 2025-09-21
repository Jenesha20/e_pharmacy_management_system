function loadComponent(id, filePath) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id="${id}" not found. Skipping load for ${filePath}`);
    return Promise.resolve();
  }

  return fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
      return response.text();
    })
    .then(data => {
      el.innerHTML = data;
      
      // Execute any scripts in the loaded content
      const scripts = el.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      });
    })
    .catch(err => console.error("Error loading component:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  // load header & footer after DOM is ready
  loadComponent("header", "/frontend/src/core/components/navbar.html").then(() => {
    // Initialize authentication after navbar is loaded
    // Add a small delay to ensure navbar script has executed
    setTimeout(() => {
      if (window.initAuth) {
        window.initAuth();
      } else if (window.refreshAuth) {
        window.refreshAuth();
      }
    }, 100);
  });
  loadComponent("footer", "/frontend/src/core/components/footer.html");

  // Carousel logic
  const carousel = document.getElementById("carousel");
  if (!carousel) {
    console.error("Carousel element not found!");
    return;
  }

  // Only select slide divs (exclude overlay + controls)
  const slides = carousel.querySelectorAll(":scope > div:not(.bg-black)");
  let index = 0;

  function showSlide(newIndex) {
    slides[index].classList.remove("opacity-100");
    slides[index].classList.add("opacity-0");

    slides[newIndex].classList.remove("opacity-0");
    slides[newIndex].classList.add("opacity-100");

    index = newIndex;
  }

  document.getElementById("prev").addEventListener("click", () => {
    const newIndex = (index - 1 + slides.length) % slides.length;
    showSlide(newIndex);
  });

  document.getElementById("next").addEventListener("click", () => {
    const newIndex = (index + 1) % slides.length;
    showSlide(newIndex);
  });

  // Auto-slide every 5s
  setInterval(() => {
    const newIndex = (index + 1) % slides.length;
    showSlide(newIndex);
  }, 5000);
});

// Handle Add to Cart functionality
function handleAddToCart(productId) {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser || !currentUser.email) {
    showLoginRequiredModal();
    return;
  }
  
  // User is logged in, add to cart
  addToCart(productId);
}

// Add to cart function for logged-in users
async function addToCart(productId) {
  const now = new Date().toISOString();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = currentUser.id;

  try {
    // Try to add to cart via API
    const res = await fetch("http://localhost:3000/cart", {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        quantity: 1,
        status: "active",
        added_at: now
      })
    });
    
    if (res.ok) {
      showNotification("Product added to cart!", "success");
      return;
    }
    
    showNotification("Failed to add product to cart. Please try again.", "error");
    
  } catch (err) {
    console.error("Error adding to cart:", err);
    showNotification("Failed to add product to cart. Please try again.", "error");
  }
}

// Show login required modal
function showLoginRequiredModal() {
  // Create modal HTML
  const modalHTML = `
    <div id="loginRequiredModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <i class="fas fa-lock text-blue-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
          <p class="text-gray-600 mb-6">
            You need to be logged in to add items to your cart. Please log in to continue shopping.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              onclick="closeLoginRequiredModal()" 
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
            <button 
              onclick="goToLogin()" 
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-sign-in-alt mr-2"></i>
              Login Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close login required modal
function closeLoginRequiredModal() {
  const modal = document.getElementById('loginRequiredModal');
  if (modal) {
    modal.remove();
  }
}

// Go to login page
function goToLogin() {
  window.location.href = "/frontend/src/features/customer/auth/login/login.html";
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.fixed-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `fixed-notification fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-500 text-white' : 
    type === 'error' ? 'bg-red-500 text-white' : 
    'bg-blue-500 text-white'
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
const slider = document.getElementById("testimonial-slider");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  let index = 0;
  const totalSlides = slider.children.length;

  function showSlide() {
    slider.style.transform = `translateX(-${index * 100}%)`;
  }

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % totalSlides;
    showSlide();
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + totalSlides) % totalSlides;
    showSlide();
  });

  // Auto-slide every 5 seconds
  setInterval(() => {
    index = (index + 1) % totalSlides;
    showSlide();
  }, 5000);
  // function openBlog(type) {
  //   const modal = document.getElementById("blog-modal");
  //   const title = document.getElementById("blog-title");
  //   const content = document.getElementById("blog-content");

  //   if(type === "winter") {
  //     title.textContent = "5 Tips for a Healthier Winter Season";
  //     content.textContent = "Here you can write or fetch the full blog content...";
  //   }

  //   modal.classList.remove("hidden");
  // }

  // function closeBlog() {
  //   document.getElementById("blog-modal").classList.add("hidden");
  // }


  

// Make functions globally available
window.handleAddToCart = handleAddToCart;
window.closeLoginRequiredModal = closeLoginRequiredModal;
window.goToLogin = goToLogin;
