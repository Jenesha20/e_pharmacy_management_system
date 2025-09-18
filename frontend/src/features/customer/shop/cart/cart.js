// Load header/footer
function loadComponent(id, filePath) {
  fetch(filePath)
    .then(res => res.text())
    .then(data => document.getElementById(id).innerHTML = data)
    .catch(err => console.error("Error loading component:", err));
}

loadComponent("header", "/frontend/src/core/components/navbar.html");
loadComponent("footer", "/frontend/src/core/components/footer.html");

let prescriptions = []; // {id, fileName, data}
let cartItems = []; // fetched cart items
let productsRequiringPrescription = 0;
let isLoggedIn = false;

// Function declarations (moved to the top)
function renderPrescriptionList() {
  const container = document.getElementById("prescriptionList");
  if (!container) return;
  
  container.innerHTML = "";
  prescriptions.forEach((p, i) => {
    container.innerHTML += `
      <div class="relative border border-gray-300 rounded-md p-2 flex flex-col items-center cursor-pointer">
        <img src="${p.data}" class="w-24 h-24 object-cover rounded-md" onclick="viewPrescription('${p.data}')"/>
        <button onclick="deletePrescription(${p.id})" class="absolute top-0 right-0 text-red-500 font-bold p-1 rounded-full bg-white hover:bg-red-100">×</button>
        <span class="text-sm mt-1">P${i+1}</span>
      </div>
    `;
  });
}

function viewPrescription(data) {
  const modal = document.createElement("div");
  modal.id = "prescriptionModal";
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-white p-4 rounded-lg relative max-w-lg w-full">
      <button onclick="closePrescriptionModal()" class="absolute top-2 right-2 text-gray-700 font-bold text-xl">×</button>
      <img src="${data}" class="w-full h-auto rounded-md"/>
    </div>
  `;
  document.body.appendChild(modal);
}

function closePrescriptionModal() {
  const modal = document.getElementById("prescriptionModal");
  if (modal) modal.remove();
}

function updateUploadState() {
  const browseBtn = document.getElementById("browseBtn");
  if (!browseBtn) return;
  if (prescriptions.length >= productsRequiringPrescription) {
    browseBtn.disabled = true;
    browseBtn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    browseBtn.disabled = false;
    browseBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

// Check if user is logged in
function checkLoginStatus() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  isLoggedIn = !!currentUser;
}

// Load guest data from local storage
function loadGuestData() {
  // Load prescriptions from local storage
  const storedPrescriptions = localStorage.getItem('guestPrescriptions');
  if (storedPrescriptions) {
    prescriptions = JSON.parse(storedPrescriptions);
    renderPrescriptionList();
  }
  
  // Load cart items from local storage
  const storedCart = localStorage.getItem('guestCart');
  if (storedCart) {
    const guestCart = JSON.parse(storedCart);
    
    // Fetch product details for guest cart items
    fetchProductDetailsForGuestCart(guestCart);
  }
}

// Fetch product details for guest cart items
async function fetchProductDetailsForGuestCart(guestCart) {
  try {
    const medRes = await fetch("http://localhost:3000/medicine");
    if (!medRes.ok) throw new Error("Failed to fetch medicines");
    const medicines = await medRes.json();

    // Map guest cart items to include product details
    cartItems = guestCart.map(cartItem => {
      const product = medicines.find(m => String(m.id) === String(cartItem.product_id));
      return { 
        id: cartItem.product_id, // Use product_id as id for consistency
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        ...product 
      };
    });

    productsRequiringPrescription = cartItems.filter(i => i.tag).length;
    console.log("Guest cart items:", cartItems);
    renderCart(cartItems);
    renderOrderSummary(cartItems);
    updateUploadState();
  } catch (err) {
    console.error(err);
  }
}

// Save guest data to local storage
function saveGuestData() {
  if (!isLoggedIn) {
    localStorage.setItem('guestPrescriptions', JSON.stringify(prescriptions));
    
    // Save only the essential cart data for guest users
    const guestCart = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      added_at: item.added_at || new Date().toISOString()
    }));
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
  }
}

// Fetch prescriptions
async function fetchPrescriptions() {
  if (isLoggedIn) {
    try {
      const res = await fetch("http://localhost:3000/prescriptions");
      if (!res.ok) throw new Error("Failed to fetch prescriptions");
      prescriptions = await res.json();
      renderPrescriptionList();
      updateUploadState();
    } catch (err) {
      console.error(err);
    }
  } else {
    // For guest users, data is already loaded from local storage
    renderPrescriptionList();
    updateUploadState();
  }
}

// Fetch cart
// Fetch cart
async function fetchCart() {
  if (isLoggedIn) {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userId = currentUser.id;
      
      const cartRes = await fetch(`http://localhost:3000/cart?user_id=${userId}`);
      if (!cartRes.ok) throw new Error("Failed to fetch cart");
      const cartData = await cartRes.json();

      const medRes = await fetch("http://localhost:3000/medicine");
      if (!medRes.ok) throw new Error("Failed to fetch medicines");
      const medicines = await medRes.json();

      cartItems = cartData.map(cartItem => {
        const product = medicines.find(m => String(m.id) === String(cartItem.product_id));
        return { 
          ...cartItem, 
          ...product,
          cartItemId: cartItem.id, // Preserve the cart item ID
          id: cartItem.product_id // Use product_id as id for consistency
        };
      });

      productsRequiringPrescription = cartItems.filter(i => i.tag).length;
      renderCart(cartItems);
      renderOrderSummary(cartItems);
      updateUploadState();
    } catch (err) {
      console.error(err);
    }
  } else {
    // For guest users, data is already loaded from local storage
    productsRequiringPrescription = cartItems.filter(i => i.tag).length;
    renderCart(cartItems);
    renderOrderSummary(cartItems);
    updateUploadState();
  }
}

