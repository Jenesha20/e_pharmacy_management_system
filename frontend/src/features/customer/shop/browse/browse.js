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

loadComponent("header", "/frontend/src/core/components/navbar.html").then(() => {
  // Initialize authentication after navbar is loaded
  setTimeout(() => {
    if (window.initAuth) {
      window.initAuth();
    } else if (window.refreshAuth) {
      window.refreshAuth();
    }
  }, 100);
});
loadComponent("footer", "/frontend/src/core/components/footer.html");
  
  let products = [];
  let categories = [];
  let filteredProducts = [];
  let featuredProducts = [];
  const itemsPerPage = 10;
  let currentPage = 1;
  
  // Filter state
  let filterState = {
    searchTerm: '',
    selectedCategories: [],
    maxPrice: 100,
    inStockOnly: true,
    requiresPrescription: false,
    sortBy: 'relevance'
  };
  
  // Fetch products and categories from backend
//   async function fetchData() {
//     try {
//       // Fetch products
//       const productsResponse = await fetch("http://localhost:3000/products");
//       if (!productsResponse.ok) throw new Error("Failed to fetch products");
//       products = await productsResponse.json();
      
//       // Fetch categories
//       const categoriesResponse = await fetch("http://localhost:3000/categories");
//       if (categoriesResponse.ok) {
//         categories = await categoriesResponse.json();
//         renderCategoryFilters();
//       }
      
//       // Fetch inventory to check stock status
//       const inventoryResponse = await fetch("http://localhost:3000/inventory");
//       if (inventoryResponse.ok) {
//         const inventory = await inventoryResponse.json();
        
//         // Add stock information to products
//         products = products.map(product => {
//           const inventoryItem = inventory.find(item => item.product_id === product.product_id);
//           return {
//             ...product,
//             stock: inventoryItem ? inventoryItem.quantity_in_stock : 0,
//             inStock: inventoryItem ? inventoryItem.quantity_in_stock > 0 : false
//           };
//         });
//       }
      
//       // Filter featured products (only 5)
//       featuredProducts = products.filter(product => product.featured_product === true).slice(0, 5);
      
//       // Initialize filtered products
//       filteredProducts = [...products];
      
//       // Render featured products
//       renderFeaturedProducts();
      
