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
  const carousel = document.getElementById("featured-carousel");
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
// Testimonial slider functionality - will be initialized after testimonials are loaded
function initializeTestimonialSlider() {
  const slider = document.getElementById("testimonial-slider");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  if (!slider || !prevBtn || !nextBtn) {
    console.log("Testimonial slider elements not found, skipping initialization");
    return;
  }

  let index = 0;
  const totalSlides = slider.children.length;

  if (totalSlides === 0) {
    console.log("No testimonial slides found");
    return;
  }

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
}

  // Featured Products Carousel
  let featuredProducts = [];
  let currentSlide = 0;
  let carouselInterval;

  // Load featured products
  async function loadFeaturedProducts() {
    try {
      const response = await fetch('http://localhost:3000/products');
      const products = await response.json();
      featuredProducts = products.filter(product => product.featured_product === true);
      
      // Limit to first 5 featured products for better UX
      // featuredProducts = featuredProducts.slice(0, 5);
      
      console.log('Featured products found:', featuredProducts.length);
      console.log('Featured products:', featuredProducts);
      
      if (featuredProducts.length === 0) {
        console.log('No featured products found');
        return;
      }

      renderFeaturedProducts();
      initializeCarousel();
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  }

  // Render featured products in carousel format
  function renderFeaturedProducts() {
    const carouselWrapper = document.querySelector("#featured-carousel .relative.h-64");
    const indicatorsContainer = document.getElementById("carousel-indicators");
    
    console.log('Carousel wrapper found:', carouselWrapper);
    console.log('Indicators container found:', indicatorsContainer);
    
    if (!carouselWrapper || !indicatorsContainer) {
      console.error('Carousel elements not found!');
      return;
    }
    
    carouselWrapper.innerHTML = "";
    indicatorsContainer.innerHTML = "";
  
    if (featuredProducts.length === 0) {
        carouselWrapper.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <p class="text-gray-500 text-lg">No featured products available.</p>
          </div>
        `;
        return;
    }
  
    // Create carousel slides
    featuredProducts.forEach((product, index) => {
        const slide = document.createElement("div");
        slide.className = index === 0 ? "flex items-center justify-center duration-700 ease-in-out" : "hidden duration-700 ease-in-out";
        slide.setAttribute("data-carousel-item", "");
        
        const discountedPrice = product.price - ((product.discount/100) * product.price);
        
        slide.innerHTML = `
            <div class="w-full h-full flex items-center justify-center p-4">
                <div class="bg-white rounded-xl shadow-lg p-4 w-full max-w-sm relative">
                    <!-- Prescription Badge -->
                    ${product.requires_prescription ? 
                      `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">Rx</span>` 
                      : ""}
                    
                    <!-- Stock Status -->
                    ${product.inStock === false ? 
                      `<span class="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full z-10">Out of Stock</span>` 
                      : ""}
                    
                    <div class="flex flex-col items-center text-center pt-2">
                        <div class="mb-3 w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg mx-auto">
                            ${product.image_url ? 
                              `<img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-contain rounded-lg">` :
                              `<div class="w-full h-full flex items-center justify-center"><i class="fas fa-pills text-gray-400 text-2xl"></i></div>`
                            }
                        </div>
                        
                        <h3 class="text-base font-bold mb-2 text-gray-800 leading-tight">
                            <a href="../../shop/product/product.html?id=${product.id}" class="hover:text-blue-600">${product.name}</a>
                        </h3>
                        
                        <p class="text-gray-600 mb-3 text-xs leading-relaxed">${product.composition || 'No description available'}</p>
                        
                        <div class="flex flex-col items-center gap-1 mb-3">
                            <span class="text-lg font-bold text-green-600">Rs ${discountedPrice.toFixed(2)}</span>
                            ${product.discount > 0 ? 
                              `<span class="text-xs text-gray-500 line-through">Rs ${product.price.toFixed(2)}</span>` 
                              : ""}
                        </div>
                        
                        <button class="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 add-to-cart-btn text-sm w-full ${product.inStock === false ? 'opacity-50 cursor-not-allowed' : ''}" 
                          data-id="${product.id}" ${product.inStock === false ? 'disabled' : ''}>
                            <span class="flex items-center justify-center">
                              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6m8 0V9a1 1 0 00-1-1H8a1 1 0 00-1 1v4.01"></path>
                              </svg>
                              ${product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `;
  
        carouselWrapper.appendChild(slide);
  
        // Attach event if product is in stock
        if (product.inStock !== false) {
          const addButton = slide.querySelector(".add-to-cart-btn");
          if (addButton) {
            addButton.addEventListener("click", function(e) {
              e.stopPropagation();
              handleAddToCart(this.getAttribute("data-id"));
            });
          }
        }
        
        // Create indicator
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.className = index === 0 ? "w-3 h-3 rounded-full bg-blue-600" : "w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400";
        indicator.setAttribute("aria-current", index === 0 ? "true" : "false");
        indicator.setAttribute("aria-label", `Slide ${index + 1}`);
        indicator.setAttribute("data-carousel-slide-to", index);
        indicator.addEventListener("click", () => goToSlide(index));
        
        indicatorsContainer.appendChild(indicator);
    });
  }

  // Initialize carousel functionality
  function initializeCarousel() {
    const slides = document.querySelectorAll('[data-carousel-item]');
    const indicators = document.querySelectorAll('[data-carousel-slide-to]');
    const prevButton = document.querySelector('[data-carousel-prev]');
    const nextButton = document.querySelector('[data-carousel-next]');
    const carousel = document.getElementById('featured-carousel');
    
    if (slides.length === 0) return;
    
    // Clear existing interval
    if (carouselInterval) {
      clearInterval(carouselInterval);
    }
    
    // Auto-play functionality
    function startAutoplay() {
      carouselInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
      }, 4000); // 4 seconds interval
    }
    
    // Stop autoplay
    function stopAutoplay() {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    }
    
    // Update carousel display
    function updateCarousel() {
      slides.forEach((slide, index) => {
        if (index === currentSlide) {
          slide.classList.remove('hidden');
          slide.classList.add('flex', 'items-center', 'justify-center');
        } else {
          slide.classList.add('hidden');
          slide.classList.remove('flex', 'items-center', 'justify-center');
        }
      });
      
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('bg-blue-600', index === currentSlide);
        indicator.classList.toggle('bg-gray-300', index !== currentSlide);
        indicator.setAttribute('aria-current', index === currentSlide ? 'true' : 'false');
      });
    }
    
    // Go to specific slide
    window.goToSlide = function(index) {
      currentSlide = index;
      updateCarousel();
      stopAutoplay();
      startAutoplay(); // Restart autoplay after manual navigation
    };
    
    // Previous button
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
        updateCarousel();
        stopAutoplay();
        startAutoplay();
      });
    }
    
    // Next button
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
        stopAutoplay();
        startAutoplay();
      });
    }
    
    // Pause on hover
    if (carousel) {
      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);
    }
    
    // Start autoplay
    startAutoplay();
  }

  // Load featured products when page loads
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
  } else {
    loadFeaturedProducts();
  }
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
window.initializeTestimonialSlider = initializeTestimonialSlider;
