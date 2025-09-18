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
const itemsPerPage = 10;
let currentPage = 1;
// localStorage.removeItem("guestCart");

// Simulate login (replace with real auth)
// let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
// Example: localStorage.setItem("user", JSON.stringify({ id: 1, name: "Jen" }))

// Fetch products from backend
async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:3000/medicine");
    if (!response.ok) throw new Error("Failed to fetch products");

    products = await response.json();
    renderProducts(currentPage);
  } catch (err) {
    console.error("Error fetching products:", err);
    document.getElementById("product-list").innerHTML =
      "<p class='text-red-500'>Failed to load products.</p>";
  }
}
function getCurrentUser()
  {
      return JSON.parse(localStorage.getItem("currentUser"));
  }
// Add product to cart
async function addToCart(productId) {
  const now = new Date().toISOString();
  
  // Case 1: User is logged in → save to backend
  const currentUser=getCurrentUser();
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
    console.log(guestCart);
  }
}

// Render products for current page
function renderProducts(page = 1) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = products.slice(start, end);

  pageProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg overflow-hidden shadow-sm p-4 relative";

    card.innerHTML = `
      <!-- Prescription Badge -->
      ${
        product.tag
          ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Prescription Required
            </span>`
          : ""
      }

      <a href="../../shop/product/product.html?id=${product.id}">
        <div class="bg-[#A1E970] bg-opacity-50 p-4 flex justify-center items-center">
          <img src="${product.image_url}" alt="${product.name}" class="h-32 object-contain"/>
        </div>
      </a>
      <h3 class="font-semibold mt-2">
        <a href="product.html?id=${product.id}">${product.name}</a>
      </h3>
      <p class="text-sm text-gray-500">${product.composition}</p>
      <p class="font-semibold mt-2">$${product.price}</p>
      <button class="w-full bg-[#A1E970] bg-opacity-90 text-black font-semibold py-2 rounded-lg mt-4 hover:bg-[#A1E970] add-to-cart-btn">
        Add to cart
      </button>
    `;

    container.appendChild(card);

    // Attach event
    card.querySelector(".add-to-cart-btn").addEventListener("click", () => {
      addToCart(product.id);
    });
  });

  renderPagination(page);
}


// Pagination UI
function renderPagination(activePage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(products.length / itemsPerPage);

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

// Init
document.addEventListener("DOMContentLoaded", fetchProducts);
