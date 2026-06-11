# 🛍️ SimpleEcommerce Backend — Complete Testing Guide

## Overview

This guide covers testing the SimpleEcommerce backend. You can either use the **automated E2E verification script** for an instant check or follow the **manual Postman guide** below to test each endpoint step-by-step.

---

## ⚡ Automated E2E Verification Script

For a quick, fully automated verification of all 17 critical user and admin flows, run the test runner script:

```bash
# From the backend/ directory:
node test_apis.js
```

This script will start a local test server, connect to MongoDB, seed the database, and execute the entire e-commerce lifecycle:
1. Health check verification
2. Customer registration
3. Admin authentication
4. Category and product retrieval
5. Add items to cart & cart updates
6. QR code generation
7. Checkout & order creation
8. Multipart payment proof screenshot upload
9. Admin order review & manual payment approval
10. Status progression (`Processing` -> `Shipped` -> `Delivered`)
11. Customer-side order tracking
12. Admin dashboard statistics aggregation

All outputs and JSON responses will be logged directly to the console.

---

## ⚙️ Initial Setup


### 1. Install Node.js and Start the Server

```bash
# In the backend/ directory:
npm install
npm run dev          # Development mode with auto-restart
# or
npm start            # Production mode
```

**Expected server output:**
```
✅ MongoDB Connected: localhost
📦 Database: simpleEcommerce
✅ Admin user created: admin@example.com
══════════════════════════════════════════════════
🚀 Server running on port 5000
📡 API Base URL: http://localhost:5000/api
══════════════════════════════════════════════════
```

### 2. Seed Sample Data (Optional but recommended)

```bash
npm run seed
```

This creates sample categories, products, and test users. **WARNING:** This clears existing data.

---

### 3. Postman Environment Setup

In Postman, create a new **Environment** named `SimpleEcommerce` with these variables:

| Variable | Initial Value |
|---|---|
| `baseUrl` | `http://localhost:5000/api` |
| `userToken` | *(leave blank, filled automatically)* |
| `adminToken` | *(leave blank, filled automatically)* |
| `productId` | *(leave blank)* |
| `categoryId` | *(leave blank)* |
| `orderId` | *(leave blank)* |
| `cartItemId` | *(leave blank)* |

> [!TIP]
> After login requests, copy the `token` from the response body and paste it into `userToken` or `adminToken` in your environment.

---

## 🏥 Health Check

### `GET /api/health`

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/health` |
| Auth | None |

**Expected Response (200):**
```json
{
  "success": true,
  "message": "SimpleEcommerce API is running.",
  "timestamp": "2024-06-11T04:50:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## 👤 Authentication APIs

### 1. Register a New User

| Field | Value |
|---|---|
| Method | POST |
| URL | `{{baseUrl}}/auth/register` |
| Content-Type | `application/json` |
| Auth | None |

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665abc123def456",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "9876543210",
    "role": "user",
    "createdAt": "2024-06-11T04:50:00.000Z"
  }
}
```
> **Copy the `token` → paste into `userToken` environment variable.**

---

### 2. User Login

| Field | Value |
|---|---|
| Method | POST |
| URL | `{{baseUrl}}/auth/login` |
| Content-Type | `application/json` |
| Auth | None |

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Expected Response (200):** Same as register — includes JWT token and user details.

---

### 3. Admin Login

| Field | Value |
|---|---|
| Method | POST |
| URL | `{{baseUrl}}/auth/login` |
| Content-Type | `application/json` |

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

> **Copy the `token` → paste into `adminToken` environment variable.**

---

### 4. Get My Profile

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/auth/me` |
| Auth | Bearer Token: `{{userToken}}` |

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "user",
    "isActive": true
  }
}
```

---

## 📂 Category APIs

### 5. Create Category (Admin)

| Field | Value |
|---|---|
| Method | POST |
| URL | `{{baseUrl}}/categories` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{adminToken}}` |

**Request Body:**
```json
{
  "categoryName": "Men's Clothing",
  "description": "Shirts, trousers, jackets, and more for men."
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully.",
  "category": {
    "_id": "665cat123abc",
    "categoryName": "Men's Clothing",
    "description": "Shirts, trousers, jackets, and more for men.",
    "createdAt": "2024-06-11T04:50:00.000Z"
  }
}
```
> **Copy `_id` → paste into `categoryId` environment variable.**

---

### 6. Get All Categories (Public)

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/categories` |
| Auth | None |

---

### 7. Update Category (Admin)

| Field | Value |
|---|---|
| Method | PUT |
| URL | `{{baseUrl}}/categories/{{categoryId}}` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{adminToken}}` |

