# Lably - Laboratory Equipment Rental Website

**Lably** is a web-based application designed to facilitate the efficient, structured, and integrated rental and borrowing of laboratory equipment. The platform provides an interface for users (*customers*) to browse laboratory equipment catalogs, initiate rental requests, choose payment methods, as well as features for administrators to manage products, categories, customer verification, and transactions.

This project was developed by **Group 7** to fulfill the coursework requirements for **Web Programming**.

---

## 👥 Group 7 Members

1. **FIKRI AHMAD ARSALAN**
2. **BAHTIAR RIFAI KHUMAIDI**
3. **RAFI RUZAIN RABA**

---

## ✨ Key Features

### 👤 Customer Features
- **Registration & Authentication**: New user account registration and secure login with password encryption.
- **Equipment Catalog**: Browse various laboratory instruments filtered by categories, stock availability, and search terms.
- **ID Verification (KTP)**: Upload national ID card (KTP) for account verification prior to borrowing equipment.
- **Cart & Rental Drafts**: Add laboratory equipment to a rental cart before checkout.
- **Multiple Payment Options**: Support for various payment channels:
  - **Credit Card**
  - **QRIS**
  - **E-Wallet** (ShopeePay, OVO, DANA, GoPay)
- **Order Management & Extension**: View rental history, return statuses, invoices, and submit rental period extension requests.

### 🛡️ Administrator Features
- **Analytics Dashboard**: Summary overview of total products, registered customers, and rental transactions.
- **Product Management (CRUD)**: Add new laboratory instruments (including image upload), update stock/condition, and delete products.
- **Category Management (CRUD)**: Manage lab equipment categories (e.g., *Biology & Life Sciences*, *Chemistry & Material Sciences*).
- **Customer Verification**: Review customer ID submissions with options to Approve or Reject verification requests.
- **Order & Rental Management**: Monitor rental progress statuses (*Pending*, *In Use*, *Completed*, *Overdue*).

### ⚙️ System Automation
- **Inactive User Checker**: Background timer in `app.js` that automatically checks and updates user activity statuses.

---

## 🛠️ Tech Stack

- **Backend Framework**: Node.js & Express.js (v5)
- **Database**: MySQL / MariaDB via XAMPP (phpMyAdmin) using `mysql2` driver
- **Template Engine**: EJS (Embedded JavaScript) & EJS Layouts
- **Security & Authentication**: `bcrypt` (Password Hashing), `express-session` (Session Management)
- **File Uploads**: `multer` (Upload product images & ID verification documents to `./public/uploads`)
- **Frontend & Styling**: HTML5, Vanilla CSS3, and Client-Side JavaScript

---

## 📁 Project Directory Structure

```text
Lably_Website/
├── config/
│   └── database.js            # MySQL database connection configuration
├── controllers/
│   ├── authController.js       # Authentication logic (Admin/User Login, Register, Dashboard)
│   ├── categoryController.js   # CRUD logic for lab equipment categories
│   ├── customerController.js   # Customer management & ID verification logic
│   └── productController.js    # CRUD logic for lab product catalog
├── middlewares/
│   └── authMiddleware.js      # Authentication middleware (isLoggedIn, isAdmin, ensureVerifiedCustomer)
├── models/
│   ├── adminModel.js          # Database queries for admin table
│   ├── categoryModel.js       # Database queries for category table
│   ├── customerModel.js       # Database queries for customer & ID verification
│   ├── draftModel.js          # Database queries for rental cart drafts (d_peminjaman)
│   ├── orderModel.js          # Database queries for rental transactions (peminjaman)
│   ├── paymentModel.js        # Database queries for payment details (payment)
│   ├── productModel.js        # Database queries for products catalog (products)
│   └── userModel.js           # Database queries for user accounts (users)
├── public/
│   ├── Assets/                # Static image assets for the website
│   ├── CSS/                   # Custom CSS styling files for application & dashboards
│   ├── JS/                    # Client-side JavaScript files
│   └── uploads/               # Directory storing uploaded product & ID images
├── routes/
│   └── index.js               # Main Express routing map
├── views/
│   ├── layouts/               # Primary EJS layouts (atmin.ejs, auth.ejs, main.ejs, profile.ejs, forms.ejs)
│   ├── pages/
│   │   ├── admin/             # Admin views (Dashboard, Product, Category, Order, Customer, Invoice)
│   │   ├── auth/              # Auth views (Login & Register pages)
│   │   └── user/              # User views (Home, Catalogue, Product, Cart, Checkout, Payment, Profile)
│   └── partials/              # Partial EJS components (Header, Footer, Admin Sidebar, Profile Sidebar)
├── app.js                     # Main Express.js application entry point
├── generateAdminHash.js       # Utility script to generate bcrypt hash for admin passwords
├── lably_website.sql          # MySQL database schema & sample data dump
├── package.json               # Package configuration and dependencies
└── README.md                  # Project documentation
```

---

## 🗄️ Database Schema (`lably_website.sql`)

The application connects to a MySQL database named **`lably_website`** containing the following core tables:

| Table Name | Description |
| :--- | :--- |
| **`admin`** | Stores administrator accounts. |
| **`category`** | Stores laboratory equipment categories. |
| **`products`** | Stores product catalog details (name, description, stock, condition, daily rental price, image). |
| **`users`** | Stores customer accounts (username, email, password hash, profile image, active/inactive status). |
| **`d_peminjaman`** | Stores rental cart items/drafts before checkout. |
| **`peminjaman`** | Stores confirmed rental transaction records. |
| **`payment`** | Stores payment transaction details (payment method, e-wallet provider, amount). |
| **`reminder`** | Logs return reminder notifications sent to borrowers. |

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v16 or later)
- **XAMPP** (or a local MySQL Server & phpMyAdmin)

### 2. Database Setup
1. Launch **XAMPP Control Panel** and start both **Apache** & **MySQL** services.
2. Open your browser and navigate to **phpMyAdmin** (`http://localhost/phpmyadmin`).
3. Create a new database named **`lably_website`**.
4. Import the **`lably_website.sql`** file located in the project root into the `lably_website` database.

### 3. Install Dependencies
Open your terminal / Command Prompt in the `Lably_Website` project directory and run:

```bash
npm install
```

*This installs all required packages:* `express`, `express-session`, `bcrypt`, `multer`, `mysql2`, `ejs`, `dotenv`, and `body-parser`.

### 4. Running the Application

#### Production Mode:
```bash
npm start
```
or
```bash
node app.js
```

#### Development Mode (with auto-reload):
```bash
npm run dev
```

The application will be accessible at: **`http://localhost:3000`**

---

## 🔑 Default Admin Login

To test the administrator dashboard, you can use the following default admin credentials:
- **Email**: `admin@gmail.com`
- **Password**: `123`

*(The password is hashed using `bcrypt` as defined in `generateAdminHash.js`)*
