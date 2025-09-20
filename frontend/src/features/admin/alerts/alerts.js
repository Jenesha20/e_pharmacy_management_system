// function loadComponent(id, filePath) {
//   fetch(filePath)
//     .then(response => response.text())
//     .then(data => {
//       document.getElementById(id).innerHTML = data;
//       highlightActiveLink();
//     })
//     .catch(err => console.error("Error loading component:", err));
// }

// function highlightActiveLink() {
//   const currentPath = window.location.pathname;
//   const links = document.querySelectorAll("#sidebar a");

//   links.forEach(link => {
//     const href = link.getAttribute("href");
//     if (currentPath.endsWith(href.replace("../", ""))) {
//       link.classList.add("bg-blue-600", "text-white");
//     } else {
//       link.classList.remove("bg-blue-600", "text-white");
//     }
//   });
// }

// loadComponent("sidebar", "../../../core/components/sidebar.html");

// // ---- Customer Data ----
// const alertData = [
//   { 
//       type:"Expiry",
//       notification:"med101 is about to expire in 10 days"
//     },
//     { 
//       type:"Out of Stock",
//       notification:"med101 is about to expire in 10 days"
//     },
//     { 
//       type:"Pending prescription",
//       notification:"med101 is about to expire in 10 days"
//     },
    
// ];

// // ---- Pagination ----
// let currentPage = 1;
// const rowsPerPage = 10;
// let filteredData = [...alertData];

// // ---- Table Rendering ----
// function renderTable(data) {
//   const table = document.getElementById("alertTable");
//   table.innerHTML = "";

//   const start = (currentPage - 1) * rowsPerPage;
//   const paginatedData = data.slice(start, start + rowsPerPage);

//   if (paginatedData.length === 0) {
//     table.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No records found</td></tr>`;
//     return;
//   }

//   // <a href="customer_detail.html?
//   // &custId=${item.id}
//   // &custName=${encodeURIComponent(item.name)}
//   // &custMail=${encodeURIComponent(item.mail)}
//   // &custAge=${item.age}
//   // &custDob=${item.dob}
//   // &custAddress=${encodeURIComponent(item.address)}
//   // &city=${encodeURIComponent(item.city)}"> </a>
//   paginatedData.forEach(item => {
//     let targetPage = "../inventory/inventory.html"; // default page
//     let queryParam = "";
  
//     if (item.type === "Expiry") {
//       queryParam = "?type=expiry";
//       targetPage = "../inventory/inventory.html";
//     } else if (item.type === "Out of Stock") {
//       queryParam = "?type=outofstock";
//       targetPage = "../inventory/inventory.html";
//     } else if (item.type === "Pending prescription") {
//       queryParam = "?type=pending";
//       targetPage = "../verification/verification.html";
//     }
  
//     const row = `
//       <tr class="border-b hover:bg-gray-50">
//         <td class="p-3">${item.type}</td>
//         <td class="p-3">${item.notification}</td>
//         <td class="p-3">
//           <a href="${targetPage}${queryParam}" 
//              class="text-blue-600 hover:underline">
//             View Full Detail »
//           </a>
//         </td>
//       </tr>
//     `;
//     table.insertAdjacentHTML("beforeend", row);
//   });
  
    

//   renderPagination(data);
// }

// // ---- Pagination Controls ----
// function renderPagination(data) {
//   const pagination = document.getElementById("pagination");
//   pagination.innerHTML = "";

//   const pageCount = Math.ceil(data.length / rowsPerPage);

//   // Prev Button
//   const prevBtn = document.createElement("button");
//   prevBtn.textContent = "Prev";
//   prevBtn.className =
//     "px-3 py-1 border rounded " +
//     (currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "");
//   prevBtn.disabled = currentPage === 1;
//   prevBtn.addEventListener("click", () => {
//     if (currentPage > 1) {
//       currentPage--;
//       renderTable(filteredData);
//     }
//   });
//   pagination.appendChild(prevBtn);

//   // Number Buttons
//   for (let i = 1; i <= pageCount; i++) {
//     const btn = document.createElement("button");
//     btn.textContent = i;
//     btn.className =
//       "px-3 py-1 border rounded " +
//       (i === currentPage ? "bg-blue-500 text-white" : "bg-white");
//     btn.addEventListener("click", () => {
//       currentPage = i;
//       renderTable(filteredData);
//     });
//     pagination.appendChild(btn);
//   }

