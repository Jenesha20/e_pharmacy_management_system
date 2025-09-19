// function loadComponent(id, filePath) {
//   fetch(filePath)
//     .then(response => response.text())
//     .then(data => {
//       document.getElementById(id).innerHTML = data;
//     })
//     .catch(err => console.error("Error loading component:", err));
// }
// loadComponent("header", "/frontend/src/core/components/navbar.html");
// loadComponent("footer", "/frontend/src/core/components/footer.html");

// let products = [];
// const itemsPerPage = 10;
// let currentPage = 1;
// // localStorage.removeItem("guestCart");

// // Simulate login (replace with real auth)
// // let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
// // Example: localStorage.setItem("user", JSON.stringify({ id: 1, name: "Jen" }))

// // Fetch products from backend
// async function fetchProducts() {
//   try {
//     const response = await fetch("http://localhost:3000/medicine");
//     if (!response.ok) throw new Error("Failed to fetch products");

//     products = await response.json();
//     renderProducts(currentPage);
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     document.getElementById("product-list").innerHTML =
//       "<p class='text-red-500'>Failed to load products.</p>";
//   }
// }
// function getCurrentUser()
//   {
//       return JSON.parse(localStorage.getItem("currentUser"));
//   }
// // Add product to cart
// async function addToCart(productId) {
//   const now = new Date().toISOString();
  
//   // Case 1: User is logged in → save to backend
//   const currentUser=getCurrentUser();
//   if (currentUser) {
//     const userId = currentUser.id;

//     try {
//       // Check if product already in backend cart
//       const res = await fetch(`http://localhost:3000/cart?user_id=${userId}&product_id=${productId}`);
//       const data = await res.json();

//       if (data.length > 0) {
//         // Already in cart → increment quantity
//         const existingItem = data[0];
//         await fetch(`http://localhost:3000/cart/${existingItem.id}`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ quantity: existingItem.quantity + 1 })
//         });
//       } else {
//         // Not in cart → add new record
//         await fetch("http://localhost:3000/cart", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             user_id: userId,
//             product_id: productId,
//             quantity: 1,
//             status: "active",
//             added_at: now
//           })
//         });
//       }

//       alert("Product added to cart!");
//     } catch (err) {
//       console.error("Error adding to cart (backend):", err);
//     }
//   }

//   // Case 2: User is NOT logged in → save in localStorage
//   else {
    
//     let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

//     const existingItem = guestCart.find(item => item.product_id === productId);

//     if (existingItem) {
//       existingItem.quantity += 1;
//     } else {
//       guestCart.push({
//         product_id: productId,
//         quantity: 1,
//         added_at: now
//       });
//     }

//     localStorage.setItem("guestCart", JSON.stringify(guestCart));
//     alert("Product added to cart (guest mode)!");
//     console.log(guestCart);
//   }
// }

// // Render products for current page
// function renderProducts(page = 1) {
//   const container = document.getElementById("product-list");
//   container.innerHTML = "";

//   const start = (page - 1) * itemsPerPage;
//   const end = start + itemsPerPage;
//   const pageProducts = products.slice(start, end);

//   pageProducts.forEach(product => {
//     const card = document.createElement("div");
//     card.className = "bg-white rounded-lg overflow-hidden shadow-sm p-4 relative";
    

//     card.innerHTML = `
//       <!-- Prescription Badge -->
//       ${
//         product.prescription_required
//           ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
//               Prescription Required
//             </span>`
//           : ""
//       }

//       <a href="../../shop/product/product.html?id=${product.id}">
//         <div class="bg-[#A1E970] bg-opacity-50 p-4 flex justify-center items-center">
//           <img src="${product.image_url}" alt="${product.name}" class="h-32 object-contain"/>
//         </div>
//       </a>
//       <h3 class="font-semibold mt-2">
//         <a href="product.html?id=${product.id}">${product.name}</a>
//       </h3>
//       <p class="text-sm text-gray-500">${product.composition}</p>
//       <p class="font-semibold mt-2">$${product.price}</p>
//       <button class="w-full bg-[#A1E970] bg-opacity-90 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-[#A1E970] add-to-cart-btn">
//         Add to cart
//       </button>
//     `;

//     container.appendChild(card);

//     // Attach event
//     card.querySelector(".add-to-cart-btn").addEventListener("click", () => {
//       addToCart(product.id);
//     });
//   });

//   renderPagination(page);
// }


// // Pagination UI
// function renderPagination(activePage) {
//   const pagination = document.getElementById("pagination");
//   pagination.innerHTML = "";
//   const totalPages = Math.ceil(products.length / itemsPerPage);

//   // Prev
//   pagination.insertAdjacentHTML("beforeend", `
//     <button 
//       class="px-3 py-1 border rounded ${activePage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}"
//       ${activePage === 1 ? "disabled" : `onclick="changePage(${activePage - 1})"`}
//     >Prev</button>
//   `);

//   // Page numbers
//   for (let i = 1; i <= totalPages; i++) {
//     pagination.insertAdjacentHTML("beforeend", `
//       <button 
//         class="px-3 py-1 border rounded ${i === activePage ? "bg-[#A1E970] font-bold" : "hover:bg-gray-200"}"
//         onclick="changePage(${i})"
//       >${i}</button>
//     `);
//   }

//   // Next
//   pagination.insertAdjacentHTML("beforeend", `
//     <button 
//       class="px-3 py-1 border rounded ${activePage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}"
//       ${activePage === totalPages ? "disabled" : `onclick="changePage(${activePage + 1})"`}
//     >Next</button>
//   `);
// }

// function changePage(page) {
//   currentPage = page;
//   renderProducts(page);
// }

