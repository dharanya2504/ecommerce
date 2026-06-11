# E-Commerce Platform

A full-stack e-commerce application built with Node.js, Express, MongoDB (backend) and React, Vite, Tailwind CSS (frontend). This platform includes user authentication, product management, shopping cart functionality, order processing, and an admin dashboard.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Environment Configuration](#environment-configuration)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This is a complete e-commerce platform with the following capabilities:

- **User Management**: Register, login, and user authentication with JWT
- **Product Catalog**: Browse, search, and filter products
- **Shopping Cart**: Add/remove items and manage quantities
- **Orders**: Create and track orders
- **Payments**: UPI payment verification system
- **Admin Dashboard**: Manage products, categories, orders, and view analytics
- **Inventory Management**: Admin controls for product and category management

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Data Fetching**: TanStack React Query
- **Routing**: React Router v6

---

## 📁 Project Structure

```
e-commerce/
├── backend/                          # Node.js/Express backend
│   ├── config/
│   │   └── db.js                     # MongoDB connection configuration
│   ├── controllers/
│   │   ├── adminController.js        # Admin operations
│   │   ├── authController.js         # Authentication logic
│   │   ├── cartController.js         # Cart management
│   │   ├── categoryController.js     # Category management
│   │   ├── orderController.js        # Order processing
│   │   ├── paymentController.js      # Payment verification
│   │   └── productController.js      # Product operations
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verification
│   │   ├── errorMiddleware.js        # Error handling
│   │   ├── uploadMiddleware.js       # File upload handling
│   │   └── validateMiddleware.js     # Request validation
│   ├── models/
│   │   ├── Cart.js                   # Cart schema
│   │   ├── Category.js               # Category schema
│   │   ├── Order.js                  # Order schema
│   │   ├── Product.js                # Product schema
│   │   └── User.js                   # User schema
│   ├── routes/
│   │   ├── adminRoutes.js            # Admin endpoints
│   │   ├── authRoutes.js             # Auth endpoints
│   │   ├── cartRoutes.js             # Cart endpoints
│   │   ├── categoryRoutes.js         # Category endpoints
│   │   ├── orderRoutes.js            # Order endpoints
│   │   ├── paymentRoutes.js          # Payment endpoints
│   │   └── productRoutes.js          # Product endpoints
│   ├── utils/
│   │   ├── dbSeeder.js               # Database seeding script
│   │   ├── generateOrderNumber.js    # Order number generation
│   │   └── generateToken.js          # JWT token generation
│   ├── uploads/                      # User uploaded files
│   ├── server.js                     # Main server file
│   ├── test_apis.js                  # API testing script
│   ├── package.json                  # Backend dependencies
│   └── README.md                     # Backend documentation
│
├── frontend/                         # React/Vite frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js      # Axios configuration
│   │   ├── assets/                   # Images and icons
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx        # Admin route protection
│   │   │   ├── BackgroundBlobs.jsx   # UI component
│   │   │   ├── CartDrawer.jsx        # Shopping cart drawer
│   │   │   ├── Footer.jsx            # Footer component
│   │   │   ├── Layout.jsx            # Main layout wrapper
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   ├── ProductCard.jsx       # Product display card
│   │   │   ├── ProtectedRoute.jsx    # User route protection
│   │   │   └── Skeleton.jsx          # Loading skeleton
│   │   ├── pages/
│   │   │   ├── Cart.jsx              # Shopping cart page
│   │   │   ├── Checkout.jsx          # Checkout page
│   │   │   ├── Dashboard.jsx         # User dashboard
│   │   │   ├── Home.jsx              # Home page
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── OrderTracking.jsx     # Order tracking
│   │   │   ├── Payment.jsx           # Payment page
│   │   │   ├── ProductDetails.jsx    # Product detail page
│   │   │   ├── Register.jsx          # Registration page
│   │   │   ├── Shop.jsx              # Shop/catalog page
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx    # Admin overview
│   │   │       ├── AdminProducts.jsx     # Product management
│   │   │       ├── AdminCategories.jsx   # Category management
│   │   │       └── AdminOrders.jsx       # Order management
│   │   ├── store/
│   │   │   ├── authSlice.js          # Redux auth state
│   │   │   ├── cartSlice.js          # Redux cart state
│   │   │   └── store.js              # Redux store config
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # App entry point
│   │   └── index.css                 # Global styles
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   └── README.md                     # Frontend documentation
│
└── README.md                         # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (Cloud): [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **npm** or **yarn** (comes with Node.js)
4. **Git** - [Download](https://git-scm.com/)

### Verify Installation

```bash
node --version
npm --version
mongod --version
git --version
```

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/dharanya2504/ecommerce.git
cd ecommerce
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend
```

#### 2.2 Install Dependencies

```bash
npm install
```

#### 2.3 Create Environment File

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# API Configuration
API_URL=http://localhost:5000/api
FRONTEND_URL=http://localhost:5173
```

#### 2.4 Database Setup (Optional - Seed Initial Data)

To populate the database with sample data:

```bash
node utils/dbSeeder.js
```

This will create:
- Admin user (email: `admin@example.com`, password: `admin123`)
- Test user (email: `user@example.com`, password: `user123`)
- Sample categories and products

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory

```bash
cd ../frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Create Environment File

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Project

### Start Backend Server

From the `backend/` directory:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### Start Frontend Development Server

From the `frontend/` directory (in a new terminal):

```bash
npm run dev
```

**Expected Output:**
```
➜  Local:   http://localhost:5173/
```

### Access the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:5000/api

---

## 🔑 Environment Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ecommerce` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/admin/products` - Create product (admin only)
- `PUT /api/admin/products/:id` - Update product (admin only)
- `DELETE /api/admin/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/admin/categories` - Create category (admin only)
- `PUT /api/admin/categories/:id` - Update category (admin only)
- `DELETE /api/admin/categories/:id` - Delete category (admin only)

### Cart
- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart` - Add item to cart (protected)
- `PUT /api/cart/:id` - Update cart item (protected)
- `DELETE /api/cart/:id` - Remove from cart (protected)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `GET /api/admin/orders` - Get all orders (admin only)

### Payments
- `POST /api/payments/verify` - Verify payment (protected)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats (admin only)

---

## ✨ Features

### User Features
- ✅ User registration and authentication
- ✅ Browse and search products
- ✅ Add/remove items from shopping cart
- ✅ Checkout and place orders
- ✅ View order history and tracking
- ✅ Order payment verification (UPI)
- ✅ User dashboard

### Admin Features
- ✅ Admin dashboard with analytics
- ✅ Product management (CRUD)
- ✅ Category management
- ✅ Order management and tracking
- ✅ Payment verification
- ✅ Sales analytics and revenue tracking
- ✅ User management

### Technical Features
- ✅ JWT-based authentication
- ✅ Protected routes for users and admins
- ✅ Error handling and validation
- ✅ File upload support
- ✅ Responsive UI with Tailwind CSS
- ✅ Real-time data fetching with React Query
- ✅ Redux state management

---

## 🧪 Testing APIs

A test file is included to verify all API endpoints:

### Run API Tests

```bash
cd backend
node test_apis.js
```

This will test:
1. User registration
2. Admin login
3. Product retrieval
4. Category operations
5. Cart management
6. Order creation
7. Payment verification
8. Admin operations

---

## 🔑 Default Test Credentials

After running `dbSeeder.js`:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Regular User:**
- Email: `user@example.com`
- Password: `user123`

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** `Connection refused` error
- **Solution**: 
  - Ensure MongoDB is running: `mongod`
  - Check MongoDB URI in `.env`
  - For MongoDB Atlas, verify IP whitelist

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::5000`
- **Solution**: Change PORT in `.env` or kill the process:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### CORS Issues

**Problem:** `Access to XMLHttpRequest has been blocked by CORS policy`
- **Solution**: 
  - Ensure `FRONTEND_URL` in backend `.env` is correct
  - Check CORS middleware in `server.js`

### Module Not Found

**Problem:** `Cannot find module`
- **Solution**: Reinstall dependencies
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Environment Variables Not Loading

**Problem:** Variables undefined despite being in `.env`
- **Solution**: 
  - Restart the development server
  - Ensure file name is exactly `.env` (backend) or `.env.local` (frontend)
  - Check that variables start with `VITE_` in frontend

### Frontend Can't Connect to Backend

**Problem:** `Network Error` or `Cannot reach API`
- **Solution**:
  - Verify backend is running on correct port
  - Check `VITE_API_URL` in frontend `.env.local`
  - Ensure both URLs match (localhost, IP, or domain)

---

## 📝 Script Commands

### Backend

```bash
# Install dependencies
npm install

# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Run API tests
node test_apis.js

# Seed database
node utils/dbSeeder.js
```

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Support

For issues, questions, or suggestions:
- Open an issue on GitHub: [GitHub Issues](https://github.com/dharanya2504/ecommerce/issues)
- Email: your-email@example.com

---

## 🎉 Quick Start Summary

```bash
# 1. Clone repository
git clone https://github.com/dharanya2504/ecommerce.git
cd ecommerce

# 2. Setup Backend
cd backend
npm install
# Create .env file with configuration
node utils/dbSeeder.js
npm start

# 3. Setup Frontend (in new terminal)
cd frontend
npm install
# Create .env.local file
npm run dev

# 4. Open browser
# Frontend: http://localhost:5173
# API: http://localhost:5000/api
```

---

**Happy Coding! 🚀**