//   // Next Button
//   const nextBtn = document.createElement("button");
//   nextBtn.textContent = "Next";
//   nextBtn.className =
//     "px-3 py-1 border rounded " +
//     (currentPage === pageCount
//       ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//       : "");
//   nextBtn.disabled = currentPage === pageCount;
//   nextBtn.addEventListener("click", () => {
//     if (currentPage < pageCount) {
//       currentPage++;
//       renderTable(filteredData);
//     }
//   });
//   pagination.appendChild(nextBtn);
// }
// // Populate location filter with unique city values
// function populateLocationFilter(data) {
//   const filter = document.getElementById("categoryFilter");
//   const uniqueCities = [...new Set(data.map(item => item.city))]; // unique cities

//   uniqueCities.forEach(city => {
//     const option = document.createElement("option");
//     option.value = city;
//     option.textContent = city;
//     filter.appendChild(option);
//   });
// }

// // Handle filtering
// document.getElementById("categoryFilter").addEventListener("change", (e) => {
//   const value = e.target.value;
//   currentPage = 1; // reset to page 1

//   if (value === "") {
//     filteredData = [...alertData];
//   } else {
//     filteredData = alertData.filter(item => item.type === value);
//   }

//   renderTable(filteredData);
// });

// // Reset button
// document.getElementById("resetBtn").addEventListener("click", () => {
//   document.getElementById("categoryFilter").value = "";
//   filteredData = [...alertData];
//   currentPage = 1;
//   renderTable(filteredData);
// });

// // Call once on page load
// populateLocationFilter(alertData);

// // ---- Initial Render ----
// renderTable(filteredData);

function loadComponent(id, filePath) {
  fetch(filePath)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      highlightActiveLink();
    })
    .catch(err => console.error("Error loading component:", err));
}

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll("#sidebar a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (currentPath.endsWith(href.replace("../", ""))) {
      link.classList.add("bg-blue-600", "text-white");
    } else {
      link.classList.remove("bg-blue-600", "text-white");
    }
  });
}

loadComponent("sidebar", "../../../core/components/sidebar.html");

// Global variables
let notifications = [];
let customerMessages = [];
let filteredNotifications = [];
let currentPage = 1;
const rowsPerPage = 10;

// DOM Elements
const alertTable = document.getElementById("alertTable");
const pagination = document.getElementById("pagination");
const loadingIndicator = document.getElementById("loadingIndicator");
const noNotifications = document.getElementById("noNotifications");
const tableInfo = document.getElementById("tableInfo");

// Fetch notifications from JSON server
async function fetchNotifications() {
    try {
        showLoading();
        
        // Fetch both notifications and customer messages
        const [notificationsResponse, messagesResponse] = await Promise.all([
            fetch('http://localhost:3000/notifications'),
            fetch('http://localhost:3000/customer_messages')
        ]);
        
        notifications = await notificationsResponse.json();
        customerMessages = await messagesResponse.json();
        
        // Convert customer messages to notification format
        const messageNotifications = customerMessages.map(message => ({
            id: `msg-${message.id}`,
            notification_id: message.id,
            title: "New Customer Message",
            message: `New message from ${message.name} about ${message.subject}`,
            type: "contact",
            related_entity_type: "customer_message",
            related_entity_id: message.id,
            is_read: message.is_read || false,
            created_at: message.created_at,
            customer_name: message.name,
            customer_email: message.email,
            message_subject: message.subject,
            message_content: message.message
        }));
        
        // Combine both types of notifications
        notifications = [...notifications, ...messageNotifications];
        
        // Sort by date (newest first)
        notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        filteredNotifications = [...notifications];
        updateNotificationCounts();
        renderTable(filteredNotifications);
        hideLoading();
    } catch (error) {
        console.error("Error fetching notifications:", error);
        hideLoading();
        showError("Failed to load notifications. Please try again.");
    }
}

// Update notification counts in the stats cards
function updateNotificationCounts() {
    const totalCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const warningCount = notifications.filter(n => n.type === 'warning').length;
    const alertCount = notifications.filter(n => n.type === 'alert').length;
    const contactCount = notifications.filter(n => n.type === 'contact').length;
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('unreadCount').textContent = unreadCount;
    document.getElementById('warningCount').textContent = warningCount;
    document.getElementById('alertCount').textContent = alertCount;
    document.getElementById('contactCount').textContent = contactCount;
}

// Show loading state
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    alertTable.innerHTML = '';
    noNotifications.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

// Show error message
function showError(message) {
    alertTable.innerHTML = `
        <tr>
            <td colspan="5" class="p-4 text-center text-red-500">
                <i class="fas fa-exclamation-circle mr-2"></i>${message}
            </td>
        </tr>
    `;
}

