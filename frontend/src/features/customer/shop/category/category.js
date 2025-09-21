let currentPage = 1;
const itemsPerPage = 10;
let allCategoryProducts = [];
let filteredProducts = [];

// Load header and footer components
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

// Category descriptions
const categoryDescriptions = {
    "Pain Relief": "Find effective pain relief solutions for various conditions, including headaches, muscle aches, and arthritis. Our selection includes over-the-counter medications and prescription options.",
    "Cold and Flu": "Relieve cold and flu symptoms with our range of decongestants, cough suppressants, and fever reducers. Get back to feeling your best quickly.",
    "Vitamins and Supplements": "Boost your immune system and overall health with our premium selection of vitamins and supplements for all your nutritional needs.",
    "Dermalogy": "Skin care products and treatments for various dermatological conditions to keep your skin healthy and radiant.",
    "Respiratory": "Medications and devices to help manage respiratory conditions like asthma, COPD, and allergies.",
    "Cardiac": "Heart health medications and supplements to support cardiovascular wellness.",
    "Diabetics": "Products and supplies for diabetes management, including glucose monitors and medications.",
    "Gastrointestinal": "Treatments for digestive issues, from antacids to medications for more serious conditions.",
    "First Aid": "Essential first aid supplies for treating minor injuries at home or on the go.",
    "Baby Products": "Gentle and safe products specially formulated for your baby's delicate needs.",
    "Essentials": "Everyday healthcare essentials for your medicine cabinet and first aid kit."
};

// Get category from URL parameter
function getCategoryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('category') || 'Pain Relief';
}

// Update page content based on category
function updateCategoryPage() {
    const category = getCategoryFromUrl();
    
    // Update page title
    document.title = `${category} Products | J-Med`;
    
    // Update breadcrumb and category name
    document.getElementById('category-name').textContent = category;
    document.getElementById('category-title').textContent = category;
    
    // Update category description
    const description = categoryDescriptions[category] || `Browse our selection of ${category} products.`;
    document.getElementById('category-description').textContent = description;
    
    // Update search placeholder
    document.getElementById('search-input').placeholder = `Search for ${category.toLowerCase()} products`;
    
    // Load products for this category
    loadProducts(category);
}

// Fetch products from JSON server
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/medicine');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Load products for the selected category
async function loadProducts(category) {
    const allProducts = await fetchProducts();
    allCategoryProducts = allProducts.filter(product => 
        product.category && product.category.toLowerCase() === category.toLowerCase()
    );
    
    filteredProducts = [...allCategoryProducts];
    
    const featuredContainer = document.getElementById('featured-products');
    
    // Clear existing products
    featuredContainer.innerHTML = '';
    
    // Filter and display featured products (max 5)
    const featuredProducts = allCategoryProducts
        .filter(product => product.featured_product === true)
        .slice(0, 5);
    
    // Display featured products
    if (featuredProducts.length > 0) {
        featuredProducts.forEach(product => {
            featuredContainer.appendChild(createProductCard(product, true));
        });
    } else {
        featuredContainer.innerHTML = '<p class="text-gray-500 col-span-full">No featured products in this category.</p>';
    }
    
    // Display paginated products
    renderProducts(currentPage);
    renderPagination(currentPage);
}

// Display products for a specific page
function renderProducts(page) {
    const allProductsContainer = document.getElementById('all-products');
    allProductsContainer.innerHTML = '';
    
    // Get products for current page
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Display products for current page
    if (currentProducts.length > 0) {
        currentProducts.forEach(product => {
            allProductsContainer.appendChild(createProductCard(product, false));
        });
    } else {
        allProductsContainer.innerHTML = '<p class="text-gray-500 col-span-full">No products found in this category.</p>';
    }
}

