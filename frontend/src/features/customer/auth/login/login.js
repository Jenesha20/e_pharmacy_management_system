document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/user");
      if (!response.ok) throw new Error("Failed to fetch users");

      const users = await response.json();
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        alert("Login successful!");
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Redirect to landing
        window.location.href = "../../../customer/home/landing/landing.html";
      } else {
        alert("Invalid email or password.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  });
});