**Request Body:**
```json
{
  "description": "Updated description for men's clothing."
}
```

---

### 8. Delete Category (Admin)

| Field | Value |
|---|---|
| Method | DELETE |
| URL | `{{baseUrl}}/categories/{{categoryId}}` |
| Auth | Bearer Token: `{{adminToken}}` |

---

## 🛍️ Product APIs

### 9. Create Product (Admin) — with Image Upload

| Field | Value |
|---|---|
| Method | POST |
| URL | `{{baseUrl}}/products` |
| Content-Type | `multipart/form-data` |
| Auth | Bearer Token: `{{adminToken}}` |

**Form-Data Fields:**
| Key | Value | Type |
|---|---|---|
| `productName` | Classic White Formal Shirt | Text |
| `description` | A crisp, slim-fit white formal shirt... | Text |
| `category` | `{{categoryId}}` | Text |
| `price` | 1299 | Text |
| `stock` | 100 | Text |
| `sizes` | `["S","M","L","XL","XXL"]` | Text |
| `colors` | `["White","Light Blue","Grey"]` | Text |
| `images` | (select a .jpg/.png file) | File |

> [!NOTE]
> In Postman, change the body type to **form-data**. Add the `images` key and change its type dropdown to **File**, then select an image.

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully.",
  "product": {
    "_id": "665prod789xyz",
    "productName": "Classic White Formal Shirt",
    "price": 1299,
    "stock": 100,
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "colors": ["White", "Light Blue", "Grey"],
    "images": ["/uploads/images-1718000000000-123456789.jpg"],
    "category": { "_id": "...", "categoryName": "Men's Clothing" },
    "isActive": true
  }
}
```
> **Copy `_id` → paste into `productId` environment variable.**

---

### 10. Get All Products (Public)

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/products` |
| Auth | None |

**Optional Query Parameters:**
```
?category=665cat123abc
?search=shirt
?minPrice=500&maxPrice=2000
?inStock=true
?page=1&limit=12
```

---

### 11. Get Single Product (Public)

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/products/{{productId}}` |
| Auth | None |

---

### 12. Update Product (Admin)

| Field | Value |
|---|---|
| Method | PUT |
| URL | `{{baseUrl}}/products/{{productId}}` |
| Content-Type | `multipart/form-data` |
| Auth | Bearer Token: `{{adminToken}}` |

**Form-Data:**
| Key | Value |
|---|---|
| `price` | 1499 |
| `stock` | 80 |
| `replaceImages` | false |

---

### 13. Delete Product (Admin) — Soft Delete

| Field | Value |
|---|---|
| Method | DELETE |
| URL | `{{baseUrl}}/products/{{productId}}` |
| Auth | Bearer Token: `{{adminToken}}` |

---

## 🛒 Cart APIs

### 14. Add to Cart

| Field | Value |
|---|---|
| Method | POST |
| URL | `{{baseUrl}}/cart/add` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{userToken}}` |

**Request Body:**
```json
{
  "productId": "{{productId}}",
  "quantity": 2,
  "size": "M",
  "color": "White"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart.",
  "cart": {
    "_id": "...",
    "user": "...",
    "items": [
      {
        "_id": "665item001",
        "product": {
          "_id": "665prod789xyz",
          "productName": "Classic White Formal Shirt",
          "price": 1299,
          "images": ["/uploads/..."]
        },
        "quantity": 2,
        "size": "M",
        "color": "White"
      }
    ]
  }
}
```
> **Copy `items[0]._id` → paste into `cartItemId` environment variable.**

---

### 15. View Cart

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/cart` |
| Auth | Bearer Token: `{{userToken}}` |

**Expected Response (200):**
```json
{
  "success": true,
  "cart": { "items": [...] },
  "totalItems": 2,
  "totalPrice": 2598.00
}
```

---

### 16. Update Cart Item Quantity

| Field | Value |
|---|---|
| Method | PUT |
| URL | `{{baseUrl}}/cart/update` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{userToken}}` |

**Request Body:**
```json
{
  "itemId": "{{cartItemId}}",
  "quantity": 3
}
```

---

### 17. Remove Item from Cart

| Field | Value |
|---|---|
| Method | DELETE |
| URL | `{{baseUrl}}/cart/remove` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{userToken}}` |

**Request Body:**
```json
{
  "itemId": "{{cartItemId}}"
}
```

---

## 📦 Order APIs

> [!IMPORTANT]
> Before creating an order, make sure you have at least one item in the cart (add using Cart API first).

### 18. Place an Order

| Field | Value |
|---|---|
| Method | POST |
| URL | `{{baseUrl}}/orders/create` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{userToken}}` |

