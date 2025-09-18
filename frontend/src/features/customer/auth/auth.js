// auth.js
(function () {
    function renderAuth() {
      const authSection = document.getElementById("auth-section");
      if (!authSection) {
        // silently return — header might not be present on this page
        return;
      }
  
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  
      if (currentUser) {
        authSection.innerHTML = `
          <div class="flex items-center space-x-4">
            <span class="text-gray-700 font-semibold">Hi, ${currentUser.name || currentUser.email}</span>
            <button id="logoutBtn" class="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        `;
  
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            // optional: redirect to homepage
            window.location.reload();
          });
        }
      } else {
        authSection.innerHTML = `
          <a href="../../../customer/auth/login/login.html" 
             class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
             Login
          </a>
        `;
      }
    }
  
    // Expose init function so you can call it after dynamically injecting header
    window.initAuth = renderAuth;
  
    // Also run on DOMContentLoaded (covers static header pages)
    document.addEventListener("DOMContentLoaded", renderAuth);
  })();
  