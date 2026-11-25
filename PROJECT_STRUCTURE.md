# Project Structure & Architecture Guide

## 1. Overview of the Project Architecture

**Lably** is a server-rendered **Node.js + Express.js (v5) + EJS + MySQL2** web application following a modular **Model–View–Controller (MVC)** architecture.

- **Entry Point (`app.js`)**: Configures Express middleware, session management, static file serving (`public/`), EJS view engine, startup schema checks (`database/migrations.js`), background jobs (`jobs/inactiveUserJob.js`), and mounts the aggregated router (`routes/index.js`).
- **Routing (`routes/`)**: Split by access domain (`authRoutes.js`, `userRoutes.js`, `adminRoutes.js`) and aggregated in `routes/index.js`.
- **Controllers (`controllers/`)**: Grouped by domain (`auth/`, `user/`, `admin/`) to separate request handling and view rendering from route definitions.
- **Models (`models/`)**: Encapsulate MySQL queries using `mysql2` via `config/database.js`.
- **Views (`views/`)**: EJS layouts, domain-grouped pages, and reusable partials.
- **Static Assets (`public/`)**: Lowercase, domain-organized stylesheets (`css/`), client scripts (`js/`), static images (`assets/`), and user uploads (`uploads/`).

---

## 2. Complete Folder and File Structure

```text
Lably_Website/
├── app.js                         # Main Express application entry point
├── package.json                   # Package metadata, scripts, and dependencies
├── package-lock.json              # Locked dependency tree
├── README.md                      # Project overview and setup instructions
├── PROJECT_STRUCTURE.md           # Architecture and file management documentation
├── config/
│   ├── database.js                # MySQL connection setup (supports .env variables)
│   └── upload.js                  # Shared Multer disk storage configuration
├── controllers/
│   ├── admin/
│   │   ├── analyticsController.js # Admin analytics and invoice pages
│   │   ├── categoryController.js  # Category CRUD operations
│   │   ├── customerController.js  # Customer listing, detail, and KTP approval
│   │   ├── dashboardController.js # Admin dashboard overview
│   │   ├── orderController.js     # Admin order workflow (approve, reject, complete, reminder)
│   │   └── productController.js   # Product CRUD operations
│   ├── auth/
│   │   └── authController.js      # Login, registration, and logout handlers
│   └── user/
│       ├── cartController.js      # Cart, checkout, payment previews, and checkout completion
│       ├── catalogueController.js # Home, catalogue, product detail, and public APIs
│       ├── loanController.js      # Rental/extension form and submission handler
│       └── profileController.js   # Customer dashboard, profile, KTP upload, orders, receipts
├── database/
│   ├── lably_website.sql          # MySQL database schema and seed data dump
│   └── migrations.js              # Idempotent startup schema checks & status normalization
├── jobs/
│   └── inactiveUserJob.js         # Periodic background job to deactivate inactive users
├── middlewares/
│   └── authMiddleware.js          # Authentication & role-based authorization middlewares
├── models/
│   ├── adminModel.js              # Admin account queries
│   ├── categoryModel.js           # Equipment category queries
│   ├── customerModel.js           # Customer filtering and KTP status queries
│   ├── draftModel.js              # Rental cart draft (`d_peminjaman`) queries
│   ├── orderModel.js              # Rental order (`peminjaman`) queries
│   ├── paymentModel.js            # Payment (`payment`) queries
│   ├── productModel.js            # Product catalog (`products`) queries
│   └── userModel.js               # User account (`users`) queries
├── public/
│   ├── assets/                    # Static images, icons, and payment logos
│   ├── css/
│   │   ├── admin/                 # Admin dashboard & management stylesheets
│   │   ├── auth/                  # Login & register stylesheets
│   │   ├── shared/                # Global & form stylesheets
│   │   └── user/                  # Customer-facing stylesheets
│   ├── js/
│   │   ├── admin/                 # Admin client-side scripts
│   │   └── user/                  # User client-side scripts
│   └── uploads/                   # Uploaded product images, KTPs, and profile photos
├── routes/
│   ├── index.js                   # Main router mounting auth, user, and admin routes
│   ├── adminRoutes.js             # Admin-protected routes
│   ├── authRoutes.js              # Authentication routes
│   └── userRoutes.js              # Public and customer-protected routes
├── scripts/
│   └── generateAdminHash.js       # Utility script to generate bcrypt admin password hashes
├── utils/
│   └── dateAndCurrency.js         # Shared date duration and currency parsing helpers
└── views/
    ├── layouts/                   # Top-level EJS page shells (admin, auth, forms, main, profile)
    ├── pages/
    │   ├── admin/                 # Admin EJS pages (category/, order/, product/, dashboard, etc.)
    │   ├── auth/                  # Auth EJS pages (login, register)
    │   └── user/                  # Customer EJS pages (payment/, profile/, home, catalogue, etc.)
    └── partials/                  # Reusable EJS partials (header, footer, sidebars)
```

