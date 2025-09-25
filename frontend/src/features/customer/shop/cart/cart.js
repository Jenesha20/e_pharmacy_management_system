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

let prescriptions = []; // {id, image_url, status, verification_notes}
let cartItems = []; // fetched cart items
let productsRequiringPrescription = 0;
let isLoggedIn = false;
let currentUserId = null;
let quantityUpdateInProgress = new Set(); 
let selectid = null;// Track items being updated

// Attach event listeners to prevent undefined reference errors
function attachEventListeners() {
  // Close modal when clicking outside
  const modal = document.getElementById("prescriptionModal");
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target == modal) closePrescriptionModal();
    });
  }

  // Close modal with escape key
  document.addEventListener('keydown', function (e) {
    if (e.key == 'Escape') closePrescriptionModal();
  });
}

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification-banner notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// Function declarations
function renderPrescriptionList() {
  const container = document.getElementById("prescriptionList");
  const noPrescriptionsText = document.getElementById("noPrescriptionsText");

  if (!container) return;

  container.innerHTML = "";

  if (prescriptions.length == 0) {
    if (noPrescriptionsText) noPrescriptionsText.classList.remove("hidden");
    return;
  }

  if (noPrescriptionsText) noPrescriptionsText.classList.add("hidden");

  prescriptions.forEach((p, i) => {
    const statusClass = p.status == 'approved' ? 'status-approved' :
      p.status == 'rejected' ? 'status-rejected' :
        p.status == 'pending' ? 'status-pending' : '';

    const statusText = p.status == 'approved' ? 'Approved' :
      p.status == 'rejected' ? 'Rejected' :
        p.status == 'pending' ? 'Pending' : 'Not Verified';

    container.innerHTML += `
          <div class="relative border border-gray-300 rounded-md p-2 flex flex-col items-center cursor-pointer">
            <img src="${p.image_url}" class="w-24 h-24 object-cover rounded-md" onclick="viewPrescription('${p.image_url}')"/>
            <button onclick="deletePrescription('${p.id}')" class="absolute top-0 right-0 text-red-500 font-bold p-1 rounded-full bg-white hover:bg-red-100">×</button>
            <span class="text-sm mt-1">P${i + 1}</span>
            <span class="verification-status ${statusClass} mt-1">${statusText}</span>
            ${p.status == 'rejected' && p.verification_notes ? `
              <div class="text-xs text-red-600 mt-1 text-center max-w-24 break-words">
                ${p.verification_notes}
              </div>
            ` : ''}
          </div>
        `;
  });
}

function viewPrescription(image_url) {
  const modal = document.getElementById("prescriptionModal");
  const modalImage = document.getElementById("modalImage");

  if (!modal || !modalImage) return;

  modalImage.src = image_url;
  modal.classList.remove("hidden");
}

function closePrescriptionModal() {
  const modal = document.getElementById("prescriptionModal");
  if (modal) modal.classList.add("hidden");
}

function updateUploadState() {
  const browseBtn = document.getElementById("browseBtn");
  if (!browseBtn) return;
  // Allow unlimited prescription uploads for reuse
  browseBtn.disabled = false;
  browseBtn.classList.remove("opacity-50", "cursor-not-allowed");
}

function updateVerifyButton() {
  const verifyBtn = document.getElementById("verifyBtn");
  if (!verifyBtn) return;

  const hasUnverifiedPrescriptions = cartItems.some(item =>
    item.requires_prescription && item.prescriptionId &&
    !prescriptions.find(p => p.id == item.prescriptionId)?.status
  );

  verifyBtn.disabled = !hasUnverifiedPrescriptions;
  verifyBtn.classList.toggle("opacity-50", !hasUnverifiedPrescriptions);
  verifyBtn.classList.toggle("cursor-not-allowed", !hasUnverifiedPrescriptions);
}

