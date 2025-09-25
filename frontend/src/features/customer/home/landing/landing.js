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
  loadComponent("header", "../../../../core/components/navbar.html").then(() => {
    // Load the navbar script after HTML is loaded
    const script = document.createElement('script');
    script.src = '../../../../core/components/navbar.js';
    script.onload = () => {
      console.log('Navbar script loaded successfully on landing page');
      // Initialize authentication after script loads
      if (window.initAuth) {
        window.initAuth();
        console.log('Navbar auth initialized from landing page');
        // Also try to refresh auth after a short delay
        setTimeout(() => {
          if (window.refreshAuth) {
            window.refreshAuth();
            console.log('Navbar auth refreshed from landing page');
          }
        }, 200);
      } else {
        console.error('initAuth function not available on landing page');
      }
    };
    script.onerror = (error) => {
      console.error('Error loading navbar script on landing page:', error);
    };
    document.head.appendChild(script);
  });
  loadComponent("footer", "../../../../core/components/footer.html");

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

// Additional authentication check after page is fully loaded
window.addEventListener('load', () => {
  console.log('Window loaded - checking authentication state');
  setTimeout(() => {
    if (window.refreshAuth) {
      window.refreshAuth();
      console.log('Authentication refreshed after window load');
    }
  }, 500);
});

// Manual refresh function for debugging
function refreshNavbarAuth() {
  console.log('Manual navbar auth refresh triggered');
  if (window.refreshAuth) {
    window.refreshAuth();
  } else {
    console.error('refreshAuth function not available');
  }
}

// Make it globally available for debugging
window.refreshNavbarAuth = refreshNavbarAuth;

// Add debug button for testing (temporary)
setTimeout(() => {
  // const debugButton = document.createElement('button');
  // debugButton.textContent = 'Refresh Auth';
  debugButton.style.position = 'fixed';
  debugButton.style.top = '10px';
  debugButton.style.right = '10px';
  debugButton.style.zIndex = '9999';
  debugButton.style.padding = '5px 10px';
  debugButton.style.backgroundColor = '#3b82f6';
  debugButton.style.color = 'white';
  debugButton.style.border = 'none';
  debugButton.style.borderRadius = '4px';
  debugButton.style.cursor = 'pointer';
  debugButton.onclick = refreshNavbarAuth;
  document.body.appendChild(debugButton);
  
  // Remove debug button after 30 seconds
  setTimeout(() => {
    if (debugButton.parentNode) {
      debugButton.parentNode.removeChild(debugButton);
    }
  }, 30000);
}, 2000);

// Handle Add to Cart functionality
function handleAddToCart(productId) {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  console.log('Landing page - currentUser:', currentUser);
  console.log('Landing page - currentUser.email:', currentUser?.email);
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

  // Featured Products Carousel
  let featuredProducts = [];
  let currentFeaturedIndex = 0;
  const itemsPerView = 5; // Number of products to show at once

  // Load featured products
  async function loadFeaturedProducts() {
    try {
      const response = await fetch('../../../../core/api/db.json');
      const data = await response.json();
      featuredProducts = data.products.filter(product => product.featured_product === true);
      
      if (featuredProducts.length === 0) {
        console.log('No featured products found');
        return;
      }

      renderFeaturedProducts();
      setupFeaturedCarousel();
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  }

  // Render featured products
  function renderFeaturedProducts() {
    const container = document.getElementById('featured-product');
    if (!container) return;

    container.innerHTML = '';
    
    featuredProducts.forEach((product, index) => {
      const productCard = createProductCard(product);
      productCard.style.minWidth = '200px';
      productCard.style.marginRight = '16px';
      container.appendChild(productCard);
    });
  }

  // Create product card
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300';
    card.style.flex = '0 0 auto';
    
    card.innerHTML = `
      <div class="relative">
        <img src="${product.image_url}" alt="${product.name}" class="w-full h-32 object-cover">
        <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
          Featured
        </div>
      </div>
      <div class="p-4">
        <h4 class="font-semibold text-sm mb-2 line-clamp-2">${product.name}</h4>
        <p class="text-gray-600 text-xs mb-2 line-clamp-2">${product.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-green-600 font-bold">Rs ${product.price}</span>
          <button onclick="handleAddToCart(${product.id})" class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition">
            Add to Cart
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  // Setup featured products carousel
  function setupFeaturedCarousel() {
    const prevBtn = document.getElementById('featured-prev');
    const nextBtn = document.getElementById('featured-next');
    const container = document.getElementById('featured-product');
    
    if (!prevBtn || !nextBtn || !container) return;

    const totalProducts = featuredProducts.length;
    const maxIndex = Math.max(0, totalProducts - itemsPerView);

    function updateCarousel() {
      const translateX = -(currentFeaturedIndex * (200 + 16)); // 200px card width + 16px margin
      container.style.transform = `translateX(${translateX}px)`;
    }

    prevBtn.addEventListener('click', () => {
      if (currentFeaturedIndex > 0) {
        currentFeaturedIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentFeaturedIndex < maxIndex) {
        currentFeaturedIndex++;
        updateCarousel();
      }
    });

    // Auto-advance carousel every 6 seconds
    setInterval(() => {
      if (currentFeaturedIndex < maxIndex) {
        currentFeaturedIndex++;
        updateCarousel();
      } else {
        currentFeaturedIndex = 0;
        updateCarousel();
      }
    }, 6000);
  }

  // Load featured products when page loads
  loadFeaturedProducts();
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