// Render cart
function renderCart(cartItems) {
  const container = document.getElementById("cartItems");
  if (!container) return;
  
  container.innerHTML = "";

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-sm text-center">
        <p class="text-gray-500 text-lg">Your cart is empty</p>
        <a href="/frontend/src/shop/browse/browse.html" class="text-[#A1E970] hover:underline mt-4 inline-block">
          Continue Shopping
        </a>
      </div>
    `;
    return;
  }

  cartItems.forEach(item => {
    let prescriptionDropdown = "";

    if (item.tag) {
      const dropdownItems = prescriptions.map((p, i) => `
        <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer" 
             onclick="selectPrescription(${item.id}, 'P${i+1}', ${p.id})">
          P${i+1}
        </div>
      `).join("");

      const selectedLabel = item.prescriptionId ?
        'P' + (prescriptions.findIndex(p => p.id === item.prescriptionId) + 1) :
        'Select';

      prescriptionDropdown = `
        <p class="text-sm text-gray-600">Prescription required</p>
        <div class="relative">
          <button class="flex items-center justify-between w-24 px-3 py-2 text-sm text-gray-700 
                         bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  onclick="toggleDropdown(event, ${item.id})">
            <span id="selected-${item.id}">${selectedLabel}</span>
            <span class="material-icons text-sm">expand_more</span>
          </button>
          <div id="dropdown-${item.id}" class="hidden absolute mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            ${dropdownItems}
          </div>
        </div>
      `;
    } else {
      prescriptionDropdown = `<p class="text-sm text-green-600">No prescription</p>`;
    }

    container.innerHTML += `
      <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-3">
        <div class="flex items-center space-x-4">
          <img src="${item.image_url}" alt="${item.name}" class="w-16 h-16 rounded-md object-cover"/>
          <div>
            <p class="font-semibold text-gray-800">${item.name}</p>
            <p class="text-sm text-gray-500">${item.composition}</p>
            <p class="font-semibold text-gray-800 mt-1">$${item.price}</p>
          </div>
        </div>

        <div class="flex flex-col items-center">
          ${prescriptionDropdown}
        </div>

        <div class="flex items-center space-x-3">
          <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})"
            class="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
            <span class="material-icons text-lg">remove</span>
          </button>
          <span class="w-8 text-center font-medium">${item.quantity}</span>
          <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})"
            class="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
            <span class="material-icons text-lg">add</span>
          </button>
          <button onclick="removeCartItem(${item.id})" class="p-1 text-red-500 hover:text-red-700">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
    `;
  });
}

// Delete prescription
async function deletePrescription(id) {
  if (isLoggedIn) {
    try {
      await fetch(`http://localhost:3000/prescriptions/${id}`, { method: "DELETE" });
      prescriptions = prescriptions.filter(p => p.id !== id);

      // Reset prescriptionId in cart items
      cartItems.forEach(item => {
        if (item.prescriptionId === id) item.prescriptionId = null;
      });

      renderPrescriptionList();
      renderCart(cartItems);
      updateUploadState();
    } catch (err) {
      console.error(err);
    }
  } else {
    // For guest users, delete from local storage
    prescriptions = prescriptions.filter(p => p.id !== id);
    
    // Reset prescriptionId in cart items
    cartItems.forEach(item => {
      if (item.prescriptionId === id) item.prescriptionId = null;
    });
    
    renderPrescriptionList();
    renderCart(cartItems);
    updateUploadState();
    saveGuestData();
  }
}

// Handle prescription upload
function handlePrescriptionUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const validTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!validTypes.includes(file.type)) {
    alert("Only PNG, JPG, JPEG allowed");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function() {
    const base64 = reader.result;
    const prescription = { id: Date.now(), fileName: file.name, data: base64 };

    if (isLoggedIn) {
      try {
        const res = await fetch("http://localhost:3000/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prescription)
        });
        if (!res.ok) throw new Error("Failed to save prescription");

        prescriptions.push(prescription);
        renderPrescriptionList();
        updateUploadState();
        renderCart(cartItems);
        alert("Prescription uploaded!");
      } catch (err) {
        console.error(err);
      }
    } else {
      // For guest users, save to local storage
      prescriptions.push(prescription);
      renderPrescriptionList();
      updateUploadState();
      renderCart(cartItems);
      saveGuestData();
      alert("Prescription uploaded!");
    }
  };
  reader.readAsDataURL(file);
}