**Request Body (optional shipping address):**
```json
{
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "postalCode": "600001",
    "country": "India"
  }
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully! Please complete payment.",
  "order": {
    "_id": "665order999",
    "orderNumber": "ORD-20240611-A3F9E12B",
    "totalAmount": 2598,
    "paymentStatus": "Pending",
    "orderStatus": "Pending Payment",
    "products": [
      {
        "productName": "Classic White Formal Shirt",
        "quantity": 2,
        "size": "M",
        "color": "White",
        "price": 1299
      }
    ]
  }
}
```
> **Copy order `_id` → paste into `orderId` environment variable.**

---

### 19. Get My Orders

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/orders/my-orders` |
| Auth | Bearer Token: `{{userToken}}` |

**Optional Query Params:**
```
?orderStatus=Pending Payment
?paymentStatus=Pending
?page=1&limit=10
```

---

### 20. Get Single Order

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/orders/{{orderId}}` |
| Auth | Bearer Token: `{{userToken}}` |

---

## 💳 Payment APIs

### 21. Get UPI QR Code

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/payment/qr` |
| Auth | None |

**Expected Response (200):**
```json
{
  "success": true,
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
  "upiId": "yourupi@okaxis",
  "upiName": "SimpleEcommerce",
  "upiString": "upi://pay?pa=yourupi@okaxis&pn=SimpleEcommerce&cu=INR",
  "instructions": [
    "1. Open any UPI payment app...",
    "..."
  ]
}
```

> [!TIP]
> To view the QR image: copy the `qrCodeImage` value (starting with `data:image/png;base64,...`) and paste it into your browser address bar — you'll see the QR code image.

---

### 22. Upload Payment Proof Screenshot

| Field | Value |
|---|---|
| Method | POST |
| URL | `{{baseUrl}}/payment/upload-proof` |
| Content-Type | `multipart/form-data` |
| Auth | Bearer Token: `{{userToken}}` |

**Form-Data:**
| Key | Value | Type |
|---|---|---|
| `orderId` | `{{orderId}}` | Text |
| `paymentProof` | (select a screenshot image file) | File |

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment proof uploaded successfully. Awaiting admin approval.",
  "orderId": "665order999",
  "orderNumber": "ORD-20240611-A3F9E12B",
  "paymentProof": "/uploads/paymentProof-1718000000000-123456789.jpg",
  "paymentStatus": "Pending",
  "orderStatus": "Pending Payment"
}
```

---

## 🔐 Admin APIs

> [!IMPORTANT]
> All admin requests must include `Authorization: Bearer {{adminToken}}` header.

### 23. Admin Dashboard

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/admin/dashboard` |
| Auth | Bearer Token: `{{adminToken}}` |

**Expected Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "totalUsers": 5,
    "totalProducts": 10,
    "totalOrders": 3,
    "pendingPayments": 2,
    "approvedPayments": 1,
    "rejectedPayments": 0,
    "revenue": 3897.00,
    "orderStatusBreakdown": {
      "Pending Payment": 2,
      "Payment Approved": 1
    },
    "recentOrders": [...]
  }
}
```

---

### 24. Approve Payment (Admin)

| Field | Value |
|---|---|
| Method | PUT |
| URL | `{{baseUrl}}/admin/payment/approve/{{orderId}}` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{adminToken}}` |

**Request Body (optional):**
```json
{
  "remarks": "Payment verified. Looks good!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment approved for order ORD-20240611-A3F9E12B.",
  "order": {
    "paymentStatus": "Approved",
    "orderStatus": "Payment Approved"
  }
}
```

---

### 25. Reject Payment (Admin)

| Field | Value |
|---|---|
| Method | PUT |
| URL | `{{baseUrl}}/admin/payment/reject/{{orderId}}` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{adminToken}}` |

**Request Body:**
```json
{
  "remarks": "Payment screenshot is blurry. Please resubmit."
}
```

---

### 26. Update Order Status (Admin)

| Field | Value |
|---|---|
| Method | PUT |
| URL | `{{baseUrl}}/admin/orders/{{orderId}}/status` |
| Content-Type | `application/json` |
| Auth | Bearer Token: `{{adminToken}}` |

> [!WARNING]
> The order MUST have `paymentStatus: "Approved"` before you can set status to `"Processing"`. This is a hard business rule enforced by the backend.

**Request Body:**
```json
{
  "orderStatus": "Processing"
}
```

**Valid Status Transitions:**
```
Pending Payment → (admin approves payment) → Payment Approved
Payment Approved → Processing
Processing → Shipped
Shipped → Delivered
Any Stage → Cancelled
```

---