// // Init
// document.addEventListener("DOMContentLoaded", fetchProducts);


function loadComponent(id, filePath) {
  fetch(filePath)
      .then(response => response.text())
      .then(data => {
          document.getElementById(id).innerHTML = data;
      })
      .catch(err => console.error("Error loading component:", err));
}
loadComponent("header", "/frontend/src/core/components/navbar.html");
loadComponent("footer", "/frontend/src/core/components/footer.html");

let products = [];
let featuredProducts = [];
const itemsPerPage = 10;
let currentPage = 1;

// Fetch products from backend
async function fetchProducts() {
  try {
      const response = await fetch("http://localhost:3000/medicine");
      if (!response.ok) throw new Error("Failed to fetch products");

      products = await response.json();
      
      // Filter featured products (only 5)
      featuredProducts = products.filter(product => product.featured_product === true).slice(0, 5);
      
      // Render featured products
      renderFeaturedProducts();
      
      // Render all products with pagination
      renderProducts(currentPage);
  } catch (err) {
      console.error("Error fetching products:", err);
      document.getElementById("product-list").innerHTML =
          "<p class='text-red-500 col-span-full'>Failed to load products.</p>";
  }
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Render featured products
function renderFeaturedProducts() {
  const container = document.getElementById("featured-products");
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
          ${
              product.prescription_required
              ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Prescription Required
              </span>`
              : ""
          }

          <a href="../../shop/product/product.html?id=${product.id}">
              <div class="bg-[#A1E970] bg-opacity-50 p-4 flex justify-center items-center">
                  <img src="${product.image_url || 'https://via.placeholder.com/150'}" alt="${product.name}" class="h-32 object-contain"/>
              </div>
          </a>
          <div class="p-4">
              <h3 class="font-semibold">
                  <a href="../../shop/product/product.html?id=${product.id}">${product.name}</a>
              </h3>
              <p class="text-sm text-gray-500">${product.composition || 'No description available'}</p>
              <p class="font-semibold mt-2">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
              <button class="w-full bg-[#A1E970] bg-opacity-90 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-[#A1E970] add-to-cart-btn" data-id="${product.id}">
                  Add to cart
              </button>
          </div>
      `;

      container.appendChild(card);

      // Attach event
      card.querySelector(".add-to-cart-btn").addEventListener("click", function() {
          addToCart(this.getAttribute("data-id"));
      });
  });
}

// Add product to cart
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

// Render products for current page
function renderProducts(page = 1) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = products.slice(start, end);

  if (pageProducts.length === 0) {
      container.innerHTML = "<p class='text-gray-500 col-span-full'>No products found.</p>";
      return;
  }

  pageProducts.forEach(product => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg overflow-hidden shadow-sm p-4 relative";
      

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
              <div class="bg-[#A1E970] bg-opacity-50 p-4 flex justify-center items-center">
                  <img src="${product.image_url || 'https://via.placeholder.com/150'}" alt="${product.name}" class="h-32 object-contain"/>
              </div>
          </a>
          <h3 class="font-semibold mt-2">
              <a href="../../shop/product/product.html?id=${product.id}">${product.name}</a>
          </h3>
          <p class="text-sm text-gray-500">${product.composition || 'No description available'}</p>
          <p class="font-semibold mt-2">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
          <button class="w-full bg-[#A1E970] bg-opacity-90 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-[#A1E970] add-to-cart-btn" data-id="${product.id}">
              Add to cart
          </button>
      `;

      container.appendChild(card);

      // Attach event
      card.querySelector(".add-to-cart-btn").addEventListener("click", function() {
          addToCart(this.getAttribute("data-id"));
      });
  });

  renderPagination(page);
}

// Pagination UI
function renderPagination(activePage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(products.length / itemsPerPage);

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

function changePage(page) {
  currentPage = page;
  renderProducts(page);
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      if (searchTerm === '') {
          // If search is empty, show all products
          renderProducts(currentPage);
          renderPagination(currentPage);
      } else {
          // Filter products based on search term
          const filtered = products.filter(product => 
              product.name.toLowerCase().includes(searchTerm) || 
              (product.composition && product.composition.toLowerCase().includes(searchTerm)) ||
              (product.category && product.category.toLowerCase().includes(searchTerm))
          );
          
          // Display filtered products
          const container = document.getElementById("product-list");
          container.innerHTML = "";
          
          if (filtered.length > 0) {
              filtered.forEach(product => {
                  const card = document.createElement("div");
                  card.className = "bg-white rounded-lg overflow-hidden shadow-sm p-4 relative";
                  
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
                          <div class="bg-[#A1E970] bg-opacity-50 p-4 flex justify-center items-center">
                              <img src="${product.image_url || 'https://via.placeholder.com/150'}" alt="${product.name}" class="h-32 object-contain"/>
                          </div>
                      </a>
                      <h3 class="font-semibold mt-2">
                          <a href="../../shop/product/product.html?id=${product.id}">${product.name}</a>
                      </h3>
                      <p class="text-sm text-gray-500">${product.composition || 'No description available'}</p>
                      <p class="font-semibold mt-2">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
                      <button class="w-full bg-[#A1E970] bg-opacity-90 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-[#A1E970] add-to-cart-btn" data-id="${product.id}">
                          Add to cart
                      </button>
                  `;

                  container.appendChild(card);

                  // Attach event
                  card.querySelector(".add-to-cart-btn").addEventListener("click", function() {
                      addToCart(this.getAttribute("data-id"));
                  });
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
document.addEventListener("DOMContentLoaded", function() {
  fetchProducts();
  setupSearch();
});