function updateCheckoutButton() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!checkoutBtn) return;

  // Get all items that require prescriptions
  const prescriptionRequiredItems = cartItems.filter(item => item.requires_prescription);
  
  // Get items that require prescriptions but don't have one assigned
  const unassignedPrescriptionItems = prescriptionRequiredItems.filter(item => !item.prescriptionId);
  
  // Get items that have prescriptions assigned
  const prescriptionItemsNeedingVerification = prescriptionRequiredItems.filter(item => item.prescriptionId);

  // Check if all assigned prescriptions are approved
  const allPrescriptionItemsApproved = prescriptionItemsNeedingVerification.every(item => {
    const prescription = prescriptions.find(p => p.id == item.prescriptionId);
    return prescription && prescription.status == 'approved';
  });

  // Can only proceed if:
  // 1. Cart is not empty
  // 2. No prescription-required items without assigned prescriptions
  // 3. All assigned prescriptions are approved
  const canProceed = cartItems.length > 0 && 
                     unassignedPrescriptionItems.length === 0 && 
                     allPrescriptionItemsApproved;

  checkoutBtn.disabled = !canProceed;
  checkoutBtn.classList.toggle("opacity-50", !canProceed);
  checkoutBtn.classList.toggle("cursor-not-allowed", !canProceed);
  
  // Update prescription status message
  updatePrescriptionStatusMessage();
}

function updatePrescriptionStatusMessage() {
  const statusMessage = document.getElementById("prescriptionStatusMessage");
  if (!statusMessage) return;

  // Get all prescription-required items
  const prescriptionRequiredItems = cartItems.filter(item => item.requires_prescription);
  
  // Get items with assigned prescriptions
  const prescriptionItems = prescriptionRequiredItems.filter(item => item.prescriptionId);
  
  // Get items without assigned prescriptions
  const unassignedItems = prescriptionRequiredItems.filter(item => !item.prescriptionId);
  
  if (prescriptionRequiredItems.length === 0) {
    statusMessage.classList.add("hidden");
    return;
  }

  // Check if there are unassigned prescription items
  if (unassignedItems.length > 0) {
    statusMessage.classList.remove("hidden");
    statusMessage.className = "mb-4 p-3 rounded-lg status-message-warning";
    
    const icon = statusMessage.querySelector("i");
    const title = statusMessage.querySelector("p.text-sm.font-medium");
    const description = statusMessage.querySelector("p.text-xs");

    icon.className = "fas fa-exclamation-triangle mt-1 mr-2";
    title.textContent = "Prescription Required";
    description.textContent = `${unassignedItems.length} prescription medication(s) need to have prescriptions assigned before checkout.`;
    return;
  }

  const pendingItems = prescriptionItems.filter(item => {
    const prescription = prescriptions.find(p => p.id == item.prescriptionId);
    return prescription && prescription.status === 'pending';
  });

  const approvedItems = prescriptionItems.filter(item => {
    const prescription = prescriptions.find(p => p.id == item.prescriptionId);
    return prescription && prescription.status === 'approved';
  });

  const rejectedItems = prescriptionItems.filter(item => {
    const prescription = prescriptions.find(p => p.id == item.prescriptionId);
    return prescription && prescription.status === 'rejected';
  });

  const unverifiedItems = prescriptionItems.filter(item => {
    const prescription = prescriptions.find(p => p.id == item.prescriptionId);
    return prescription && !prescription.status;
  });

  // Clear previous classes
  statusMessage.className = "mb-4 p-3 rounded-lg";
  
  const icon = statusMessage.querySelector("i");
  const title = statusMessage.querySelector("p.text-sm.font-medium");
  const description = statusMessage.querySelector("p.text-xs");

  if (rejectedItems.length > 0) {
    statusMessage.classList.add("status-message-warning");
    icon.className = "fas fa-exclamation-triangle mt-1 mr-2";
    title.textContent = "Prescription Verification Required";
    description.textContent = `${rejectedItems.length} prescription(s) have been rejected. Please review and upload new prescriptions.`;
    statusMessage.classList.remove("hidden");
  } else if (pendingItems.length > 0) {
    statusMessage.classList.add("status-message-pending");
    icon.className = "fas fa-clock mt-1 mr-2";
    title.textContent = "Prescriptions Under Review";
    description.textContent = `${pendingItems.length} prescription(s) are being reviewed by our pharmacy team. You'll be notified once verification is complete.`;
    statusMessage.classList.remove("hidden");
  } else if (unverifiedItems.length > 0) {
    statusMessage.classList.add("status-message-pending");
    icon.className = "fas fa-upload mt-1 mr-2";
    title.textContent = "Prescriptions Ready for Verification";
    description.textContent = `${unverifiedItems.length} prescription(s) are ready for verification. Click "Verify Prescriptions" to submit for review.`;
    statusMessage.classList.remove("hidden");
  } else if (approvedItems.length > 0 && prescriptionItems.length === approvedItems.length) {
    statusMessage.classList.add("status-message-verified");
    icon.className = "fas fa-check-circle mt-1 mr-2";
    title.textContent = "All Prescriptions Verified";
    description.textContent = "All your prescriptions have been approved. You can proceed to checkout.";
    statusMessage.classList.remove("hidden");
  } else {
    statusMessage.classList.add("hidden");
  }
}