// Render notifications table
function renderTable(data) {
    alertTable.innerHTML = '';
    
    if (data.length === 0) {
        noNotifications.classList.remove('hidden');
        tableInfo.textContent = 'Showing 0 notifications';
        pagination.innerHTML = '';
        return;
    }
    
    noNotifications.classList.add('hidden');
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);
    
    tableInfo.textContent = `Showing ${start + 1}-${Math.min(end, data.length)} of ${data.length} notifications`;
    
    paginatedData.forEach(notification => {
        const row = document.createElement('tr');
        row.className = `border-b ${notification.is_read ? 'notification-read' : 'notification-unread'}`;
        
        // Format date
        const date = new Date(notification.created_at);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        // Determine badge color based on type
        let badgeClass = 'badge-info';
        if (notification.type === 'warning') badgeClass = 'badge-warning';
        if (notification.type === 'alert') badgeClass = 'badge-alert';
        if (notification.type === 'contact') badgeClass = 'badge-contact';
        
        row.innerHTML = `
            <td class="p-3">
                ${notification.is_read 
                    ? '<span class="text-gray-500 text-sm"><i class="fas fa-check-circle mr-1"></i> Read</span>' 
                    : '<span class="text-blue-500 text-sm"><i class="fas fa-envelope mr-1"></i> Unread</span>'}
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs text-white ${badgeClass}">
                    ${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </span>
            </td>
            <td class="p-3">
                <div class="font-medium">${notification.title}</div>
                <div class="text-gray-600 text-sm">${notification.message}</div>
            </td>
            <td class="p-3 text-sm text-gray-500">${formattedDate}</td>
            <td class="p-3">
                <div class="flex space-x-2">
                    <button class="view-btn text-blue-600 hover:text-blue-800 text-sm" data-id="${notification.id}" data-type="${notification.type}">
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                    ${!notification.is_read ? `
                    <button class="mark-read-btn text-green-600 hover:text-green-800 text-sm" data-id="${notification.id}" data-type="${notification.type}">
                        <i class="fas fa-check mr-1"></i> Mark Read
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        alertTable.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewNotification(btn.dataset.id, btn.dataset.type));
    });
    
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', () => markAsRead(btn.dataset.id, btn.dataset.type));
    });
    
    renderPagination(data);
}

// View notification (navigate to related entity)
function viewNotification(id, type) {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    // Mark as read when viewed
    if (!notification.is_read) {
        markAsRead(id, type, true);
    }
    
    // Handle different notification types
    if (type === 'contact') {
        // Show customer message in modal
        showCustomerMessage(notification);
    } else {
        // Navigate to related entity for other notification types
        let url = '';
        switch(notification.related_entity_type) {
            case 'product':
                url = `../inventory/inventory.html?productId=${notification.related_entity_id}`;
                break;
            case 'prescription':
                url = `../verification/verification.html?prescriptionId=${notification.related_entity_id}`;
                break;
            case 'order':
                url = `../orders/orders.html?orderId=${notification.related_entity_id}`;
                break;
            default:
                console.warn('Unknown entity type:', notification.related_entity_type);
                return;
        }
        
        window.location.href = url;
    }
}

// Show customer message in modal
function showCustomerMessage(notification) {
    document.getElementById('messageCustomer').textContent = notification.customer_name || 'Unknown Customer';
    document.getElementById('messageEmail').textContent = notification.customer_email || 'No email provided';
    document.getElementById('messageSubject').textContent = notification.message_subject || 'No subject';
    document.getElementById('messageContent').textContent = notification.message_content || 'No message content';
    document.getElementById('messageDate').textContent = new Date(notification.created_at).toLocaleString();
    
    // Show the modal
    document.getElementById('viewMessageModal').classList.remove('hidden');
}

// Mark notification as read
async function markAsRead(id, type, navigate = false) {
    try {
        const notification = notifications.find(n => n.id === id);
        if (!notification || notification.is_read) return;
        
        // Update locally
        notification.is_read = true;
        
        // Update on server based on type
        if (type === 'contact') {
            // Update customer message
            const messageId = id.replace('msg-', '');
            await fetch(`http://localhost:3000/customer_messages/${messageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_read: true })
            });
        } else {
            // Update regular notification
            await fetch(`http://localhost:3000/notifications/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_read: true })
            });
        }
        
        // Update UI
        updateNotificationCounts();
        renderTable(filteredNotifications);
        
        if (!navigate) {
            showToast('Notification marked as read', 'success');
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        showToast('Failed to mark notification as read', 'error');
    }
}

