// function loadComponent(id, filePath) {
//     fetch(filePath)
//       .then(response => response.text())
//       .then(data => {
//         document.getElementById(id).innerHTML = data;
//       })
//       .catch(err => console.error("Error loading component:", err));
//   }
//   loadComponent("header", "/frontend/src/core/components/navbar.html");
//   loadComponent("footer", "/frontend/src/core/components/footer.html");

//   async function fetchProduct() {
//     const params = new URLSearchParams(window.location.search);
//     const id = params.get("id");
  
//     if (!id) {
//       document.getElementById("product-detail").innerHTML =
//         "<p class='text-red-500'>No product selected.</p>";
//       return;
//     }
  
//     try {
//       const res = await fetch(`http://localhost:3000/medicine/${id}`);
//       if (!res.ok) throw new Error("Failed to fetch product");
//       const product = await res.json();
  
//       // Render product details
//       document.getElementById("product-detail").innerHTML = `
//       <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
//       <!-- Left Side (Image) -->
//       <div class="flex flex-col">
//         <div class="bg-[#A1E970] bg-opacity-50 rounded-lg flex items-center justify-center p-6">
//           <img src="${product.image_url}" alt="${product.name}" 
//                class="w-full max-h-[450px] object-contain rounded-lg" />
//         </div>
//         <p class="text-center text-2xl font-bold text-gray-900 mt-6">
//           MRP Rs.${product.price}
//         </p>
//       </div>
    
//       <!-- Right Side (Details + Cart) -->
//       <div class="flex flex-col h-full">
//         <!-- Product Details -->
//         <div class="flex-1">
//           <h2 class="text-3xl font-bold text-gray-900">${product.name}</h2>
//           <p class="text-gray-500 mt-1">${product.composition}</p>
    
//           <div class="mt-6">
//             <h3 class="text-lg font-semibold text-gray-900">Category</h3>
//             <p class="text-gray-600 mt-1">${product.category}</p>
//           </div>
    
//           <div class="mt-6">
//             <h3 class="text-lg font-semibold text-gray-900">Use By</h3>
//             <p class="text-gray-600 mt-1">${product.expiry_date}</p>
//           </div>
    
//           <div class="mt-6">
//             <h3 class="text-lg font-semibold text-gray-900">Manufacturer</h3>
//             <p class="text-gray-600 mt-1">${product.manufacturer}</p>
//           </div>
    
//           <div class="mt-6">
//             <h3 class="text-lg font-semibold text-gray-900">Description</h3>
//             <p class="text-gray-600 mt-1">${product.description}</p>
//           </div>
    
//           <div class="mt-6">
//             <h3 class="text-lg font-semibold text-gray-900">Side Effects</h3>
//             <p class="text-gray-600 mt-1">${product.side_effects}</p>
//           </div>
//         </div>
    
//         <!-- Cart Controls -->
//         <div class="mt-8 flex items-center space-x-6">
//           <div class="flex items-center border border-gray-300 rounded-lg">
//             <button id="decrement" 
//                     class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg">
//               <span class="material-icons text-base">remove</span>
//             </button>
//             <input id="quantity" type="number" min="1" value="1" 
//                    class="w-16 text-center py-2 px-4 focus:outline-none" />
//             <button id="increment" 
//                     class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">
//               <span class="material-icons text-base">add</span>
//             </button>
//           </div>
//           <button id="add-to-cart" 
//             class="flex-1 bg-[#A1E970] bg-opacity-90 hover:bg-[#A1E970] text-black font-bold py-3 px-6 rounded-lg transition duration-300">
//             Add to cart
//           </button>
//         </div>
//       </div>
//     </div>
    
//       `;
  
//       // ✅ Attach functionality AFTER rendering
//       const quantityInput = document.getElementById("quantity");
//       const incrementBtn = document.getElementById("increment");
//       const decrementBtn = document.getElementById("decrement");
//       const addToCartBtn = document.getElementById("add-to-cart");
  
//       incrementBtn.addEventListener("click", () => {
//         quantityInput.value = parseInt(quantityInput.value) + 1;
//       });
  
