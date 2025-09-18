/* verification.js
   Put this file next to verification.html and open verification.html in the browser.
   NOTE: the sample prescription image is set to the path below.
   If that path doesn't work with your server, change SAMPLE_IMAGE to a path that resolves
   from the browser (e.g. "/frontend/src/core/assests/pres1.png", "../core/assests/pres1.png", etc.)
*/

const SAMPLE_IMAGE = "/frontend/src/core/assests/pres1.png"; // <- change if needed

// ------------- Sidebar loader (returns Promise) -------------
function loadComponent(id, filePath) {
  return fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error("Failed to load " + filePath);
      return res.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;
      highlightActiveLink();
    })
    .catch(err => {
      // sidebar load failure is non-fatal
      console.warn("Sidebar load failed:", err.message);
    });
}

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll("#sidebar a");
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href && currentPath.endsWith(href.replace("../", ""))) {
      link.classList.add("bg-blue-600", "text-white");
    } else {
      link.classList.remove("bg-blue-600", "text-white");
    }
  });
}

// ------------- Mock data -------------
let prescriptions = [
  { orderId: "ORD001", medicineId: "D06ID232435454", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD002", medicineId: "D06ID232435451", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD003", medicineId: "D06ID232435452", category: "Diabetes", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD004", medicineId: "D06ID232435450", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD005", medicineId: "D06ID232435455", category: "Diabetes", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD006", medicineId: "D06ID232435456", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD007", medicineId: "D06ID232435457", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD008", medicineId: "D06ID232435458", category: "Generic Medicine", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD009", medicineId: "D06ID232435459", category: "Antibiotics", status: "Pending", image: SAMPLE_IMAGE },
  { orderId: "ORD010", medicineId: "D06ID232435460", category: "Antibiotics", status: "Pending", image: SAMPLE_IMAGE }
];

let currentFiltered = [...prescriptions];
let currentPage = 1;
const rowsPerPage = 10;

// ------------- DOM getters -------------
const tbody = () => document.getElementById("verificationTable");
const pageInfo = () => document.getElementById("pageInfo");
const prevBtn = () => document.getElementById("prevPage");
const nextBtn = () => document.getElementById("nextPage");
const searchInput = () => document.getElementById("searchInput");
const categoryFilter = () => document.getElementById("categoryFilter");
const resetBtn = () => document.getElementById("resetBtn");
const searchClearBtn = () => document.getElementById("searchClearBtn");
const toastEl = () => document.getElementById("toast");
const modal = () => document.getElementById("prescriptionModal");
const modalImage = () => document.getElementById("prescriptionImage");
const modalCloseBtn = () => document.getElementById("modalClose");
const modalApproveBtn = () => document.getElementById("modalApprove");
const modalRejectBtn = () => document.getElementById("modalReject");

let selectedOrderId = null;

// ------------- Utility -------------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function showToast(msg) {
  const t = toastEl();
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("opacity-0", "translate-y-2");
  t.style.opacity = "1";
  if (t._timer) clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = "0";
    t.classList.add("translate-y-2");
  }, 2400);
}

// ------------- Render table with pagination -------------
function renderTable() {
  const table = tbody();
  table.innerHTML = "";

  const total = currentFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = currentFiltered.slice(start, end);

  if (pageData.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-500">No prescriptions found</td></tr>`;
  } else {
    pageData.forEach(item => {
      const statusBadge = item.status === "Pending"
        ? `<span class="px-2 py-1 rounded-md text-sm bg-yellow-100 text-yellow-800">${escapeHtml(item.status)}</span>`
        : item.status === "Approved"
          ? `<span class="px-2 py-1 rounded-md text-sm bg-green-100 text-green-800">${escapeHtml(item.status)}</span>`
          : `<span class="px-2 py-1 rounded-md text-sm bg-red-100 text-red-800">${escapeHtml(item.status)}</span>`;

      const actionHtml = item.status === "Pending"
        ? `<div class="flex items-center justify-center gap-2">
             <button data-order="${item.orderId}" class="view-btn px-3 py-1 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600">View</button>
             <button data-order="${item.orderId}" class="approve-btn px-3 py-1 rounded-md bg-green-500 text-white text-sm hover:bg-green-600">Approve</button>
             <button data-order="${item.orderId}" class="reject-btn px-3 py-1 rounded-md bg-red-500 text-white text-sm hover:bg-red-600">Reject</button>
           </div>`
        : `<div class="flex items-center justify-center gap-2">
             ${statusBadge}
             <button data-order="${item.orderId}" class="view-btn px-3 py-1 rounded-md bg-gray-200 text-sm hover:bg-gray-300">View</button>
           </div>`;

      table.innerHTML += `
        <tr class="border-b hover:bg-gray-50">
          <td class="py-3 px-4">${escapeHtml(item.orderId)}</td>
          <td class="py-3 px-4">${escapeHtml(item.medicineId)}</td>
          <td class="py-3 px-4">${escapeHtml(item.category)}</td>
          <td class="py-3 px-4">${statusBadge}</td>
          <td class="py-3 px-4 text-center">${actionHtml}</td>
        </tr>`;
    });
  }

  // Update page info (if element exists)
  if (pageInfo()) pageInfo().textContent = `Page ${currentPage} of ${Math.max(1, Math.ceil(total / rowsPerPage))}`;

  // enable/disable prev/next
  if (prevBtn()) {
    prevBtn().disabled = currentPage <= 1;
    prevBtn().classList.toggle("opacity-50", prevBtn().disabled);
  }
  if (nextBtn()) {
    nextBtn().disabled = currentPage >= Math.max(1, Math.ceil(total / rowsPerPage));
    nextBtn().classList.toggle("opacity-50", nextBtn().disabled);
  }
}

