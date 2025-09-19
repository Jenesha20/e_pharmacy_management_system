// navbar.js - Navbar authentication functionality
(function () {
    function renderAuth() {
        const authSection = document.getElementById("auth-section");
        if (!authSection) {
            return;
        }

        // Keep cart button
        const cartButton = authSection.querySelector('button:first-child');
        authSection.innerHTML = '';
        if (cartButton) authSection.appendChild(cartButton);

        // Get current user from localStorage (consistent with auth.js)
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

        if (currentUser && currentUser.email) {
            // Show user info and logout button
            const userSection = document.createElement('div');
            userSection.className = 'flex items-center space-x-4';
            userSection.innerHTML = `
                <span class="text-gray-700 font-semibold">Hi, ${currentUser.email}</span>
                <button id="logoutBtn" class="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    Logout
                </button>
            `;
            authSection.appendChild(userSection);

            const logoutBtn = document.getElementById("logoutBtn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    // Clear localStorage and reload page
                    localStorage.removeItem("currentUser");
                    window.location.reload();
                });
            }
        } else {
            // No user → show login
            const loginLink = document.createElement('a');
            loginLink.href = "../../../customer/auth/login/login.html";
            loginLink.className = "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition";
            loginLink.textContent = "Login";
            authSection.appendChild(loginLink);
        }
    }

    // Expose init function
    window.initAuth = renderAuth;
    
    // Also expose a refresh function that can be called manually
    window.refreshAuth = () => {
        renderAuth();
    };

    // Run immediately
    renderAuth();
    
    // Also run after a short delay to catch any timing issues
    setTimeout(renderAuth, 100);
})();