// Verify prescriptions function
async function verifyPrescriptions() {
  // Only verify prescriptions that are assigned to cart items
  const prescriptionItems = cartItems.filter(item => item.requires_prescription && item.prescriptionId);
  const unverifiedPrescriptions = prescriptions.filter(p => 
    !p.status && prescriptionItems.some(item => item.prescriptionId == p.id)
  );

  if (unverifiedPrescriptions.length == 0) {
    showNotification("No prescriptions need verification", "error");
    return;
  }

  try {
    // Update prescriptions on server
    for (const prescription of unverifiedPrescriptions) {
      const updatedPrescription = {
        ...prescription,
        status: "pending",
        customer_id: isLoggedIn ? currentUserId : "guest"
      };

      if (isLoggedIn) {
        // Update prescription on server for logged-in users
        await fetch(`http://localhost:3000/prescriptions/${prescription.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPrescription)
        });
      } else {
        // For guest users, just update local data
        prescription.status = "pending";
        prescription.customer_id = "guest";
      }

      // Send notification to admin
      const adminNotification = {
        title: "Prescription Verification Request",
        message: `New prescription verification request from customer ${isLoggedIn ? currentUserId : "guest"}`,
        type: "verification_request",
        related_entity_type: "prescription",
        related_entity_id: prescription.id,
        is_read: false,
        recipient_user_id: null,
        created_at: new Date().toISOString()
      };

      // Save notification to server
      await fetch("http://localhost:3000/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminNotification)
      });
    }

    // Update UI
    renderPrescriptionList();
    updateVerifyButton();
    updateCheckoutButton();
    saveGuestData();

    showNotification(`${unverifiedPrescriptions.length} prescription(s) sent for verification`);

  } catch (error) {
    console.error("Error verifying prescriptions:", error);
    showNotification("Failed to send prescriptions for verification", "error");
  }
}

// Check if user is logged in
function checkLoginStatus() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    isLoggedIn = !!currentUser;
    if (isLoggedIn) {
      currentUserId = currentUser.id;
    }
  } catch (e) {
    console.error("Error checking login status:", e);
    isLoggedIn = false;
  }
}

// Load guest data from local storage
function loadGuestData() {
  try {
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
      fetchProductDetailsForGuestCart(guestCart);
    } else {
      cartItems = [];
      renderCart(cartItems);
      renderOrderSummary(cartItems);
    }
  } catch (e) {
    console.error("Error loading guest data:", e);
    prescriptions = [];
    cartItems = [];
    renderPrescriptionList();
    renderCart(cartItems);
    renderOrderSummary(cartItems);
  }
}

// Fetch product details for guest cart items
async function fetchProductDetailsForGuestCart(guestCart) {
  try {
    const productsRes = await fetch("http://localhost:3000/products");
    if (!productsRes.ok) throw new Error("Failed to fetch products");
    const products = await productsRes.json();

    // Process guest cart items individually
    cartItems = guestCart.map(cartItem => {
      const product = products.find(p => String(p.id) == String(cartItem.product_id));
      if (product) {
        return {
          id: cartItem.product_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          prescriptionId: cartItem.prescriptionId,
          ...product
        };
      }
      return null;
    }).filter(item => item != null);

    productsRequiringPrescription = cartItems.filter(i => i.requires_prescription).length;
    renderCart(cartItems);
    renderOrderSummary(cartItems);
    updateUploadState();
    updateVerifyButton();
    updateCheckoutButton();
  } catch (err) {
    console.error("Error fetching product details:", err);
    cartItems = guestCart.map(cartItem => ({
      id: cartItem.product_id,
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
      prescriptionId: cartItem.prescriptionId,
      name: "Product " + cartItem.product_id,
      price: 0,
      composition: "",
      image_url: "",
      requires_prescription: false
    }));
    renderCart(cartItems);
    renderOrderSummary(cartItems);
  }
}

// Save guest data to local storage
function saveGuestData() {
  if (!isLoggedIn) {
    try {
      localStorage.setItem('guestPrescriptions', JSON.stringify(prescriptions));

      const guestCart = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        prescriptionId: item.prescriptionId,
        added_at: item.added_at || new Date().toISOString()
      }));
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
    } catch (e) {
      console.error("Error saving guest data:", e);
    }
  }
}

// Fetch prescriptions
async function fetchPrescriptions() {
  if (isLoggedIn) {
    try {
      const res = await fetch(`http://localhost:3000/prescriptions?customer_id=${currentUserId}`);
      if (!res.ok) throw new Error("Failed to fetch prescriptions");
      prescriptions = await res.json();
      renderPrescriptionList();
      updateUploadState();
      updateVerifyButton();
    } catch (err) {
      console.error(err);
    }
  } else {
    renderPrescriptionList();
    updateUploadState();
    updateVerifyButton();
  }
}

// Fetch cart
async function fetchCart() {
  if (isLoggedIn) {
    try {
      const cartRes = await fetch(`http://localhost:3000/cart?user_id=${currentUserId}`);
      if (!cartRes.ok) throw new Error("Failed to fetch cart");
      const cartData = await cartRes.json();

      const productsRes = await fetch("http://localhost:3000/products");
      if (!productsRes.ok) throw new Error("Failed to fetch products");
      const products = await productsRes.json();

      // Process cart items individually (no grouping to avoid complexity)
      cartItems = cartData.map(cartItem => {
        const product = products.find(p => String(p.id) == String(cartItem.product_id));
        if (product) {
          return {
            ...cartItem,
            ...product,
            cartItemId: cartItem.id,
            id: cartItem.product_id
          };
        }
        return null;
      }).filter(item => item !== null);

      productsRequiringPrescription = cartItems.filter(i => i.requires_prescription).length;
      renderCart(cartItems);
      renderOrderSummary(cartItems);
      updateUploadState();
      updateVerifyButton();
      updateCheckoutButton();
    } catch (err) {
      console.error("Error fetching cart:", err);
      renderCart([]);
      renderOrderSummary([]);
    }
  } else {
    productsRequiringPrescription = cartItems.filter(i => i.requires_prescription).length;
    renderCart(cartItems);
    renderOrderSummary(cartItems);
    updateUploadState();
    updateVerifyButton();
    updateCheckoutButton();
  }
}

// Render cart
function renderCart(cartItems) {
  const container = document.getElementById("cartItems");
  const itemCount = document.getElementById("itemCount");
  if (!container) return;

  container.innerHTML = "";
  if (itemCount) itemCount.textContent = `${cartItems.length} items`;

  if (cartItems.length == 0) {
    container.innerHTML = `
          <div class="bg-white p-8 rounded-lg shadow-sm text-center">
            <p class="text-gray-500 text-lg">Your cart is empty</p>
            <a href="../browse/browse.html" class="text-[#A1E970] hover:underline mt-4 inline-block">
              Continue Shopping
            </a>
          </div>
        `;
    // Clear prescription selection panel
    renderPrescriptionSelectionPanel([]);
    return;
  }

  cartItems.forEach(item => {
    // Validate item has required properties
    if (!item.id || !item.name || !item.price) {
      console.error('Invalid cart item:', item);
      return; // Skip rendering invalid items
    }
    
    container.innerHTML += `
          <div class="cart-item p-4 border-b border-gray-100 flex items-center">
            <div class="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md overflow-hidden mr-4 flex items-center justify-center">
              ${item.image_url ? 
                `<img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <div class="placeholder-icon" style="display: none;"><i class="fas fa-pills text-gray-400 text-2xl"></i></div>` :
                `<div class="placeholder-icon"><i class="fas fa-pills text-gray-400 text-2xl"></i></div>`
              }
            </div>
            
            <div class="flex-grow item-details">
              <h3 class="font-medium text-gray-900">${item.name}</h3>
              <p class="text-sm text-gray-500">${item.composition || 'Medicine'}</p>
              <p class="text-lg font-semibold text-green-600 mt-1">Rs ${item.price.toFixed(2)}</p>
              ${item.requires_prescription ? '<p class="text-xs text-orange-600 mt-1"><i class="fas fa-exclamation-triangle mr-1"></i>Prescription Required</p>' : ''}
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <button class="quantity-btn w-6 h-6 rounded-full flex items-center justify-center border border-gray-300" 
                        onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span class="mx-2 text-gray-700">${item.quantity}</span>
                <button class="quantity-btn w-6 h-6 rounded-full flex items-center justify-center border border-gray-300" 
                        onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
              </div>
              
              <button onclick="removeItem('${item.id}')" class="text-red-500 hover:text-red-700 text-sm flex items-center">
                <i class="fas fa-trash-alt mr-1"></i> Remove
              </button>
            </div>
          </div>
        `;
  });

  // Render prescription selection panel
  renderPrescriptionSelectionPanel(cartItems);
}

// Render prescription selection panel
function renderPrescriptionSelectionPanel(cartItems) {
  const panel = document.getElementById("prescriptionSelectionPanel");
  if (!panel) return;

  const prescriptionItems = cartItems.filter(item => item.requires_prescription);
  
  if (prescriptionItems.length === 0) {
    panel.innerHTML = '<p class="text-gray-500 text-sm">No prescription medications in your cart</p>';
    return;
  }

  if (prescriptions.length === 0) {
    panel.innerHTML = '<p class="text-gray-500 text-sm">Please upload prescriptions first to select them for your medications</p>';
    return;
  }

  panel.innerHTML = prescriptionItems.map(item => {
    const selectedPrescription = prescriptions.find(p => p.id == item.prescriptionId);
    const selectedLabel = selectedPrescription ?
      'P' + (prescriptions.findIndex(p => p.id == item.prescriptionId) + 1) :
      'Select Prescription';
//       const buttonHTML = `
//   <button class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 
//                  bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 min-w-40
//                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//           onclick="selectPrescriptionItem(${item.id}, event)">
//     <span id="selected-${item.id}">${selectedLabel}</span>
//     <span class="material-icons text-sm ml-2">expand_more</span>
//   </button>
// `;

 
    const verificationStatus = selectedPrescription?.status;
    const statusDisplay = verificationStatus ?
      `<span class="prescription-status-above verification-status status-${verificationStatus}">${verificationStatus}</span>` : '';
    selectid=item.id;
    const dropdownItems = prescriptions.map((p, i) => `
      <div class="prescription-dropdown-item" 
           data-item-id="${item.id}" 
           data-prescription-id="${p.id}" 
           data-prescription-label="P${i + 1}">
        <div class="flex items-center justify-between">
          <span class="font-medium text-sm">P${i + 1}</span>
          <span class="text-xs ${p.status === 'approved' ? 'text-green-600' : p.status === 'rejected' ? 'text-red-600' : 'text-orange-600'}">${p.status ? p.status : 'Pending'}</span>
        </div>
      </div>
    `).join("");
  
    return `
      <div class="prescription-selection-item">

        <h4>${item.name}</h4>
        <p>Quantity: ${item.quantity} × Rs ${item.price.toFixed(2)}</p>
        <div class="prescription-dropdown-container">
          ${statusDisplay ? `
            <div class="mb-2 text-center">
              ${statusDisplay}
            </div>
          ` : ''}
          <div class="flex items-center justify-center">
            <button class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 
                           bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 min-w-40
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onclick="toggleDropdown(event, ${item.id})">
              <span id="selected-${item.id}">${selectedLabel}</span>
              <span class="material-icons text-sm ml-2">expand_more</span>
            </button>
          </div>
          <div id="dropdown-${item.id}" class="prescription-dropdown external hidden">
            ${dropdownItems}
          </div>
          ${selectedPrescription?.status == 'rejected' && selectedPrescription?.verification_notes ? `
            <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p class="text-xs text-red-600 font-semibold">Admin Comments:</p>
              <p class="text-xs text-red-600">${selectedPrescription.verification_notes}</p>
              <button onclick="removeRejectedItem(${item.id})" class="mt-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                Remove Item
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// function selectPrescriptionItem(itemId, event) {
//   selectedItemId = itemId; // Save the ID globally
//   toggleDropdown(event, itemId); // existing function to open/close dropdown

//   console.log("Selected Item ID:", selectedItemId);
// }

// Render order summary
function renderOrderSummary(cartItems) {
  const container = document.getElementById("orderSummary");
  if (!container) return;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 30 || subtotal == 0 ? 0 : 5;
  const total = subtotal + shipping;

  container.innerHTML = `
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Subtotal</span>
          <span class="font-medium">Rs ${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Shipping</span>
          <span class="font-medium">${shipping == 0 ? 'Free' : 'Rs ' + shipping.toFixed(2)}</span>
        </div>
        <div class="flex justify-between mt-4 pt-2 border-t border-gray-100">
          <span class="text-lg font-bold">Total</span>
          <span class="text-lg font-bold">Rs ${total.toFixed(2)}</span>
        </div>
      `;
}

// Handle prescription upload
// Handle prescription upload
async function handlePrescriptionUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const medicineId = 1; // use the ID selected from the panel
  //console.log('Uploading prescription for medicineId:', medicineI);
  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      // Create the prescription in the desired format
      const newPrescription = {
        prescription_id: Date.now(), // Use timestamp as prescription_id
        customer_id: isLoggedIn ? currentUserId : "guest",
        image_url: e.target.result,
        status: null, // Set to null initially - will be pending only after verification request
        verified_by: null,
        medicine_id:1,
        verification_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isLoggedIn) {
        // Save to server for logged-in users
        const response = await fetch("http://localhost:3000/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPrescription)
        });

        if (!response.ok) throw new Error("Failed to save prescription");

        const savedPrescription = await response.json();
        prescriptions.push(savedPrescription);
      } else {
        // For guest users, just add to local array
        newPrescription.id = Date.now().toString(); // Add id field for guest
        prescriptions.push(newPrescription);
      }

      renderPrescriptionList();
      updateUploadState();
      updateVerifyButton();
      saveGuestData();

      showNotification("Prescription uploaded successfully");
    } catch (error) {
      console.error("Error uploading prescription:", error);
      showNotification("Failed to upload prescription", "error");
    }
  };
  reader.readAsDataURL(file);

  // Reset the input
  event.target.value = '';
}

// Delete prescription
async function deletePrescription(prescriptionId) {
  try {
    if (isLoggedIn) {
      // Delete from server for logged-in users
      const response = await fetch(`http://localhost:3000/prescriptions/${prescriptionId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete prescription");
    }

    // Remove from local array
    prescriptions = prescriptions.filter(p => p.id != prescriptionId);

    // Remove prescription from cart items
    cartItems.forEach(item => {
      if (item.prescriptionId == prescriptionId) {
        item.prescriptionId = null;
      }
    });

    renderPrescriptionList();
    renderCart(cartItems);
    updateVerifyButton();
    updateCheckoutButton();
    saveGuestData();

    showNotification("Prescription removed");
  } catch (error) {
    console.error("Error deleting prescription:", error);
    showNotification("Failed to delete prescription", "error");
  }
}

// Toggle dropdown
function toggleDropdown(event, itemId) {
  // selectid=itemId;
  console.log('toggleDropdown called for itemId:', itemId);
  event.preventDefault();
  event.stopPropagation();
  
  const dropdown = document.getElementById(`dropdown-${itemId}`);
  console.log('dropdown element:', dropdown);
  
  if (!dropdown) {
    console.error('Dropdown not found for itemId:', itemId);
    return;
  }
  
  // Close other dropdowns first
  document.querySelectorAll('.prescription-dropdown').forEach(drop => {
    if (drop.id != `dropdown-${itemId}`) {
      drop.classList.add('hidden');
    }
  });
  
  // Toggle current dropdown
  if (dropdown.classList.contains('hidden')) {
    console.log('Showing dropdown');
    dropdown.classList.remove('hidden');
    
    // Position external dropdowns
    if (dropdown.classList.contains('external')) {
      const button = event.target.closest('button');
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
          // Center dropdown on mobile
          dropdown.style.position = 'fixed';
          dropdown.style.top = '50%';
          dropdown.style.left = '50%';
          dropdown.style.transform = 'translate(-50%, -50%)';
          dropdown.style.width = '60%';
          dropdown.style.maxWidth = '150px';
          dropdown.style.minWidth = '100px';
        } else {
          // Position dropdown below the button on desktop
          dropdown.style.position = 'fixed';
          dropdown.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
          dropdown.style.left = `${buttonRect.left + window.scrollX}px`;
          dropdown.style.transform = 'none';
          dropdown.style.width = 'auto';
          dropdown.style.minWidth = '80px';
          dropdown.style.maxWidth = '120px';
          
          // Adjust if dropdown goes off screen
          const viewportWidth = window.innerWidth;
          const dropdownRight = buttonRect.left + 120; // Use max-width for calculation
          if (dropdownRight > viewportWidth) {
            dropdown.style.left = `${viewportWidth - 130}px`;
          }
        }
      }
    } else {
      // For non-external dropdowns, ensure they use absolute positioning
      dropdown.style.position = 'absolute';
      dropdown.style.top = '100%';
      dropdown.style.left = '0';
      dropdown.style.right = '0';
      dropdown.style.transform = 'none';
      dropdown.style.zIndex = '999999';
    }
  } else {
    console.log('Hiding dropdown');
    dropdown.classList.add('hidden');
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function (event) {
  // Handle dropdown item clicks
  if (event.target.closest('.prescription-dropdown-item')) {
    const item = event.target.closest('.prescription-dropdown-item');
    const itemId = item.dataset.itemId;
    const prescriptionId = item.dataset.prescriptionId;
    const prescriptionLabel = item.dataset.prescriptionLabel;
    
    selectPrescription(itemId, prescriptionLabel, prescriptionId);
    return;
  }
  
  // Check if click is outside dropdown containers
  const isClickInsideDropdown = event.target.closest('.prescription-dropdown-container');
  if (!isClickInsideDropdown) {
    document.querySelectorAll('.prescription-dropdown').forEach(drop => {
      drop.classList.add('hidden');
    });
  }
});

// Handle window resize to close dropdowns
window.addEventListener('resize', function() {
  document.querySelectorAll('.prescription-dropdown').forEach(dropdown => {
    dropdown.classList.add('hidden');
  });
});

// Select prescription for an item
async function selectPrescription(itemId, label, prescriptionId) {
  console.log('selectPrescription called:', { itemId, label, prescriptionId });
  
  const item = cartItems.find(i => i.id == itemId);
  if (!item) {
    console.error('Item not found:', itemId);
    return;
  }
  
  item.prescriptionId = prescriptionId;

  if (isLoggedIn) {
    try {
      // Update the specific cart item using its cartItemId
      if (item.cartItemId) {
        const response = await fetch(`http://localhost:3000/cart/${item.cartItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prescriptionId: prescriptionId })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update cart item: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      showNotification("Failed to update prescription assignment", "error");
      return;
    }
  }

  // Close all dropdowns
  document.querySelectorAll('.prescription-dropdown').forEach(dropdown => {
    dropdown.classList.add('hidden');
  });

  // Update UI
  renderCart(cartItems);
  updateVerifyButton();
  updateCheckoutButton();
  saveGuestData();

  showNotification("Prescription assigned to product");
}

// Update quantity
async function updateQuantity(itemId, newQuantity) {
  console.log(`updateQuantity called with itemId: ${itemId}, newQuantity: ${newQuantity}`);
  
  // Validate itemId
  if (!itemId || itemId === 'undefined' || itemId === 'null') {
    console.error('Invalid itemId in updateQuantity:', itemId);
    showNotification("Error: Invalid item ID", "error");
    return;
  }
  
  // Prevent multiple simultaneous updates for the same item
  if (quantityUpdateInProgress.has(itemId)) {
    console.log(`Update already in progress for item ${itemId}`);
    return;
  }

  console.log(`Updating quantity for item ${itemId} to ${newQuantity}`);
  
  if (newQuantity < 1) {
    // If quantity is 0 or negative, remove the item
    removeItem(itemId);
    return;
  }

  const item = cartItems.find(i => i.id == itemId);
  if (!item) {
    console.error(`Item with id ${itemId} not found in cart`);
    showNotification("Error: Item not found", "error");
    return;
  }

  // Mark this item as being updated
  quantityUpdateInProgress.add(itemId);

  try {
    // Update local quantity first for immediate UI feedback
    const oldQuantity = item.quantity;
    item.quantity = newQuantity;

    if (isLoggedIn) {
      try {
        // Update the specific cart item using its cartItemId
        if (item.cartItemId) {
          const response = await fetch(`http://localhost:3000/cart/${item.cartItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              quantity: newQuantity,
              prescriptionId: item.prescriptionId || null
            })
          });
          
          if (!response.ok) {
            throw new Error(`Failed to update cart item: ${response.status}`);
          }
          
          console.log(`Successfully updated cart item ${item.cartItemId}`);
        } else {
          console.warn(`No cartItemId found for item ${itemId}`);
        }
      } catch (error) {
        console.error("Error updating cart quantity:", error);
        // Revert local change on error
        item.quantity = oldQuantity;
        showNotification("Failed to update quantity. Please try again.", "error");
        return;
      }
    }

    // Update UI
    renderCart(cartItems);
    renderOrderSummary(cartItems);
    saveGuestData();
    
    console.log(`Quantity updated successfully for item ${itemId}`);
  } finally {
    // Remove from update tracking
    quantityUpdateInProgress.delete(itemId);
  }
}

// Remove item from cart
async function removeItem(itemId) {
  console.log('removeItem called with itemId:', itemId, 'type:', typeof itemId);
  
  // Validate itemId
  if (!itemId || itemId === 'undefined' || itemId === 'null') {
    console.error('Invalid itemId:', itemId);
    showNotification("Error: Invalid item ID", "error");
    return;
  }
  
  const item = cartItems.find(i => i.id == itemId);
  console.log('Found item:', item);
  
  if (!item) {
    console.error('Item not found with id:', itemId);
    showNotification("Error: Item not found", "error");
    return;
  }
  
  if (isLoggedIn && item && item.cartItemId) {
    try {
      // Remove the specific cart item from server
      await fetch(`http://localhost:3000/cart/${item.cartItemId}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  }

  // Remove from local array
  cartItems = cartItems.filter(i => i.id != itemId);
  renderCart(cartItems);
  renderOrderSummary(cartItems);
  updateCheckoutButton();
  saveGuestData();

  showNotification("Item removed from cart");
}

// Remove rejected item
function removeRejectedItem(itemId) {
  removeItem(itemId);
}

// Proceed to checkout
function proceedToCheckout() {
  // Check if all prescription items are approved
  const prescriptionItems = cartItems.filter(item => item.requires_prescription && item.prescriptionId);
  const allApproved = prescriptionItems.every(item => {
    const prescription = prescriptions.find(p => p.id == item.prescriptionId);
    return prescription && prescription.status == 'approved';
  });

  if (prescriptionItems.length > 0 && !allApproved) {
    showNotification("Please ensure all prescriptions are approved before checkout", "error");
    return;
  }

  if (cartItems.length == 0) {
    showNotification("Your cart is empty", "error");
    return;
  }

  // Save cart for checkout
  localStorage.setItem('checkoutCart', JSON.stringify(cartItems));

  // Redirect to checkout page
  window.location.href = "../../shop/checkout/checkout.html";
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
window.toggleDropdown = toggleDropdown;
window.selectPrescription = selectPrescription;

// Manual refresh function for debugging
window.refreshCartAuth = function() {
  console.log("Manual auth refresh called");
  if (window.initAuth) {
    console.log("Calling initAuth from manual refresh");
    window.initAuth();
  } else if (window.refreshAuth) {
    console.log("Calling refreshAuth from manual refresh");
    window.refreshAuth();
  } else {
    console.log("No auth functions available");
  }
};

// Initialize the page
function initPage() {
  checkLoginStatus();
  if (isLoggedIn) {
    fetchCart();
    fetchPrescriptions();
  } else {
    loadGuestData();
  }
  attachEventListeners();
  
  // Additional fallback to ensure auth is initialized
  setTimeout(() => {
    if (window.initAuth) {
      window.initAuth();
    } else if (window.refreshAuth) {
      window.refreshAuth();
    }
  }, 500);
}