//       decrementBtn.addEventListener("click", () => {
//         let currentValue = parseInt(quantityInput.value);
//         if (currentValue > 1) {
//           quantityInput.value = currentValue - 1;
//         }
//       });
  
//       addToCartBtn.addEventListener("click", () => {
//         const quantity = parseInt(quantityInput.value);
//         addToCart(product.id, quantity);
//       });
  
//     } catch (err) {
//       console.error(err);
//       document.getElementById("product-detail").innerHTML =
//         "<p class='text-red-500'>Failed to load product.</p>";
//     }
//   }
  
//   // Get current user from localStorage
//   function getCurrentUser() {
//     return JSON.parse(localStorage.getItem("currentUser"));
//   }
  
//   // Add product to cart (same functionality as browse.js but with quantity support)
//   async function addToCart(productId, quantity = 1) {
//     const now = new Date().toISOString();
    
//     // Case 1: User is logged in → save to backend
//     const currentUser = getCurrentUser();
//     if (currentUser) {
//       const userId = currentUser.id;
  
//       try {
//         // Check if product already in backend cart
//         const res = await fetch(`http://localhost:3000/cart?user_id=${userId}&product_id=${productId}`);
//         const data = await res.json();
  
//         if (data.length > 0) {
//           // Already in cart → increment quantity
//           const existingItem = data[0];
//           await fetch(`http://localhost:3000/cart/${existingItem.id}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ quantity: existingItem.quantity + quantity })
//           });
//         } else {
//           // Not in cart → add new record
//           await fetch("http://localhost:3000/cart", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               user_id: userId,
//               product_id: productId,
//               quantity: quantity,
//               status: "active",
//               added_at: now
//             })
//           });
//         }
  
//         alert("Product added to cart!");
//       } catch (err) {
//         console.error("Error adding to cart (backend):", err);
//       }
//     }
  
//     // Case 2: User is NOT logged in → save in localStorage
//     else {
//       let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
  
//       const existingItem = guestCart.find(item => item.product_id === productId);
  
//       if (existingItem) {
//         existingItem.quantity += quantity;
//       } else {
//         guestCart.push({
//           product_id: productId,
//           quantity: quantity,
//           added_at: now
//         });
//       }
  
//       localStorage.setItem("guestCart", JSON.stringify(guestCart));
//       alert("Product added to cart (guest mode)!");
//       console.log(guestCart);
//     }
//   }
  
//   document.addEventListener("DOMContentLoaded", fetchProduct);


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
  
  // Load components
  document.addEventListener('DOMContentLoaded', function () {
    loadComponent("header", "/frontend/src/core/components/navbar.html");
    loadComponent("footer", "/frontend/src/core/components/footer.html");
    initPage();
  });