// ------------- Filters -------------
function applyFilters(resetPage = true) {
  const q = (searchInput() ? searchInput().value.trim().toLowerCase() : "");
  const cat = (categoryFilter() ? categoryFilter().value : "");

  currentFiltered = prescriptions.filter(p => {
    const matchQ = !q || p.orderId.toLowerCase().includes(q) || p.medicineId.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = !cat || p.category === cat;
    return matchQ && matchCat;
  });

  if (resetPage) currentPage = 1;
  renderTable();
}

// ------------- Table actions (delegate) -------------
function tableActionsHandler(e) {
  const approveBtn = e.target.closest(".approve-btn");
  const rejectBtn = e.target.closest(".reject-btn");
  const viewBtn = e.target.closest(".view-btn");

  if (approveBtn) {
    const orderId = approveBtn.dataset.order;
    const p = prescriptions.find(x => x.orderId === orderId);
    if (p) {
      p.status = "Approved";
      showToast(`Order ${orderId} approved`);
      applyFilters(false);
    }
    return;
  }

  if (rejectBtn) {
    const orderId = rejectBtn.dataset.order;
    const p = prescriptions.find(x => x.orderId === orderId);
    if (p) {
      p.status = "Rejected";
      showToast(`Order ${orderId} rejected`);
      applyFilters(false);
    }
    return;
  }

  if (viewBtn) {
    const orderId = viewBtn.dataset.order;
    openModal(orderId);
    return;
  }
}

// ------------- Modal control -------------
function openModal(orderId) {
  selectedOrderId = orderId;
  const p = prescriptions.find(x => x.orderId === orderId);
  const m = modal();
  const img = modalImage();

  // use the image from the record if present; otherwise fall back to SAMPLE_IMAGE
  img.src = (p && p.image) ? p.image : SAMPLE_IMAGE;

  m.classList.remove("hidden");
  // small accessibility focus trap
  m.querySelector('div')?.focus?.();
}

function closeModal() {
  selectedOrderId = null;
  const m = modal();
  m.classList.add("hidden");
}

// ------------- Wire controls -------------
function wireControls() {
  // search debounce
  let sDeb = null;
  if (searchInput()) {
    searchInput().addEventListener("input", () => {
      if (sDeb) clearTimeout(sDeb);
      sDeb = setTimeout(() => applyFilters(), 200);
    });
  }

  if (searchClearBtn()) {
    searchClearBtn().addEventListener("click", () => {
      if (searchInput()) searchInput().value = "";
      applyFilters();
    });
  }

  if (categoryFilter()) {
    categoryFilter().addEventListener("change", () => applyFilters());
  }

  if (resetBtn()) {
    resetBtn().addEventListener("click", () => {
      if (searchInput()) searchInput().value = "";
      if (categoryFilter()) categoryFilter().value = "";
      currentFiltered = [...prescriptions];
      currentPage = 1;
      renderTable();
    });
  }

  if (prevBtn()) prevBtn().addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });
  if (nextBtn()) nextBtn().addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(currentFiltered.length / rowsPerPage));
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });

  // delegate table actions
  const table = document.getElementById("verificationTable");
  if (table) table.addEventListener("click", tableActionsHandler);

  // modal buttons
  if (modalCloseBtn()) modalCloseBtn().addEventListener("click", closeModal);
  if (modalApproveBtn()) modalApproveBtn().addEventListener("click", () => {
    if (!selectedOrderId) return;
    const p = prescriptions.find(x => x.orderId === selectedOrderId);
    if (p) {
      p.status = "Approved";
      showToast(`Order ${selectedOrderId} approved`);
      applyFilters(false);
    }
    closeModal();
  });
  if (modalRejectBtn()) modalRejectBtn().addEventListener("click", () => {
    if (!selectedOrderId) return;
    const p = prescriptions.find(x => x.orderId === selectedOrderId);
    if (p) {
      p.status = "Rejected";
      showToast(`Order ${selectedOrderId} rejected`);
      applyFilters(false);
    }
    closeModal();
  });

  // click outside modal to close
  if (modal()) {
    modal().addEventListener("click", (e) => {
      if (e.target === modal()) closeModal();
    });
  }

  // Escape to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// ------------- Init -------------
function init() {
  currentFiltered = [...prescriptions];
  currentPage = 1;
  renderTable();
  wireControls();
}

// ------------- Start -------------
document.addEventListener("DOMContentLoaded", () => {
  // load sidebar (non-fatal) then init
  loadComponent("sidebar", "../../../core/components/sidebar.html")
    .finally(() => init());
});
