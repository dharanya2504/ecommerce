/**
 * ============================================================
 *  Simple Ecommerce Backend — E2E API Verification Script
 * ============================================================
 */

const fs = require('fs');
const path = require('path');

// Change PORT to avoid conflict with any already running server
process.env.PORT = '5001';
process.env.NODE_ENV = 'test';

console.log('🏁 Starting E2E API Verification...');

// Start the server programmatically
const app = require('./server');
const API_URL = 'http://localhost:5001/api';

// Helper to wait
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  // Wait for server and DB connection to initialize
  console.log('⏳ Waiting for server and database connection to be ready...');
  await sleep(3000);

  let userToken = '';
  let adminToken = '';
  let categoryId = '';
  let productId = '';
  let cartItemId = '';
  let orderId = '';
  let orderNumber = '';

  try {
    // ─────────────── TEST 1: Health Check ───────────────
    console.log('\n🔍 Test 1: Health Check');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    if (healthRes.status !== 200 || !healthData.success) {
      throw new Error(`Health Check failed: ${JSON.stringify(healthData)}`);
    }
    console.log('✅ Health Check passed:', healthData.message);

    // ─────────────── TEST 2: Register New User ───────────────
    console.log('\n🔍 Test 2: Register User');
    const userEmail = `tester_${Date.now()}@example.com`;
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: userEmail,
        password: 'password123',
        phone: '9876543210'
      })
    });
    const registerData = await registerRes.json();
    if (registerRes.status !== 201 || !registerData.success) {
      throw new Error(`Registration failed: ${JSON.stringify(registerData)}`);
    }
    userToken = registerData.token;
    console.log('✅ User registered successfully. Email:', userEmail);

    // ─────────────── TEST 3: Admin Login ───────────────
    console.log('\n🔍 Test 3: Admin Login');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.success) {
      throw new Error(`Admin Login failed: ${JSON.stringify(loginData)}`);
    }
    adminToken = loginData.token;
    console.log('✅ Admin logged in successfully.');

    // ─────────────── TEST 4: Get Categories ───────────────
    console.log('\n🔍 Test 4: Get Categories');
    const catRes = await fetch(`${API_URL}/categories`);
    const catData = await catRes.json();
    if (catRes.status !== 200 || !catData.success || catData.categories.length === 0) {
      throw new Error(`Failed to get categories: ${JSON.stringify(catData)}`);
    }
    categoryId = catData.categories[0]._id;
    console.log(`✅ Retrieved categories. Using Category ID: ${categoryId} (${catData.categories[0].categoryName})`);

    // ─────────────── TEST 5: Get Products ───────────────
    console.log('\n🔍 Test 5: Get Products');
    const prodRes = await fetch(`${API_URL}/products`);
    const prodData = await prodRes.json();
    if (prodRes.status !== 200 || !prodData.success || prodData.products.length === 0) {
      throw new Error(`Failed to get products: ${JSON.stringify(prodData)}`);
    }
    const product = prodData.products[0];
    productId = product._id;
    const testSize = product.sizes[0] || 'M';
    const testColor = product.colors[0] || 'Black';
    console.log(`✅ Retrieved products. Using Product ID: ${productId} (${product.productName})`);
    console.log(`👉 Selected size: ${testSize}, color: ${testColor}`);

    // ─────────────── TEST 6: Add to Cart ───────────────
    console.log('\n🔍 Test 6: Add to Cart');
    const cartAddRes = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        productId,
        quantity: 2,
        size: testSize,
        color: testColor
      })
    });
    const cartAddData = await cartAddRes.json();
    if (cartAddRes.status !== 200 || !cartAddData.success) {
      throw new Error(`Failed to add to cart: ${JSON.stringify(cartAddData)}`);
    }
    cartItemId = cartAddData.cart.items[0]._id;
    console.log('✅ Added product to cart. Cart Item ID:', cartItemId);

    // ─────────────── TEST 7: Get Cart ───────────────
    console.log('\n🔍 Test 7: Get Cart');
    const getCartRes = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const getCartData = await getCartRes.json();
    if (getCartRes.status !== 200 || !getCartData.success) {
      throw new Error(`Failed to get cart: ${JSON.stringify(getCartData)}`);
    }
    console.log(`✅ Retrieved cart. Items count: ${getCartData.totalItems}, Total price: ${getCartData.totalPrice}`);

    // ─────────────── TEST 8: Get UPI QR Code ───────────────
    console.log('\n🔍 Test 8: Get UPI QR Code');
    const qrRes = await fetch(`${API_URL}/payment/qr`);
    const qrData = await qrRes.json();
    if (qrRes.status !== 200 || !qrData.success || !qrData.qrCodeImage) {
      throw new Error(`Failed to get QR code: ${JSON.stringify(qrData)}`);
    }
    console.log('✅ QR Code generated successfully. UPI ID:', qrData.upiId);

    // ─────────────── TEST 9: Create Order ───────────────
    console.log('\n🔍 Test 9: Create Order');
    const orderRes = await fetch(`${API_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        shippingAddress: {
          street: '456 Test Lane',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '600001',
          country: 'India'
        }
      })
    });
    const orderData = await orderRes.json();
    if (orderRes.status !== 201 || !orderData.success) {
      throw new Error(`Order placement failed: ${JSON.stringify(orderData)}`);
    }
    orderId = orderData.order._id;
    orderNumber = orderData.order.orderNumber;
    console.log(`✅ Order placed successfully. Order ID: ${orderId}, Order Number: ${orderNumber}`);

    // ─────────────── TEST 10: Upload Payment Proof ───────────────
    console.log('\n🔍 Test 10: Upload Payment Proof Screenshot');
    // Create a dummy image file for multipart upload
    const dummyFilePath = path.join(__dirname, 'uploads', 'dummy_proof.png');
    if (!fs.existsSync(path.dirname(dummyFilePath))) {
      fs.mkdirSync(path.dirname(dummyFilePath), { recursive: true });
    }
    fs.writeFileSync(dummyFilePath, 'dummy-png-data-placeholder');

    const formData = new FormData();
    formData.append('orderId', orderId);
    
    // Read local file as a Blob/File format using native Node capabilities
    const fileBuffer = fs.readFileSync(dummyFilePath);
    const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('paymentProof', fileBlob, 'dummy_proof.png');

    const uploadRes = await fetch(`${API_URL}/payment/upload-proof`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: formData
    });
    const uploadData = await uploadRes.json();

    // Cleanup dummy file
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }

    if (uploadRes.status !== 200 || !uploadData.success) {
      throw new Error(`Failed to upload payment proof: ${JSON.stringify(uploadData)}`);
    }
    console.log('✅ Payment proof screenshot uploaded. Path:', uploadData.paymentProof);

    // ─────────────── TEST 11: Admin View Orders ───────────────
    console.log('\n🔍 Test 11: Admin View Orders');
    const adminOrdersRes = await fetch(`${API_URL}/admin/orders?paymentStatus=Pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminOrdersData = await adminOrdersRes.json();
    if (adminOrdersRes.status !== 200 || !adminOrdersData.success) {
      throw new Error(`Admin failed to get orders: ${JSON.stringify(adminOrdersData)}`);
    }
    const foundOrder = adminOrdersData.orders.find(o => o._id === orderId);
    if (!foundOrder) {
      throw new Error(`Created order not found in admin list.`);
    }
    console.log('✅ Admin verified order is in list. Current payment status:', foundOrder.paymentStatus);

    // ─────────────── TEST 12: Admin Approve Payment ───────────────
    console.log('\n🔍 Test 12: Admin Approve Payment');
    const approveRes = await fetch(`${API_URL}/admin/payment/approve/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        remarks: 'Payment verified. Approved E2E test.'
      })
    });
    const approveData = await approveRes.json();
    if (approveRes.status !== 200 || !approveData.success) {
      throw new Error(`Failed to approve payment: ${JSON.stringify(approveData)}`);
    }
    console.log('✅ Admin approved payment. Order status is now:', approveData.order.orderStatus);

    // ─────────────── TEST 13: Admin Change Status to Processing ───────────────
    console.log('\n🔍 Test 13: Change Status to Processing');
    const statusProcRes = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ orderStatus: 'Processing' })
    });
    const statusProcData = await statusProcRes.json();
    if (statusProcRes.status !== 200 || !statusProcData.success) {
      throw new Error(`Failed to update status to Processing: ${JSON.stringify(statusProcData)}`);
    }
    console.log('✅ Order status updated to:', statusProcData.order.orderStatus);

    // ─────────────── TEST 14: Admin Change Status to Shipped ───────────────
    console.log('\n🔍 Test 14: Change Status to Shipped');
    const statusShipRes = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ orderStatus: 'Shipped' })
    });
    const statusShipData = await statusShipRes.json();
    if (statusShipRes.status !== 200 || !statusShipData.success) {
      throw new Error(`Failed to update status to Shipped: ${JSON.stringify(statusShipData)}`);
    }
    console.log('✅ Order status updated to:', statusShipData.order.orderStatus);

    // ─────────────── TEST 15: Admin Change Status to Delivered ───────────────
    console.log('\n🔍 Test 15: Change Status to Delivered');
    const statusDelivRes = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ orderStatus: 'Delivered' })
    });
    const statusDelivData = await statusDelivRes.json();
    if (statusDelivRes.status !== 200 || !statusDelivData.success) {
      throw new Error(`Failed to update status to Delivered: ${JSON.stringify(statusDelivData)}`);
    }
    console.log('✅ Order status updated to:', statusDelivData.order.orderStatus);

    // ─────────────── TEST 16: User Track Orders ───────────────
    console.log('\n🔍 Test 16: User Track Orders');
    const trackRes = await fetch(`${API_URL}/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const trackData = await trackRes.json();
    if (trackRes.status !== 200 || !trackData.success) {
      throw new Error(`User failed to track orders: ${JSON.stringify(trackData)}`);
    }
    const trackedOrder = trackData.orders.find(o => o._id === orderId);
    if (!trackedOrder || trackedOrder.orderStatus !== 'Delivered') {
      throw new Error(`Order status mismatch or order not found: ${JSON.stringify(trackedOrder)}`);
    }
    console.log('✅ User verified order status is indeed:', trackedOrder.orderStatus);

    // ─────────────── TEST 17: Admin Dashboard Stats ───────────────
    console.log('\n🔍 Test 17: Admin Dashboard Stats');
    const dashRes = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dashData = await dashRes.json();
    if (dashRes.status !== 200 || !dashData.success) {
      throw new Error(`Admin failed to get dashboard: ${JSON.stringify(dashData)}`);
    }
    console.log('✅ Admin dashboard retrieved successfully.');
    console.log('📈 Dashboard Revenue registered:', dashData.dashboard.revenue);
    console.log('📈 Dashboard Total Orders:', dashData.dashboard.totalOrders);

    console.log('\n🎉 ALL 17 END-TO-END TESTS PASSED SUCCESSFULLY! 🎉\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ E2E Verification failed with error:', error.message);
    process.exit(1);
  }
}

runTests();