---

## 3. Major Directory Responsibilities

| Directory | Responsibility |
| :--- | :--- |
| `config/` | Infrastructure configuration (MySQL connection, Multer upload storage). |
| `controllers/` | Request validation, model orchestration, and EJS rendering, grouped by `admin/`, `auth/`, and `user/`. |
| `database/` | SQL dump (`lably_website.sql`) and startup schema safety checks (`migrations.js`). |
| `jobs/` | Scheduled background intervals/tasks (such as `inactiveUserJob.js`). |
| `middlewares/` | Express request guards (`isLoggedIn`, `isAdmin`, `ensureVerifiedCustomer`, `passLoginStatus`). |
| `models/` | Database access layer; each file corresponds to a primary table or domain entity. |
| `public/` | Static assets served directly by Express (`assets/`, `css/`, `js/`, `uploads/`). |
| `routes/` | Express route definitions split by domain and mounted via `routes/index.js`. |
| `scripts/` | Standalone CLI/developer utility scripts not executed by the web server. |
| `utils/` | Pure, reusable helper functions shared across controllers/services. |
| `views/` | EJS templates organized into `layouts/`, `pages/` (by domain), and `partials/`. |

---

## 4. Naming Conventions

- **Directories:** `lowercase` or `kebab-case` (e.g., `public/css/admin/`, `views/pages/user/`).
- **Backend JS Files:** `camelCase` with a descriptive role suffix:
  - Controllers: `<domain>Controller.js` (e.g., `orderController.js`)
  - Models: `<entity>Model.js` (e.g., `productModel.js`)
  - Routes: `<domain>Routes.js` (e.g., `adminRoutes.js`)
  - Middlewares: `<purpose>Middleware.js` (e.g., `authMiddleware.js`)
- **EJS Views & CSS/JS Assets:** `kebab-case` (e.g., `product-list.ejs`, `order-completed.css`, `e-wallet-qr.ejs`).
- **Constants:** `UPPER_SNAKE_CASE` for module-level configuration constants (e.g., `PORT`).

---

## 5. Guidelines for Adding New Components (EJS Partials & Layouts)

1. Place reusable UI fragments (e.g., modals, cards, navigation bars) in `views/partials/` using `kebab-case.ejs`.
2. Place page-level shells in `views/layouts/` only when a new top-level chrome/navigation pattern is required.
3. Reference static files from templates using root-relative lowercase paths (`/css/...`, `/js/...`, `/assets/...`).

---

## 6. Guidelines for Adding New Features

1. **Model:** Add or extend the relevant file in `models/<entity>Model.js` for all SQL queries. Avoid writing raw SQL inside route files.
2. **Controller:** Add handler methods in `controllers/<domain>/<feature>Controller.js`.
3. **Routes:** Register endpoints in `routes/userRoutes.js`, `routes/adminRoutes.js`, or `routes/authRoutes.js` with appropriate middlewares (`isLoggedIn`, `ensureVerifiedCustomer`, `isAdmin`).
4. **Views & Styles:** Add page templates under `views/pages/<domain>/` and page-specific styles under `public/css/<domain>/`.

---

## 7. Guidelines for Adding Utilities, Middlewares, and Jobs

- **Utilities (`utils/`):** Place pure, stateless helper functions (date math, formatting, parsing) in `utils/`.
- **Middlewares (`middlewares/`):** Place Express `(req, res, next)` guards or request-enriching functions in `middlewares/`.
- **Background Jobs (`jobs/`):** Place recurring timers or scheduled maintenance tasks in `jobs/` and invoke them from `app.js`.

---

## 8. Guidelines for Managing Assets

- Place static images, icons, and logos in `public/assets/` and reference them with `/assets/<filename>`.
- Place user-uploaded files in `public/uploads/` (handled by `config/upload.js`).
- Place stylesheets in `public/css/<domain>/` (`admin/`, `auth/`, `shared/`, or `user/`). Inside CSS files, use root-relative `/assets/...` URLs so stylesheets remain independent of directory depth.
- Place client-side JavaScript in `public/js/<domain>/` (`admin/` or `user/`).

---

## 9. Import and Dependency Organization

Order `require()` statements at the top of backend files consistently:
1. Built-in Node.js modules (`path`, `fs`)
2. Third-party packages (`express`, `ejs`, `bcrypt`, `dotenv`)
3. Internal configuration & utilities (`../../config/...`, `../../utils/...`)
4. Models & middlewares (`../../models/...`, `../../middlewares/...`)

---

## 10. Placement Examples for Future Files

| New File | Target Location |
| :--- | :--- |
| New admin report controller | `controllers/admin/reportController.js` |
| New customer notification page | `views/pages/user/profile/notifications.ejs` |
| Stylesheet for notifications page | `public/css/user/notifications.css` |
| Reusable pagination helper | `utils/pagination.js` |
| Database seed or maintenance script | `scripts/<scriptName>.js` |