// Create product card HTML (matching shop page style)
function createProductCard(product, isFeatured) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg overflow-hidden shadow-sm relative';
    
    card.innerHTML = `
        <!-- Prescription Badge -->
        ${
            product.prescription_required
            ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                Prescription Required
            </span>`
            : ""
        }

        <a href="../../shop/product/product.html?id=${product.id}">
            <div class="bg-[#A1E970] bg-opacity-50 p-4 flex justify-center items-center h-48">
                ${product.image_url || product.image ? 
                  `<img src="${product.image_url || product.image}" alt="${product.name}" class="h-full object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div class="placeholder-icon" style="display: none;"><i class="fas fa-pills text-gray-400 text-4xl"></i></div>` :
                  `<div class="placeholder-icon"><i class="fas fa-pills text-gray-400 text-4xl"></i></div>`
                }
            </div>
        </a>
        <div class="p-4">
            <h3 class="font-semibold">
                <a href="../../shop/product/product.html?id=${product.id}">${product.name}</a>
            </h3>
            <p class="text-sm text-gray-500">${product.composition || product.description || 'No description available'}</p>
            <p class="font-semibold mt-2">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
            <button class="w-full bg-[#A1E970] bg-opacity-90 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-[#A1E970] add-to-cart-btn" data-id="${product.id}">
                Add to cart
            </button>
        </div>
    `;
    
    // Attach event
    card.querySelector(".add-to-cart-btn").addEventListener("click", function() {
        addToCart(this.getAttribute("data-id"));
    });
    
    return card;
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// Add product to cart (same as shop page)
async function addToCart(productId) {
    const now = new Date().toISOString();
    
    // Case 1: User is logged in → save to backend
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userId = currentUser.id;

        try {
            // Check if product already in backend cart
            const res = await fetch(`http://localhost:3000/cart?user_id=${userId}&product_id=${productId}`);
            const data = await res.json();

            if (data.length > 0) {
                // Already in cart → increment quantity
                const existingItem = data[0];
                await fetch(`http://localhost:3000/cart/${existingItem.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity: existingItem.quantity + 1 })
                });
            } else {
                // Not in cart → add new record
                await fetch("http://localhost:3000/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        product_id: productId,
                        quantity: 1,
                        status: "active",
                        added_at: now
                    })
                });
            }

            alert("Product added to cart!");
        } catch (err) {
            console.error("Error adding to cart (backend):", err);
        }
    }

    // Case 2: User is NOT logged in → save in localStorage
    else {
        
        let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

        const existingItem = guestCart.find(item => item.product_id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            guestCart.push({
                product_id: productId,
                quantity: 1,
                added_at: now
            });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        alert("Product added to cart (guest mode)!");
    }
}

// Pagination UI (matching shop page style)
function renderPagination(activePage) {
    const pagination = document.getElementById("pagination");
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
            class="px-3 py-1 border rounded ${activePage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}"
            ${activePage === 1 ? "disabled" : `onclick="changePage(${activePage - 1})"`}
        >Prev</button>
    `);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        pagination.insertAdjacentHTML("beforeend", `
            <button 
                class="px-3 py-1 border rounded ${i === activePage ? "bg-[#A1E970] font-bold" : "hover:bg-gray-200"}"
                onclick="changePage(${i})"
            >${i}</button>
        `);
    }

    // Next
    pagination.insertAdjacentHTML("beforeend", `
        <button 
            class="px-3 py-1 border rounded ${activePage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}"
            ${activePage === totalPages ? "disabled" : `onclick="changePage(${activePage + 1})"`}
        >Next</button>
    `);
}

// Change page function
function changePage(page) {
    currentPage = page;
    renderProducts(page);
    renderPagination(page);
    // Scroll to top of products section
    document.getElementById('all-products').scrollIntoView({ behavior: 'smooth' });
}