// Mark all notifications as read
async function markAllAsRead() {
    try {
        // Update all unread notifications locally
        notifications.forEach(n => {
            if (!n.is_read) n.is_read = true;
        });
        
        // Update all on server (in a real app, you might want a batch endpoint)
        const updatePromises = notifications
            .filter(n => !n.is_read)
            .map(n => {
                if (n.type === 'contact') {
                    const messageId = n.id.replace('msg-', '');
                    return fetch(`http://localhost:3000/customer_messages/${messageId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ is_read: true })
                    });
                } else {
                    return fetch(`http://localhost:3000/notifications/${n.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ is_read: true })
                    });
                }
            });
        
        await Promise.all(updatePromises);
        
        // Update UI
        updateNotificationCounts();
        renderTable(filteredNotifications);
        
        showToast('All notifications marked as read', 'success');
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showToast('Failed to mark all notifications as read', 'error');
    }
}

// Filter notifications
function filterNotifications() {
    const typeValue = document.getElementById('typeFilter').value;
    const statusValue = document.getElementById('statusFilter').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    
    filteredNotifications = notifications.filter(notification => {
        // Type filter
        if (typeValue !== 'all' && notification.type !== typeValue) return false;
        
        // Status filter
        if (statusValue === 'read' && !notification.is_read) return false;
        if (statusValue === 'unread' && notification.is_read) return false;
        
        // Search filter
        if (searchValue && 
            !notification.title.toLowerCase().includes(searchValue) &&
            !notification.message.toLowerCase().includes(searchValue) &&
            !(notification.customer_name && notification.customer_name.toLowerCase().includes(searchValue)) &&
            !(notification.message_subject && notification.message_subject.toLowerCase().includes(searchValue))) {
            return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    renderTable(filteredNotifications);
}

// Render pagination controls
function renderPagination(data) {
    const pageCount = Math.ceil(data.length / rowsPerPage);
    
    if (pageCount <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button class="px-3 py-1 border rounded bg-white hover:bg-gray-100" onclick="changePage(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                 </button>`;
    } else {
        html += `<button class="px-3 py-1 border rounded bg-gray-100 text-gray-400 cursor-not-allowed" disabled>
                    <i class="fas fa-chevron-left"></i>
                 </button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= pageCount; i++) {
        if (i === currentPage) {
            html += `<button class="px-3 py-1 border rounded bg-blue-500 text-white">${i}</button>`;
        } else {
            html += `<button class="px-3 py-1 border rounded bg-white hover:bg-gray-100" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // Next button
    if (currentPage < pageCount) {
        html += `<button class="px-3 py-1 border rounded bg-white hover:bg-gray-100" onclick="changePage(${currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                 </button>`;
    } else {
        html += `<button class="px-3 py-1 border rounded bg-gray-100 text-gray-400 cursor-not-allowed" disabled>
                    <i class="fas fa-chevron-right"></i>
                 </button>`;
    }
    
    pagination.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    renderTable(filteredNotifications);
    window.scrollTo(0, 0);
}

// Show toast message
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast fixed top-4 right-4 px-4 py-2 rounded-md shadow-md text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize event listeners
function initEventListeners() {
    document.getElementById('typeFilter').addEventListener('change', filterNotifications);
    document.getElementById('statusFilter').addEventListener('change', filterNotifications);
    document.getElementById('searchInput').addEventListener('input', filterNotifications);
    document.getElementById('resetBtn').addEventListener('click', resetFilters);
    document.getElementById('markAllReadBtn').addEventListener('click', markAllAsRead);
    document.getElementById('notificationSettingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // Message modal event listeners
    document.getElementById('closeMessageModal').addEventListener('click', closeMessageModal);
    document.getElementById('closeMessageBtn').addEventListener('click', closeMessageModal);
    document.getElementById('replyMessageBtn').addEventListener('click', replyToMessage);
}

// Reset all filters
function resetFilters() {
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    filteredNotifications = [...notifications];
    currentPage = 1;
    renderTable(filteredNotifications);
}

// Open settings modal
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
}

// Close settings modal
function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

// Close message modal
function closeMessageModal() {
    document.getElementById('viewMessageModal').classList.add('hidden');
}

// Reply to message
function replyToMessage() {
    const email = document.getElementById('messageEmail').textContent;
    window.location.href = `mailto:${email}`;
}

// Save notification settings
function saveSettings() {
    // In a real application, you would save these preferences to a server
    showToast('Notification settings saved', 'success');
    closeSettings();
}

// Initialize the page
function init() {
    initEventListeners();
    fetchNotifications();
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);