//       // Apply initial filters and render products
//       applyFilters();
      
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       document.getElementById("product-list").innerHTML =
//           "<p class='text-red-500 col-span-full'>Failed to load products.</p>";
//     }
//   }
  
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
  }
  
  // Render category filters
  function renderCategoryFilters() {
    const desktopContainer = document.getElementById("category-filters");
    const mobileContainer = document.getElementById("mobile-category-filters");
    
    if (!desktopContainer || !mobileContainer) return;
    
    desktopContainer.innerHTML = '';
    mobileContainer.innerHTML = '';
    
    categories.forEach(category => {
      const checkboxId = `category-${category.category_id}`;
      const mobileCheckboxId = `mobile-category-${category.category_id}`;
      
      const checkboxHTML = `
        <label class="flex items-center">
          <input type="checkbox" id="${checkboxId}" value="${category.category_id}" class="category-checkbox rounded text-blue-600 focus:ring-blue-500"/>
          <span class="ml-2 text-sm text-gray-700">${category.name}</span>
        </label>
      `;
      
      const mobileCheckboxHTML = `
        <label class="flex items-center">
          <input type="checkbox" id="${mobileCheckboxId}" value="${category.category_id}" class="mobile-category-checkbox rounded text-blue-600 focus:ring-blue-500"/>
          <span class="ml-2 text-sm text-gray-700">${category.name}</span>
        </label>
      `;
      
      desktopContainer.innerHTML += checkboxHTML;
      mobileContainer.innerHTML += mobileCheckboxHTML;
    });
    
    // Add event listeners to category checkboxes
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', handleCategoryFilter);
    });
    
    document.querySelectorAll('.mobile-category-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', handleCategoryFilter);
    });
  }
  
  // Handle category filter changes
  function handleCategoryFilter(e) {
    const categoryId = parseInt(e.target.value);
    
    if (e.target.checked) {
      if (!filterState.selectedCategories.includes(categoryId)) {
        filterState.selectedCategories.push(categoryId);
      }
    } else {
      filterState.selectedCategories = filterState.selectedCategories.filter(id => id !== categoryId);
    }
    
    applyFilters();
  }
  
  // Apply all filters and sort
  function applyFilters() {
    // Start with all products
    let result = [...products];
    
    // Apply search filter
    if (filterState.searchTerm) {
      const searchTerm = filterState.searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.composition && product.composition.toLowerCase().includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply category filter
    if (filterState.selectedCategories.length > 0) {
      result = result.filter(product => 
        filterState.selectedCategories.includes(product.category_id)
      );
    }
    
    // Apply price filter
    result = result.filter(product => 
      product.price <= filterState.maxPrice
    );
    
    // Apply stock filter
    if (filterState.inStockOnly) {
      result = result.filter(product => product.inStock);
    }
    
    // Apply prescription filter
    if (filterState.requiresPrescription) {
      result = result.filter(product => product.requires_prescription);
    }
    
    // Apply sorting
    switch(filterState.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default relevance sorting (no change)
        break;
    }
    
    filteredProducts = result;
    
    // Update product count
    const productCountElement = document.getElementById('product-count');
    if (productCountElement) {
      productCountElement.textContent = `${filteredProducts.length} products`;
    }
    
    // Show/hide no products message
    const noProductsElement = document.getElementById('no-products');
    if (noProductsElement) {
      if (filteredProducts.length === 0) {
        noProductsElement.classList.remove('hidden');
      } else {
        noProductsElement.classList.add('hidden');
      }
    }
    
    // Render products for current page
    renderProducts(currentPage);
  }
  
  // Render featured products
  function renderFeaturedProducts() {
    const container = document.getElementById("featured-products");
    if (!container) return;
    
    container.innerHTML = "";
  
    if (featuredProducts.length === 0) {
        container.innerHTML = "<p class='text-gray-500 col-span-full'>No featured products available.</p>";
        return;
    }
  
    featuredProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg overflow-hidden shadow-sm";
  
        card.innerHTML = `
            <!-- Prescription Badge -->
  
            <!-- Stock Status -->
            ${
              !product.inStock
              ? `<span class="absolute top-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Out of Stock
              </span>`
              : ""
            }
  
            <a href="../../shop/product/product.html?id=${product.id}">
                <div class="p-4 flex justify-center items-center">
                    ${product.image_url ? 
                      `<img src="${product.image_url}" alt="${product.name}" class="h-32 object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="placeholder-icon" style="display: none;"><i class="fas fa-pills text-gray-400 text-4xl"></i></div>` :
                      `<div class="placeholder-icon"><i class="fas fa-pills text-gray-400 text-4xl"></i></div>`
                    }
                </div>
            </a>
            <div class="p-4">
                <h3 class="font-semibold text-sm">
                    <a href="../../shop/product/product.html?id=${product.id}">${product.name}</a>
                </h3>
                <p class="text-xs text-gray-500 truncate">${product.composition || 'No description available'}</p>
                <p class="font-semibold mt-2 text-sm">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
                <button class="w-full bg-[#A1E970] bg-opacity-90 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-[#A1E970] add-to-cart-btn text-sm ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}" 
                  data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                    ${!product.inStock ? 'Out of Stock' : 'Add to cart'}
                </button>
            </div>
        `;
  
        container.appendChild(card);
  
        // Attach event if product is in stock
        if (product.inStock) {
          const addButton = card.querySelector(".add-to-cart-btn");
          if (addButton) {
            addButton.addEventListener("click", function() {
              addToCart(this.getAttribute("data-id"));
            });
          }
        }
    });
  }
  
  // Add product to cart
 // Add product to cart
async function addToCart(productId) {
    // Check if user is logged in first
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showLoginRequiredModal();
        return;
    }
    
    const now = new Date().toISOString();
    
    // User is logged in → try to save to backend
    const userId = currentUser.id;

    try {
      // Try to use the correct endpoint - adjust this based on your API
      let cartEndpoint = `http://localhost:3000/cart`;
      
      // Check if your API uses a different structure
      const res = await fetch(cartEndpoint, {
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
      
      // If the main endpoint fails, try alternative endpoints
      console.warn("Primary cart endpoint failed, trying alternatives...");
      
      // Alternative 1: Try with query parameters
      const altRes1 = await fetch(`http://localhost:3000/cart/add?user_id=${userId}&product_id=${productId}&quantity=1`, {
        method: 'POST'
      });
      
      if (altRes1.ok) {
        showNotification("Product added to cart!", "success");
        return;
      }
      
      // Alternative 2: Try different endpoint structure
      const altRes2 = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          productId: productId,
          quantity: 1
        })
      });
      
      if (altRes2.ok) {
        showNotification("Product added to cart!", "success");
        return;
      }
      
      // If all backend attempts fail, show error
      console.warn("All backend attempts failed");
      showNotification("Failed to add product to cart. Please try again.", "error");
      
    } catch (err) {
      console.error("Error adding to cart (backend):", err);
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
  
  // Make functions globally available
  window.showLoginRequiredModal = showLoginRequiredModal;
  window.closeLoginRequiredModal = closeLoginRequiredModal;
  window.goToLogin = goToLogin;
  
  // Helper functions to get product details
  function getProductName(productId) {
    const product = products.find(p => p.id == productId || p.product_id == productId);
    return product ? product.name : 'Product';
  }
  
  function getProductPrice(productId) {
    const product = products.find(p => p.id == productId || p.product_id == productId);
    return product ? product.price : 0;
  }
  
  function getProductImage(productId) {
    const product = products.find(p => p.id == productId || p.product_id == productId);
    return product ? product.image_url : null;
  }
  
  // Show success message with animation
  function showCartSuccessMessage() {
    // Create or get success message element
    let successMsg = document.getElementById('cart-success-message');
    
    if (!successMsg) {
      successMsg = document.createElement('div');
      successMsg.id = 'cart-success-message';
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 opacity-0 translate-y-[-100px]';
      successMsg.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Product added to cart!</span>
        </div>
      `;
      document.body.appendChild(successMsg);
    }
    
    // Show message
    successMsg.classList.remove('opacity-0', 'translate-y-[-100px]');
    successMsg.classList.add('opacity-100', 'translate-y-0');
    
    // Hide after 3 seconds
    setTimeout(() => {
      successMsg.classList.remove('opacity-100', 'translate-y-0');
      successMsg.classList.add('opacity-0', 'translate-y-[-100px]');
    }, 3000);
  }
  
  // Update the fetchData function to ensure products are loaded before cart operations
  async function fetchData() {
    try {
      // Fetch products
      const productsResponse = await fetch("http://localhost:3000/products");
      if (!productsResponse.ok) throw new Error("Failed to fetch products");
      products = await productsResponse.json();
      
      // Fetch categories
      const categoriesResponse = await fetch("http://localhost:3000/categories");
      if (categoriesResponse.ok) {
        categories = await categoriesResponse.json();
        renderCategoryFilters();
      }
      
      // Fetch inventory to check stock status
      const inventoryResponse = await fetch("http://localhost:3000/inventory");
      if (inventoryResponse.ok) {
        const inventory = await inventoryResponse.json();
        
        // Add stock information to products
        products = products.map(product => {
          const inventoryItem = inventory.find(item => item.product_id === product.product_id);
          return {
            ...product,
            stock: inventoryItem ? inventoryItem.quantity_in_stock : 0,
            inStock: inventoryItem ? inventoryItem.quantity_in_stock > 0 : false
          };
        });
      }
      
      // Filter featured products (only 5)
      featuredProducts = products.filter(product => product.featured_product === true).slice(0, 5);
      
      // Initialize filtered products
      filteredProducts = [...products];
      
      // Render featured products
      renderFeaturedProducts();
      
      // Apply initial filters and render products
      applyFilters();
      
    } catch (err) {
      console.error("Error fetching data:", err);
      const productList = document.getElementById("product-list");
      if (productList) {
        productList.innerHTML = "<p class='text-red-500 col-span-full'>Failed to load products.</p>";
      }
    }
  }
  
  // Render products for current page
  function renderProducts(page = 1) {
    const container = document.getElementById("product-list");
    if (!container) return;
    
    container.innerHTML = "";
  
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageProducts = filteredProducts.slice(start, end);
  
    if (pageProducts.length === 0) {
        container.innerHTML = "<p class='text-gray-500 col-span-full'>No products found.</p>";
        return;
    }
  
    pageProducts.forEach(product => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg overflow-hidden shadow-sm p-3 relative";
        
  
        card.innerHTML = `
            <!-- Prescription Badge -->
  
            <!-- Stock Status -->
            ${
              !product.inStock
              ? `<span class="absolute top-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Out of Stock
              </span>`
              : ""
            }
  
            <a href="../../shop/product/product.html?id=${product.id}">
                <div class="p-4 flex justify-center items-center">
                    ${product.image_url ? 
                      `<img src="${product.image_url}" alt="${product.name}" class="h-32 object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="placeholder-icon" style="display: none;"><i class="fas fa-pills text-gray-400 text-4xl"></i></div>` :
                      `<div class="placeholder-icon"><i class="fas fa-pills text-gray-400 text-4xl"></i></div>`
                    }
                </div>
            </a>
            <h3 class="font-semibold mt-2 text-sm">
                <a href="../../shop/product/product.html?id=${product.id}">${product.name}</a>
            </h3>
            <p class="text-xs text-gray-500 truncate">${product.composition || 'No description available'}</p>
            <p class="font-semibold mt-2 text-sm">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
            <button class="w-full bg-[#A1E970] bg-opacity-90 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-[#A1E970] add-to-cart-btn text-sm ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}" 
              data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                ${!product.inStock ? 'Out of Stock' : 'Add to cart'}
            </button>
        `;
  
        container.appendChild(card);
  
        // Attach event if product is in stock
        if (product.inStock) {
          const addButton = card.querySelector(".add-to-cart-btn");
          if (addButton) {
            addButton.addEventListener("click", function() {
              addToCart(this.getAttribute("data-id"));
            });
          }
        }
    });
  
    renderPagination(page);
  }
  
  // Pagination UI
  function renderPagination(activePage) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;
    
    pagination.innerHTML = "";
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
    // Hide pagination if only one page
    if (totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }
    
    pagination.style.display = "flex";
  
    // Prev
    pagination.insertAdjacentHTML("beforeend", `
        <button 
            class="px-3 py-1 border rounded text-sm ${activePage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}"
            ${activePage === 1 ? "disabled" : `onclick="changePage(${activePage - 1})"`}
        >Prev</button>
    `);
  
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        pagination.insertAdjacentHTML("beforeend", `
            <button 
                class="px-3 py-1 border rounded text-sm ${i === activePage ? "bg-[#A1E970] font-bold" : "hover:bg-gray-200"}"
                onclick="changePage(${i})"
            >${i}</button>
        `);
    }
  
    // Next
    pagination.insertAdjacentHTML("beforeend", `
        <button 
            class="px-3 py-1 border rounded text-sm ${activePage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}"
            ${activePage === totalPages ? "disabled" : `onclick="changePage(${activePage + 1})"`}
        >Next</button>
    `);
  }
  
  function changePage(page) {
    currentPage = page;
    renderProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Setup search functionality
  function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const filterSearch = document.getElementById('filter-search');
    
    // Check if elements exist before adding event listeners
    const handleSearch = (value) => {
      filterState.searchTerm = value;
      currentPage = 1;
      applyFilters();
    };
    
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        handleSearch(this.value);
      });
    }
    
    if (filterSearch) {
      filterSearch.addEventListener('input', function() {
        handleSearch(this.value);
      });
    }
  }
  
  // Setup filter controls
  function setupFilters() {
    // Price range filter
    const priceRange = document.getElementById('price-range');
    const maxPriceDisplay = document.getElementById('max-price-display');
    const mobilePriceRange = document.getElementById('mobile-price-range');
    const mobileMaxPriceDisplay = document.getElementById('mobile-max-price-display');
    
    // Calculate max price from products
    const maxProductPrice = Math.max(...products.map(p => p.price), 100);
    
    if (priceRange && maxPriceDisplay) {
      priceRange.max = maxProductPrice;
      priceRange.value = maxProductPrice;
      maxPriceDisplay.textContent = `$${maxProductPrice}`;
      filterState.maxPrice = maxProductPrice;
      
      priceRange.addEventListener('input', function() {
        maxPriceDisplay.textContent = `$${this.value}`;
        filterState.maxPrice = parseFloat(this.value);
        applyFilters();
      });
    }
    
    if (mobilePriceRange && mobileMaxPriceDisplay) {
      mobilePriceRange.max = maxProductPrice;
      mobilePriceRange.value = maxProductPrice;
      mobileMaxPriceDisplay.textContent = `$${maxProductPrice}`;
      
      mobilePriceRange.addEventListener('input', function() {
        mobileMaxPriceDisplay.textContent = `$${this.value}`;
        filterState.maxPrice = parseFloat(this.value);
      });
    }
    
    // In stock filter
    const inStockFilter = document.getElementById('filter-instock');
    const mobileInStockFilter = document.getElementById('mobile-filter-instock');
    
    if (inStockFilter) {
      inStockFilter.addEventListener('change', function() {
        filterState.inStockOnly = this.checked;
        applyFilters();
      });
    }
    
    if (mobileInStockFilter) {
      mobileInStockFilter.addEventListener('change', function() {
        filterState.inStockOnly = this.checked;
      });
    }
    
    // Prescription filter
    const prescriptionFilter = document.getElementById('filter-prescription');
    const mobilePrescriptionFilter = document.getElementById('mobile-filter-prescription');
    
    if (prescriptionFilter) {
      prescriptionFilter.addEventListener('change', function() {
        filterState.requiresPrescription = this.checked;
        applyFilters();
      });
    }
    
    if (mobilePrescriptionFilter) {
      mobilePrescriptionFilter.addEventListener('change', function() {
        filterState.requiresPrescription = this.checked;
      });
    }
    
    // Sort options
    const sortOptions = document.getElementById('sort-options');
    const mobileSortOptions = document.getElementById('mobile-sort-options');
    
    if (sortOptions) {
      sortOptions.addEventListener('change', function() {
        filterState.sortBy = this.value;
        applyFilters();
      });
    }
    
    if (mobileSortOptions) {
      mobileSortOptions.addEventListener('change', function() {
        filterState.sortBy = this.value;
      });
    }
    
    // Clear filters
    const clearFilters = document.getElementById('clear-filters');
    const mobileClearFilters = document.getElementById('mobile-clear-filters');
    const resetFilters = document.getElementById('reset-filters');
    
    const clearAllFilters = () => {
      filterState = {
        searchTerm: '',
        selectedCategories: [],
        maxPrice: Math.max(...products.map(p => p.price), 100),
        inStockOnly: true,
        requiresPrescription: false,
        sortBy: 'relevance'
      };
      
      // Reset UI elements
      if (document.getElementById('filter-search')) {
        document.getElementById('filter-search').value = '';
      }
      if (document.getElementById('search-input')) {
        document.getElementById('search-input').value = '';
      }
      if (priceRange && maxPriceDisplay) {
        priceRange.value = filterState.maxPrice;
        maxPriceDisplay.textContent = `$${filterState.maxPrice}`;
      }
      if (mobilePriceRange && mobileMaxPriceDisplay) {
        mobilePriceRange.value = filterState.maxPrice;
        mobileMaxPriceDisplay.textContent = `$${filterState.maxPrice}`;
      }
      if (document.getElementById('filter-instock')) {
        document.getElementById('filter-instock').checked = true;
      }
      if (document.getElementById('mobile-filter-instock')) {
        document.getElementById('mobile-filter-instock').checked = true;
      }
      if (document.getElementById('filter-prescription')) {
        document.getElementById('filter-prescription').checked = false;
      }
      if (document.getElementById('mobile-filter-prescription')) {
        document.getElementById('mobile-filter-prescription').checked = false;
      }
      if (document.getElementById('sort-options')) {
        document.getElementById('sort-options').value = 'relevance';
      }
      if (document.getElementById('mobile-sort-options')) {
        document.getElementById('mobile-sort-options').value = 'relevance';
      }
      
      // Clear category checkboxes
      document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      document.querySelectorAll('.mobile-category-checkbox').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      filterState.selectedCategories = [];
      currentPage = 1;
      applyFilters();
    };
    
    if (clearFilters) {
      clearFilters.addEventListener('click', clearAllFilters);
    }
    if (mobileClearFilters) {
      mobileClearFilters.addEventListener('click', clearAllFilters);
    }
    if (resetFilters) {
      resetFilters.addEventListener('click', clearAllFilters);
    }
  }
  
  // Setup mobile filters
  function setupMobileFilters() {
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const mobileFiltersModal = document.getElementById('mobile-filters-modal');
    const closeMobileFilters = document.getElementById('close-mobile-filters');
    const mobileApplyFilters = document.getElementById('mobile-apply-filters');
    
    if (!mobileFilterBtn || !mobileFiltersModal || !closeMobileFilters || !mobileApplyFilters) return;
    
    mobileFilterBtn.addEventListener('click', function() {
      mobileFiltersModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    closeMobileFilters.addEventListener('click', function() {
      mobileFiltersModal.classList.add('hidden');
      document.body.style.overflow = ''; // Re-enable scrolling
    });
    
    mobileApplyFilters.addEventListener('click', function() {
      mobileFiltersModal.classList.add('hidden');
      document.body.style.overflow = ''; // Re-enable scrolling
      applyFilters(); // Apply the filters when user clicks apply
    });
    
    // Close modal when clicking outside content
    mobileFiltersModal.addEventListener('click', function(e) {
      if (e.target === mobileFiltersModal) {
        mobileFiltersModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  }
  
  // // Initialize everything when DOM is loaded
  // document.addEventListener("DOMContentLoaded", function() {
  //   fetchData().then(() => {
  //     setupSearch();
  //     setupFilters();
  //     setupMobileFilters();
  //   });
  // });

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    const categoryParam = getQueryParam('category'); // e.g., "Pain relief"
    
    fetchData().then(() => {
      setupSearch();
      setupFilters();
      setupMobileFilters();
  
      // Apply category filter if query param exists
      if (categoryParam) {
        const categoryObj = categories.find(c => c.name.toLowerCase() === categoryParam.toLowerCase());
        if (categoryObj) {
          filterState.selectedCategories = [categoryObj.category_id];
  
          // Check the corresponding checkbox
          const checkbox = document.getElementById(`category-${categoryObj.category_id}`);
          if (checkbox) checkbox.checked = true;
  
          applyFilters();
        }
      }
    });
  });
  
  
  // Make changePage function available globally
  window.changePage = changePage;