// Search functionality (matching shop page)
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        if (searchTerm === '') {
            filteredProducts = [...allCategoryProducts];
            renderProducts(currentPage);
            renderPagination(currentPage);
        } else {
            // Filter products based on search term
            filteredProducts = allCategoryProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                (product.composition && product.composition.toLowerCase().includes(searchTerm)) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
            
            // Display filtered products
            const container = document.getElementById("all-products");
            container.innerHTML = "";
            
            if (filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    container.appendChild(createProductCard(product, false));
                });
                
                // Hide pagination for search results
                document.getElementById("pagination").style.display = "none";
            } else {
                container.innerHTML = "<p class='text-gray-500 col-span-full'>No products match your search.</p>";
                document.getElementById("pagination").style.display = "none";
            }
        }
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateCategoryPage();
    setupSearch();
});



// Get category from query string ?category=Pain%20Relief
// const params = new URLSearchParams(window.location.search);
// const category = params.get("category") || "All";

// let medicines = [];

// // Fetch medicine data
// async function fetchMedicines() {
//   try {
//     const res = await fetch("http://localhost:3000/medicine");
//     if (!res.ok) throw new Error("Failed to fetch medicines");
//     medicines = await res.json();
//     renderProducts(category);
//   } catch (err) {
//     console.error(err);
//   }
// }

// // Render products dynamically
// function renderProducts(category) {
//   const container = document.getElementById("category-content");
//   container.innerHTML = ""; // clear previous

//   const filtered = category === "All" ? medicines : medicines.filter(m => m.category === category);

//   // Breadcrumb & Title
//   const breadcrumb = document.createElement("div");
//   breadcrumb.className = "mb-8";
//   breadcrumb.innerHTML = `<span class="text-sm text-gray-500">Categories / </span><span class="text-sm text-gray-800 font-medium">${category}</span>`;
//   container.appendChild(breadcrumb);

//   const section = document.createElement("section");
//   section.className = "mb-12";
//   section.innerHTML = `
//     <h1 class="text-4xl font-bold text-gray-900 mb-4">${category}</h1>
//     <p class="text-gray-600 max-w-3xl">Explore our selection of ${category.toLowerCase()} products.</p>
//     <div class="mt-6 relative max-w-md">
//       <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
//       <input id="search-input" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search ${category.toLowerCase()} products" type="text"/>
//     </div>
//   `;
//   container.appendChild(section);

//   const gridSection = document.createElement("section");
//   const title = document.createElement("h2");
//   title.className = "text-2xl font-bold text-gray-900 mb-6";
//   title.textContent = `${category} Products`;
//   gridSection.appendChild(title);

//   const grid = document.createElement("div");
//   grid.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6";

//   filtered.forEach(m => {
//     const card = document.createElement("div");
//     card.className = "bg-white rounded-lg";
//     card.innerHTML = `
//       <div class="bg-orange-100 rounded-lg p-4 flex justify-center items-center">
//         <img src="${m.image_url}" alt="${m.name}" class="h-32 object-contain"/>
//       </div>
//       <div class="pt-4">
//         <h3 class="font-medium text-gray-800">${m.name}</h3>
//         <p class="text-sm text-gray-500">${m.composition}</p>
//         <p class="font-medium text-gray-900 mt-1">$${m.price.toFixed(2)}</p>
//         <button class="mt-4 w-full bg-lime-400 hover:bg-lime-500 text-lime-900 font-bold py-2 px-4 rounded-lg transition duration-300">Add to cart</button>
//       </div>
//     `;
//     grid.appendChild(card);
//   });

//   gridSection.appendChild(grid);
//   container.appendChild(gridSection);

//   // Live search
//   const searchInput = document.getElementById("search-input");
//   searchInput.addEventListener("input", () => {
//     const query = searchInput.value.toLowerCase();
//     grid.querySelectorAll("div.bg-white").forEach(card => {
//       const name = card.querySelector("h3").textContent.toLowerCase();
//       const comp = card.querySelector("p.text-sm").textContent.toLowerCase();
//       card.style.display = name.includes(query) || comp.includes(query) ? "block" : "none";
//     });
//   });
// }

// // Initialize
// fetchMedicines();

