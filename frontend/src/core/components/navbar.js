(function () {
    function renderAuth() {
        const authSection = document.getElementById("auth-section");
        if (!authSection) {
            console.log('Auth section not found, retrying...');
            return;
        }
        console.log('Auth section found, rendering authentication...');

        // Keep cart link
        const cartLink = authSection.querySelector('a:first-child');
        authSection.innerHTML = '';
        if (cartLink) authSection.appendChild(cartLink);

        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
        console.log('Navbar auth check - currentUser:', currentUser);
        console.log('Navbar auth check - currentUser.email:', currentUser?.email);
        console.log('Navbar auth check - currentUser.first_name:', currentUser?.first_name);
        console.log('Navbar auth check - currentUser type:', typeof currentUser);
        console.log('Navbar auth check - currentUser is null?', currentUser === null);

        if (currentUser && currentUser.email) {
            console.log('User is authenticated, showing profile dropdown');
            // Create profile dropdown container
            const profileContainer = document.createElement('div');
            profileContainer.className = 'relative';

            // Profile button (avatar)
            const profileButton = document.createElement('button');
            profileButton.className = 'w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-white font-semibold focus:outline-none';
            const firstName = currentUser.first_name || 'U';
            profileButton.textContent = firstName[0].toUpperCase();

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
                window.location.href = '../../../customer/home/landing/landing.html';
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
            console.log('No user found, showing login button');
            // No user → show login
            const loginLink = document.createElement('a');
            loginLink.href = "../../../customer/auth/login/login.html";
            loginLink.className = "px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-blue-600 transition";
            loginLink.textContent = "Login";
            authSection.appendChild(loginLink);
        }
    }

    window.initAuth = renderAuth;
    window.refreshAuth = () => renderAuth();

    // Initialize immediately and with delays to handle timing issues
    renderAuth();
    setTimeout(renderAuth, 100);
    setTimeout(renderAuth, 500);
    setTimeout(renderAuth, 1000);
    setTimeout(renderAuth, 2000);
    
    // Also refresh when the page is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing auth...');
            renderAuth();
            setTimeout(renderAuth, 100);
            setTimeout(renderAuth, 500);
        });
    } else {
        renderAuth();
    }
    
    // Refresh when window loads
    window.addEventListener('load', () => {
        console.log('Window loaded, refreshing auth...');
        renderAuth();
        setTimeout(renderAuth, 100);
        setTimeout(renderAuth, 500);
    });
    
    // Additional retry mechanism
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = setInterval(() => {
        const authSection = document.getElementById("auth-section");
        if (authSection && authSection.children.length <= 1) {
            console.log(`Retrying auth render (attempt ${retryCount + 1})`);
            renderAuth();
        }
        retryCount++;
        if (retryCount >= maxRetries) {
            clearInterval(retryInterval);
        }
    }, 200);
})();
