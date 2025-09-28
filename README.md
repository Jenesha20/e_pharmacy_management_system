---

# 💊 E-Pharmacy Management System

A modern, feature-based **E-Pharmacy Management System** built with **HTML, CSS, JavaScript, and Tailwind CSS**, designed for **medicine ordering, prescription management, and pharmacy administration**.

---

## 🚀 Features

* 👨‍⚕️ **Authentication** – Secure login, signup, and password reset
* 📊 **Admin Dashboard** – Overview of system performance
* 🧑‍🤝‍🧑 **Customer Management** – Add, edit, and view customers
* 🛒 **Order Management** – Place, update, and track medicine orders
* 💊 **Inventory Control** – Stock management, expiry alerts, out-of-stock tracking
* 📷 **Prescription Verification** – Upload and validate prescriptions before approval
* 📈 **Reports & Analytics** – Sales, financial, and operational reports
* 🛍️ **Customer Cart** – Add medicines to cart and checkout seamlessly
* 🔔 **Alerts & Notifications** – System alerts and order updates
* ⚙️ **Settings Module** – Admin preferences and configurations
* 📱 **Responsive UI** – Works smoothly across all devices

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
* **Architecture**: Feature-based modular structure
* **Styling**: Global + feature-specific CSS
* **Utilities**: Modular helper functions for API calls, authentication, and validation
* **Assets**: Images, icons, fonts for a modern UI

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── core/                          # Shared & reusable code
│   │   ├── api/                       # API services (fetch, CRUD operations)
│   │   ├── assets/                    # Static assets (images, icons, fonts)
│   │   ├── components/                # Reusable UI components (navbar, footer, modal)
│   │   └── utils/                     # Helper functions (validation, auth, etc.)
│   │
│   ├── features/                      # Feature-based modules
│   │   ├── admin/                     # Admin-side features
│   │   │   ├── alerts/                # Notifications & system alerts
│   │   │   ├── backup/                # Data backup & restore
│   │   │   ├── configuration/         # Admin configuration & settings
│   │   │   ├── customer/              # Customer management 
│   │   │   ├── dashboard/             # Admin dashboard (overview, stats)
│   │   │   ├── inventory/             # Stock, expiry, out-of-stock management
│   │   │   ├── orders/                # Order processing & management
│   │   │   ├── reports/               # Sales & financial reporting
│   │   │   └── verification/          # Prescription verification
│   │   │
│   │   └── customer/                  # Customer-side features
│   │       ├── about/                 # About page
│   │       ├── auth/                  # Customer authentication (login, signup)
│   │       ├── home/                  # Homepage (landing, product highlights)
│   │       ├── profile/               # Customer profile & account settings
│   │       └── shop/                  # Shopping experience (browse, cart, checkout)
│   │
│   └── README.md                      # Documentation

```

---

## 🏃‍♂️ Quick Start

1. **Clone the repo**

   ```bash
   git clone https://github.com/Jenesha20/e_pharmacy_management_system.git
   cd e_pharmacy_management_system
   ```

2. **Open the landing page**

   ```bash
   open src/frontend/customer/home/landing/landing.html  -> Customer
   ```

   ```bash
   open src/frontend/admin/dashboard/dashboard.html     -> Admin
   ```

3. Start managing medicines, prescriptions, and customers! 🎉

---

## 🎯 Usage

* **Customer Side**

  * Register/Login
  * Browse inventory & add to cart
  * Upload prescription for approval
  * Checkout and track order

* **Admin Side**

  * View dashboard insights
  * Manage customers, orders, and inventory
  * Verify prescriptions before dispatch
  * Generate sales & financial reports
  * Configure system settings

---

## 🏗️ Architecture

* **Feature-based structure** → Each module (auth, orders, prescriptions, etc.) is isolated
* **Reusable components** → Navbar, sidebar, modals shared across modules
* **Separation of concerns** → UI, logic, and utilities are decoupled
* **Scalability** → Easy to extend with payment gateway, delivery tracking, etc.

---

## 📱 Browser Support

* Chrome 60+
* Firefox 55+
* Safari 12+
* Edge 79+

---

## 📄 License

MIT License – free to use and modify for learning and development.

---

**Built with ❤️ to simplify pharmacy operations and healthcare access**

---