### 27. Get All Orders (Admin)

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/admin/orders` |
| Auth | Bearer Token: `{{adminToken}}` |

**Optional Query Params:**
```
?orderStatus=Pending Payment
?paymentStatus=Pending
?search=ORD-20240611
?page=1&limit=20
```

---

### 28. Get All Users (Admin)

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/admin/users` |
| Auth | Bearer Token: `{{adminToken}}` |

**Optional Query Params:**
```
?role=user
?isActive=true
?search=alice
```

---

### 29. Toggle User Active Status (Admin)

| Field | Value |
|---|---|
| Method | PUT |
| URL | `{{baseUrl}}/admin/users/{{userId}}/toggle` |
| Auth | Bearer Token: `{{adminToken}}` |

---

### 30. Get All Products (Admin View)

| Field | Value |
|---|---|
| Method | GET |
| URL | `{{baseUrl}}/admin/products` |
| Auth | Bearer Token: `{{adminToken}}` |

**Optional Query Params:**
```
?isActive=false   (view deactivated products)
?category={{categoryId}}
```

---

## 🌊 End-to-End Payment Flow Test

Follow this exact sequence to test the complete payment flow:

```
1.  POST /api/auth/register      → Create user account
2.  POST /api/auth/login         → Get userToken
3.  POST /api/auth/login         → Admin login → Get adminToken
4.  POST /api/categories         → Create category (adminToken)
5.  POST /api/products           → Create product (adminToken)
6.  POST /api/cart/add           → Add product to cart (userToken)
7.  GET  /api/cart               → View cart with total
8.  GET  /api/payment/qr         → Get UPI QR code
9.  POST /api/orders/create      → Place order (cart → order)
10. POST /api/payment/upload-proof → Upload payment screenshot
11. GET  /api/admin/orders       → Admin views pending orders
12. PUT  /api/admin/payment/approve/:orderId → Admin approves
13. PUT  /api/admin/orders/:orderId/status   → Set to "Processing"
14. PUT  /api/admin/orders/:orderId/status   → Set to "Shipped"
15. PUT  /api/admin/orders/:orderId/status   → Set to "Delivered"
16. GET  /api/orders/my-orders   → User sees "Delivered" order
```

---

## 🗄️ MongoDB Verification

### Connect via MongoDB Compass or mongosh

```bash
mongosh "mongodb://localhost:27017/simpleEcommerce"
```

### Useful Queries

```javascript
// View all collections
show collections

// Count documents in each collection
db.users.countDocuments()
db.categories.countDocuments()
db.products.countDocuments()
db.carts.countDocuments()
db.orders.countDocuments()

// View admin user
db.users.findOne({ role: "admin" })

// View all orders with pending payments
db.orders.find({ paymentStatus: "Pending" }).pretty()

// View an order with full details
db.orders.findOne({ orderStatus: "Payment Approved" })

// Revenue calculation (manual)
db.orders.aggregate([
  { $match: { paymentStatus: "Approved" } },
  { $group: { _id: null, total: { $sum: "$totalAmount" } } }
])

// View products in a category
db.products.find({ isActive: true }).sort({ createdAt: -1 })
```

---

## 📁 Uploaded Files

Uploaded images (product images + payment proofs) are stored in:
```
backend/uploads/
```

Access them via browser:
```
http://localhost:5000/uploads/<filename>
```

---

## ❌ Common Error Responses

| Status | Scenario | Response |
|---|---|---|
| 401 | Missing/invalid token | `{ "success": false, "message": "Access denied. No token provided." }` |
| 401 | Expired token | `{ "success": false, "message": "Token has expired. Please log in again." }` |
| 403 | Non-admin accessing admin route | `{ "success": false, "message": "Access denied. Admins only." }` |
| 404 | Resource not found | `{ "success": false, "message": "Product not found." }` |
| 409 | Duplicate email/category | `{ "success": false, "message": "Email already exists." }` |
| 422 | Validation errors | `{ "success": false, "message": "Validation failed...", "errors": [...] }` |
| 400 | Business rule violation | `{ "success": false, "message": "Cannot move to Processing. Payment must be approved first." }` |

---

## 📦 Installation Summary

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install all dependencies
npm install

# 3. Start the server (development)
npm run dev

# 4. (Optional) Seed sample data
npm run seed

# 5. Health check
curl http://localhost:5000/api/health
```

### Required NPM Packages

```
express          — Web framework
mongoose         — MongoDB ODM
jsonwebtoken     — JWT auth
bcryptjs         — Password hashing
cors             — Cross-origin requests
helmet           — HTTP security headers
multer           — File upload handling
qrcode           — QR code generation
express-validator — Input validation
dotenv           — Environment variables
nodemon          — Dev auto-restart (devDependency)
```