async function fetchProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
      document.getElementById("product-detail").innerHTML =
          "<p class='text-red-500'>No product selected.</p>";
      return;
  }

  try {
      // Updated to use the correct endpoint
      const res = await fetch(`http://localhost:3000/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      const product = await res.json();

      // Fetch inventory data for stock status
      const inventoryRes = await fetch(`http://localhost:3000/inventory?product_id=${product.product_id || product.id}`);
      const inventoryData = await inventoryRes.json();
      const inventory = inventoryData.length > 0 ? inventoryData[0] : null;
      
      let stockStatus = "Out of Stock";
      let stockClass = "text-red-600";
      
      if (inventory && inventory.quantity_in_stock > 0) {
          if (inventory.quantity_in_stock > 10) {
              stockStatus = `In Stock (${inventory.quantity_in_stock})`;
              stockClass = "text-green-600";
          } else {
              stockStatus = `Low Stock (${inventory.quantity_in_stock})`;
              stockClass = "text-yellow-600";
          }
      }

      // Render product details
      document.getElementById("product-detail").innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <!-- Left Side (Image) -->
          <div class="flex flex-col">
              <div class="image-zoom-container rounded-lg flex items-center justify-center p-4 md:p-6">
                  <img src="${product.image_url}" alt="${product.name}" 
                       class="w-full max-h-[350px] md:max-h-[450px] object-contain rounded-lg cursor-zoom-in" />
              </div>
              <div class="flex justify-center mt-4 space-x-2">
                  <div class="w-16 h-16 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                      <img src="${product.image_url}" alt="${product.name} thumbnail" 
                           class="w-14 h-14 object-contain" />
                  </div>
                  <!-- Additional thumbnails would go here -->
              </div>
              <p class="text-center text-2xl font-bold text-gray-900 mt-4 md:mt-6">
                  MRP Rs.${product.price}
              </p>
              <p class="text-center ${stockClass} font-medium mt-2">
                  ${stockStatus}
              </p>
          </div>
      
          <!-- Right Side (Details + Cart) -->
          <div class="flex flex-col h-full">
              <!-- Product Details -->
              <div class="flex-1">
                  <h2 class="text-2xl md:text-3xl font-bold text-gray-900">${product.name}</h2>
                  <p class="text-gray-500 mt-1">${product.composition}</p>
          
                  <div class="mt-4 md:mt-6">
                      <h3 class="text-base md:text-lg font-semibold text-gray-900">Category</h3>
                      <p class="text-gray-600 mt-1">${product.category}</p>
                  </div>
          
                  <div class="mt-4 md:mt-6">
                      <h3 class="text-base md:text-lg font-semibold text-gray-900">Use By</h3>
                      <p class="text-gray-600 mt-1">${new Date(product.expiry_date).toLocaleDateString()}</p>
                  </div>
          
                  <div class="mt-4 md:mt-6">
                      <h3 class="text-base md:text-lg font-semibold text-gray-900">Manufacturer</h3>
                      <p class="text-gray-600 mt-1">${product.manufacturer}</p>
                  </div>
          
                  <!-- Information Tabs -->
                  <div class="mt-6 border-b border-gray-200">
                      <div class="flex flex-wrap -mb-px text-sm font-medium text-center">
                          <button class="tab-link mr-2 md:mr-4 py-2 px-1 md:px-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 text-gray-500 active-tab" data-tab="description">
                              Description
                          </button>
                          <button class="tab-link mr-2 md:mr-4 py-2 px-1 md:px-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 text-gray-500" data-tab="composition">
                              Composition
                          </button>
                          <button class="tab-link mr-2 md:mr-4 py-2 px-1 md:px-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 text-gray-500" data-tab="side-effects">
                              Side Effects
                          </button>
                          <button class="tab-link py-2 px-1 md:px-4 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 text-gray-500" data-tab="safety">
                              Safety Info
                          </button>
                      </div>
                  </div>
          
                  <div class="mt-4">
                      <div id="tab-description" class="tab-content active">
                          <p class="text-gray-600 text-m">${product.description}</p>
                      </div>
                      <div id="tab-composition" class="tab-content">
                          <p class="text-gray-600 text-m">${product.composition}</p>
                      </div>
                      <div id="tab-side-effects" class="tab-content">
                          <p class="text-gray-600 text-m">${product.side_effects || 'No significant side effects reported.'}</p>
                      </div>
                      <div id="tab-safety" class="tab-content">
                          <p class="text-gray-600">
                              <strong>Expiry Date:</strong> ${new Date(product.expiry_date).toLocaleDateString()}<br>
                              <strong>Manufacturer:</strong> ${product.manufacturer}<br>
                              ${product.how_to_use ? `<strong>How to Use:</strong> ${product.how_to_use}<br>` : ''}
                              ${product.requires_prescription ? '<strong class="text-red-600">Prescription Required</strong>' : ''}
                          </p>
                      </div>
                  </div>
              </div>
      
              <!-- Cart Controls -->
              <div class="mt-6 md:mt-8">
                  ${inventory && inventory.quantity_in_stock > 0 ? `
                  <div class="flex items-center space-x-4 mb-4">
                      <span class="text-gray-700">Quantity:</span>
                      <div class="flex items-center border border-gray-300 rounded-lg">
                          <button id="decrement" 
                                  class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg">
                              <span class="material-icons text-base">remove</span>
                          </button>
                          <input id="quantity" type="number" min="1" max="${inventory.quantity_in_stock}" value="1" 
                                 class="w-12 md:w-16 text-center py-2 px-1 md:px-2 focus:outline-none" />
                          <button id="increment" 
                                  class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">
                              <span class="material-icons text-base">add</span>
                          </button>
                      </div>
                  </div>
                  <div class="flex flex-col sm:flex-row gap-3">
                      <button id="add-to-cart" 
                          class="flex-1 bg-[#A1E970] bg-opacity-90 hover:bg-[#A1E970] text-black font-bold py-3 px-4 md:px-6 rounded-lg transition duration-300">
                          Add to cart
                      </button>
                     
                  </div>
                  ` : `
                  <button class="w-full bg-gray-300 text-gray-600 font-bold py-3 px-6 rounded-lg cursor-not-allowed" disabled>
                      Out of Stock
                  </button>
                  `}
                  
                  ${product.requires_prescription ? `
                  <div id="prescription-upload" class="mt-4 p-4 border border-yellow-300 bg-yellow-50 rounded-lg prescription-upload hidden">
                      <p class="text-yellow-800 text-sm">⚠️ This product requires a prescription. Please upload your prescription to complete the purchase.</p>
                      <button id="upload-prescription-btn" class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Upload Prescription
                      </button>
                  </div>
                  ` : ''}
              </div>
          </div>
      </div>
      `;

      // ✅ Attach functionality AFTER rendering
      setupProductPage(product, inventory);

  } catch (err) {
      console.error(err);
      document.getElementById("product-detail").innerHTML =
          "<p class='text-red-500'>Failed to load product.</p>";
  }
}

function setupProductPage(product, inventory) {
  // Quantity controls
  const quantityInput = document.getElementById("quantity");
  const incrementBtn = document.getElementById("increment");
  const decrementBtn = document.getElementById("decrement");
  const addToCartBtn = document.getElementById("add-to-cart");
  const buyNowBtn = document.getElementById("buy-now");
  
  if (incrementBtn && decrementBtn && quantityInput) {
      incrementBtn.addEventListener("click", () => {
          let currentValue = parseInt(quantityInput.value);
          if (currentValue < (inventory?.quantity_in_stock || 1)) {
              quantityInput.value = currentValue + 1;
          }
      });

      decrementBtn.addEventListener("click", () => {
          let currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
              quantityInput.value = currentValue - 1;
          }
      });

      quantityInput.addEventListener("change", () => {
          let value = parseInt(quantityInput.value);
          if (isNaN(value) || value < 1) quantityInput.value = 1;
          if (inventory && value > inventory.quantity_in_stock) {
              quantityInput.value = inventory.quantity_in_stock;
          }
      });
  }

  // Add to cart functionality
  if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        //   if (product.requires_prescription) {
        //       // Show prescription upload section if not already visible
        //       const uploadSection = document.getElementById("prescription-upload");
        //       if (uploadSection) {
        //           uploadSection.classList.remove("hidden");
        //           uploadSection.scrollIntoView({ behavior: 'smooth' });
        //       }
        //   } else {
              const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
              addToCart(product.id, quantity);
        //   }
      });
  }

  // Buy now functionality
//   if (buyNowBtn) {
//       buyNowBtn.addEventListener("click", () => {
//           if (product.requires_prescription) {
//               // Show prescription upload section if not already visible
//               const uploadSection = document.getElementById("prescription-upload").display("hidden");
//               if (uploadSection) {
//                   uploadSection.classList.remove("hidden");
//                   uploadSection.scrollIntoView({ behavior: 'smooth' });
//               }
//               // Store intent to buy now
//               localStorage.setItem("buyNowProduct", JSON.stringify({
//                   productId: product.id,
//                   quantity: quantityInput ? parseInt(quantityInput.value) : 1
//               }));
//           } else {
//               const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
//               addToCart(product.id, quantity, true);
//           }
//       });
//   }

  // Tab functionality
  const tabLinks = document.querySelectorAll('.tab-link');
  tabLinks.forEach(link => {
      link.addEventListener('click', () => {
          const tabId = link.getAttribute('data-tab');
          
          // Remove active class from all tabs and contents
          tabLinks.forEach(tab => tab.classList.remove('active-tab', 'border-blue-500', 'text-blue-600'));
          document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
          
          // Add active class to clicked tab and corresponding content
          link.classList.add('active-tab', 'border-blue-500', 'text-blue-600');
          document.getElementById(`tab-${tabId}`).classList.add('active');
      });
  });

  // Image zoom functionality
  const imageContainer = document.querySelector('.image-zoom-container');
  if (imageContainer) {
      imageContainer.addEventListener('click', (e) => {
          e.preventDefault();
          imageContainer.classList.toggle('zoomed');
      });
  }

  // Prescription upload functionality
  const uploadBtn = document.getElementById('upload-prescription-btn');
  if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
          document.getElementById('prescription-modal').classList.remove('hidden');
      });
  }

  // Modal functionality
  const closeModal = document.getElementById('close-modal');
  const cancelUpload = document.getElementById('cancel-upload');
  const confirmUpload = document.getElementById('confirm-upload');
  const fileInput = document.getElementById('prescription-file');
  const fileName = document.getElementById('file-name');

  if (closeModal) {
      closeModal.addEventListener('click', hideModal);
  }
  
  if (cancelUpload) {
      cancelUpload.addEventListener('click', hideModal);
  }
  
  if (fileInput) {
      fileInput.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
              fileName.textContent = e.target.files[0].name;
              fileName.classList.remove('hidden');
              confirmUpload.disabled = false;
          } else {
              fileName.classList.add('hidden');
              confirmUpload.disabled = true;
          }
      });
  }
  
  if (confirmUpload) {
      confirmUpload.addEventListener('click', () => {
          // Here you would typically upload the file to your server
          // For now, we'll just simulate a successful upload
          alert('Prescription uploaded successfully!');
          hideModal();
          
          // Enable adding to cart
          const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
          
          // Check if user intended to buy now
          const buyNowProduct = localStorage.getItem("buyNowProduct");
          if (buyNowProduct) {
              const { productId, quantity } = JSON.parse(buyNowProduct);
              addToCart(productId, quantity, true);
              localStorage.removeItem("buyNowProduct");
          } else {
              addToCart(product.id, quantity);
          }
      });
  }

  function hideModal() {
      document.getElementById('prescription-modal').classList.add('hidden');
      fileInput.value = '';
      fileName.classList.add('hidden');
      confirmUpload.disabled = true;
  }
}

// Get current user from localStorage
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
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
  
  // Add animation
  const modal = document.getElementById('loginRequiredModal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      modal.style.transition = 'all 0.3s ease';
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    }, 10);
  }
}

// Close login required modal
function closeLoginRequiredModal() {
  const modal = document.getElementById('loginRequiredModal');
  if (modal) {
    modal.style.transition = 'all 0.3s ease';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Go to login page
function goToLogin() {
  window.location.href = "/frontend/src/features/customer/auth/login/login.html";
}

// Make functions globally available
window.showLoginRequiredModal = showLoginRequiredModal;
window.closeLoginRequiredModal = closeLoginRequiredModal;
window.goToLogin = goToLogin;

// Add product to cart (same functionality as browse.js but with quantity support)
async function addToCart(productId, quantity = 1, redirectToCheckout = false) {
  // Check if user is logged in first
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showLoginRequiredModal();
    return;
  }
  
  const now = new Date().toISOString();
  
  // User is logged in → save to backend
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
                  body: JSON.stringify({ quantity: existingItem.quantity + quantity })
              });
          } else {
              // Not in cart → add new record
              await fetch("http://localhost:3000/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      user_id: userId,
                      product_id: productId,
                      quantity: quantity,
                      status: "active",
                      added_at: now
                  })
              });
          }

          if (redirectToCheckout) {
              window.location.href = "/checkout/checkout.html";
          } else {
              alert("Product added to cart!");
          }
      } catch (err) {
          console.error("Error adding to cart (backend):", err);
      }
  }

  // Case 2: User is NOT logged in → save in localStorage
  else {
      let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

      const existingItem = guestCart.find(item => item.product_id === productId);

      if (existingItem) {
          existingItem.quantity += quantity;
      } else {
          guestCart.push({
              product_id: productId,
              quantity: quantity,
              added_at: now
          });
      }

      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      
      if (redirectToCheckout) {
          window.location.href = "/checkout/checkout.html";
      } else {
          alert("Product added to cart (guest mode)!");
      }
      console.log(guestCart);
  }
}

document.addEventListener("DOMContentLoaded", fetchProduct);