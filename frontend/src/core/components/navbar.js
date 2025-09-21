// // navbar.js - Navbar authentication functionality
// (function () {
//     function renderAuth() {
//         const authSection = document.getElementById("auth-section");
//         if (!authSection) {
//             return;
//         }

//         // Keep cart link
//         const cartLink = authSection.querySelector('a:first-child');
//         authSection.innerHTML = '';
//         if (cartLink) {
//             authSection.appendChild(cartLink);
//         }

//         // Get current user from localStorage (consistent with auth.js)
//         const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

//         if (currentUser && currentUser.email) {
//             // Show user info and logout button
//             const userSection = document.createElement('div');
//             userSection.className = 'flex items-center space-x-4';
//             userSection.innerHTML = `
//                 <span class="text-gray-700 font-semibold">Hi, ${currentUser.first_name}</span>
//                 <button id="logoutBtn" class="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
//                     Logout
//                 </button>
//             `;
//             authSection.appendChild(userSection);

//             const logoutBtn = document.getElementById("logoutBtn");
//             if (logoutBtn) {
//                 logoutBtn.addEventListener("click", () => {
//                     // Clear localStorage and reload page
//                     localStorage.removeItem("currentUser");
//                     window.location.reload();
//                 });
//             }
//         } else {
//             // No user → show login
//             const loginLink = document.createElement('a');
//             loginLink.href = "../../../customer/auth/login/login.html";
//             loginLink.className = "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition";
//             loginLink.textContent = "Login";
//             authSection.appendChild(loginLink);
//         }
//     }

//     // Expose init function
//     window.initAuth = renderAuth;
    
//     // Also expose a refresh function that can be called manually
//     window.refreshAuth = () => {
//         renderAuth();
//     };

//     // Run immediately
//     renderAuth();
    
//     // Also run after a short delay to catch any timing issues
//     setTimeout(renderAuth, 100);
// })();


// navbar.js - Navbar authentication functionality with dropdown
(function () {
    function renderAuth() {
        const authSection = document.getElementById("auth-section");
        if (!authSection) return;

        // Keep cart link
        const cartLink = authSection.querySelector('a:first-child');
        authSection.innerHTML = '';
        if (cartLink) authSection.appendChild(cartLink);

        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

        if (currentUser && currentUser.email) {
            // Create profile dropdown container
            const profileContainer = document.createElement('div');
            profileContainer.className = 'relative';

            // Profile button (avatar)
            const profileButton = document.createElement('button');
            profileButton.className = 'w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold focus:outline-none';
            profileButton.textContent = currentUser.first_name[0].toUpperCase();

            // Dropdown menu
            const dropdown = document.createElement('div');
            dropdown.className = 'absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg hidden flex-col';
            dropdown.innerHTML = `
                <a href="../../../customer/profile/profile/profile.html" class="px-4 py-2 hover:bg-gray-100">Profile</a>
                <button id="logoutBtn" class="px-4 py-2 text-left hover:bg-gray-100 w-full">Logout</button>
            `;

            // Toggle dropdown on click
            profileButton.addEventListener('click', () => {
                dropdown.classList.toggle('hidden');
            });

            // Logout functionality
            const logoutBtn = dropdown.querySelector('#logoutBtn');
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem("currentUser");
                window.location.reload();
            });

            profileContainer.appendChild(profileButton);
            profileContainer.appendChild(dropdown);
            authSection.appendChild(profileContainer);

            // Optional: click outside to close dropdown
            document.addEventListener('click', (e) => {
                if (!profileContainer.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });

        } else {
            // No user → show login
            const loginLink = document.createElement('a');
            loginLink.href = "../../../customer/auth/login/login.html";
            loginLink.className = "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition";
            loginLink.textContent = "Login";
            authSection.appendChild(loginLink);
        }
    }

    window.initAuth = renderAuth;
    window.refreshAuth = () => renderAuth();

    renderAuth();
    setTimeout(renderAuth, 100);
})();