// Remove product from cart
async function removeCartItem(productId) {
  if (isLoggedIn) {
    try {
      // Find the cart item to get its cartItemId
      const itemToRemove = cartItems.find(item => item.id === productId);
      
      if (itemToRemove && itemToRemove.cartItemId) {
        await fetch(`http://localhost:3000/cart/${itemToRemove.cartItemId}`, { method: "DELETE" });
        
        // Update local cartItems array
        cartItems = cartItems.filter(i => i.id != productId);
        productsRequiringPrescription = cartItems.filter(i => i.tag).length;
        renderCart(cartItems);
        renderOrderSummary(cartItems);
        updateUploadState();
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    // For guest users, remove from local storage
  
    cartItems = cartItems.filter(i => i.id != productId);
    console.log(productId);
    productsRequiringPrescription = cartItems.filter(i => i.tag).length;
    console.log("Updated guest cart items:", cartItems);

    renderCart(cartItems);
    renderOrderSummary(cartItems);
    updateUploadState();
    saveGuestData();
  }
}

// Update quantity
async function updateQuantity(productId, newQuantity) {
  if (newQuantity < 1) return;
  
  if (isLoggedIn) {
    try {
      // Find the cart item to get its cartItemId
      const itemToUpdate = cartItems.find(item => item.id === productId);
      
      if (itemToUpdate && itemToUpdate.cartItemId) {
        await fetch(`http://localhost:3000/cart/${itemToUpdate.cartItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity })
        });
        
        // Update local cartItems array
        cartItems = cartItems.map(item => 
          item.id === productId ? {...item, quantity: newQuantity} : item
        );
        renderCart(cartItems);
        renderOrderSummary(cartItems);
        saveGuestData();
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    // For guest users, update in local storage
    cartItems = cartItems.map(item => 
      item.id === productId ? {...item, quantity: newQuantity} : item
    );
    renderCart(cartItems);
    renderOrderSummary(cartItems);
    saveGuestData();
  }
}

// Select prescription
function selectPrescription(productId, label, prescriptionId) {
  document.getElementById(`selected-${productId}`).innerText = label;
  document.getElementById(`dropdown-${productId}`).classList.add("hidden");

  cartItems = cartItems.map(item => item.id === productId ? {...item, prescriptionId} : item);

  if (isLoggedIn) {
    // Find the cart item to get its cartItemId
    const itemToUpdate = cartItems.find(item => item.id === productId);
    
    if (itemToUpdate && itemToUpdate.cartItemId) {
      fetch(`http://localhost:3000/cart/${itemToUpdate.cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId })
      }).catch(err => console.error(err));
    }
  } else {
    // For guest users, save to local storage
    saveGuestData();
  }
}

// Order summary
function renderOrderSummary(cartItems) {
  const container = document.getElementById("orderSummary");
  if (!container) return;
  
  let subtotal = 0;
  cartItems.forEach(item => subtotal += item.price * item.quantity);
  const shipping = 5, discount = 2, total = subtotal + shipping - discount;

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between text-gray-600"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="flex justify-between text-gray-600"><span>Shipping</span><span>$${shipping.toFixed(2)}</span></div>
      <div class="flex justify-between text-green-600"><span>Discount</span><span>-$${discount.toFixed(2)}</span></div>
      <div class="border-t border-gray-200 my-4"></div>
      <div class="flex justify-between font-bold text-gray-900 text-lg"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    </div>
  `;
}

// Toggle dropdown
function toggleDropdown(event, id) {
  event.stopPropagation();
  document.querySelectorAll("[id^='dropdown-']").forEach(d => {
    if (d.id !== `dropdown-${id}`) d.classList.add("hidden");
  });
  const dropdown = document.getElementById(`dropdown-${id}`);
  dropdown.classList.toggle("hidden");
}

// Close dropdowns when clicking outside
document.body.addEventListener("click", () => {
  document.querySelectorAll("[id^='dropdown-']").forEach(d => d.classList.add("hidden"));
});

// Function to transfer guest data to user account after login/registration
async function transferGuestDataToUser(userId) {
  // Get guest data from local storage
  const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
  const guestPrescriptions = JSON.parse(localStorage.getItem('guestPrescriptions') || '[]');
  
  if (guestCart.length > 0 || guestPrescriptions.length > 0) {
    try {
      // Transfer prescriptions first
      for (const prescription of guestPrescriptions) {
        await fetch("http://localhost:3000/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({...prescription, userId})
        });
      }
      
      // Transfer cart items
      for (const item of guestCart) {
        await fetch("http://localhost:3000/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({...item, user_id: userId})
        });
      }
      
      // Clear guest data from local storage
      localStorage.removeItem('guestCart');
      localStorage.removeItem('guestPrescriptions');
      
      console.log("Guest data successfully transferred to user account");
    } catch (err) {
      console.error("Error transferring guest data:", err);
    }
  }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  checkLoginStatus();
  
  if (isLoggedIn) {
    fetchPrescriptions();
    fetchCart();
  } else {
    loadGuestData();
  }
});
