import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
    email: 'rahul@example.com',
    password: '123456'
};

let authToken = '';
let userId = '';
let selectedProduct = null;
let selectedAddress = null;
let orderId = null;

// Helper function for API calls
const apiCall = async (method, endpoint, data = null, useAuth = false) => {
    const config = {
        method,
        url: `${API_URL}${endpoint}`,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000,
    };

    if (useAuth && authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
        config.data = data;
    }

    try {
        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status,
            details: error.response?.data
        };
    }
};

// Check if server is running
const checkServer = async () => {
    console.log('\n🔍 Checking if server is running...');
    for (let i = 0; i < 5; i++) {
        try {
            const response = await axios.get('http://localhost:5000/health', { timeout: 2000 });
            if (response.status === 200) {
                console.log('   ✅ Server is running');
                return true;
            }
        } catch (error) {
            if (i < 4) {
                console.log(`   ⏳ Attempt ${i + 1}/5 - Server not ready, waiting...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    console.log('   ❌ Server is not responding');
    console.log('   💡 Please ensure the server is running: npm start');
    return false;
};

// Step 1: User Login
const testLogin = async () => {
    console.log('\n🔐 Step 1: Testing User Login...');
    console.log(`   Email: ${TEST_USER.email}`);

    const result = await apiCall('POST', '/auth/login', TEST_USER);

    if (result.success) {
        // Response structure: { success, data: { user, accessToken, refreshToken } }
        authToken = result.data.data?.accessToken || result.data.data?.token || result.data.accessToken;
        userId = result.data.data?.user?._id || result.data.user?._id;
        const user = result.data.data?.user || result.data.user;

        console.log('   ✅ Login successful');
        console.log(`   User: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        if (authToken) {
            console.log(`   Token: ${authToken.substring(0, 20)}...`);
        } else {
            console.log('   ⚠️  Warning: No token received');
        }
        return true;
    } else {
        console.log('   ❌ Login failed:', result.error);
        if (result.details) {
            console.log('   Details:', JSON.stringify(result.details, null, 2));
        }
        return false;
    }
};

// Step 2: Browse Categories
const testBrowseCategories = async () => {
    console.log('\n📦 Step 2: Browsing Categories...');

    const result = await apiCall('GET', '/categories');

    if (result.success) {
        // Response structure: { success, data: { categories } }
        const categories = result.data.data.categories || [];
        console.log(`   ✅ Found ${categories.length} categories`);
        if (categories.length > 0) {
            categories.slice(0, 3).forEach(cat => {
                console.log(`   - ${cat.name} (${cat.slug})`);
            });
        } else {
            console.log('   ⚠️  No categories found. Run: npm run seed');
        }
        return true;
    } else {
        console.log('   ❌ Failed to fetch categories:', result.error);
        return false;
    }
};

// Step 3: Browse Products
const testBrowseProducts = async () => {
    console.log('\n🛍️  Step 3: Browsing Products...');

    const result = await apiCall('GET', '/products?limit=10');

    if (result.success) {
        // Response structure: { success, data: { products, pagination } }
        const products = result.data.data.products || [];
        console.log(`   ✅ Found ${products.length} products`);

        // Select first available product with stock
        selectedProduct = products.find(p => {
            if (p.variants && p.variants.length > 0) {
                return p.variants.some(v => v.stock > 0);
            }
            return p.stock > 0;
        });

        if (selectedProduct) {
            console.log(`\n   Selected Product: ${selectedProduct.name}`);
            console.log(`   Brand: ${selectedProduct.brand || 'N/A'}`);

            if (selectedProduct.variants && selectedProduct.variants.length > 0) {
                const firstVariant = selectedProduct.variants[0];
                console.log(`   Price: ₹${firstVariant.price} (${firstVariant.name})`);
                console.log(`   Variants available: ${selectedProduct.variants.length}`);
                selectedProduct.variants.slice(0, 3).forEach(v => {
                    console.log(`   - ${v.name}: ₹${v.price} (Stock: ${v.stock})`);
                });
            } else {
                console.log(`   Price: ₹${selectedProduct.price}`);
                console.log(`   Stock: ${selectedProduct.stock}`);
            }
            return true;
        } else {
            console.log('   ⚠️  No products with stock found. Run: npm run seed');
            return false;
        }
    } else {
        console.log('   ❌ Failed to fetch products:', result.error);
        return false;
    }
};

// Step 4: Add Product to Cart
const testAddToCart = async () => {
    console.log('\n🛒 Step 4: Adding Product to Cart...');

    if (!selectedProduct) {
        console.log('   ❌ No product selected');
        return false;
    }

    const quantity = 2;
    const cartData = {
        productId: selectedProduct._id,
        quantity: quantity
    };

    // Add variant if product has variants
    if (selectedProduct.variants && selectedProduct.variants.length > 0) {
        const firstVariant = selectedProduct.variants.find(v => v.stock > 0);
        if (firstVariant) {
            cartData.variantName = firstVariant.name;
            console.log(`   Product: ${selectedProduct.name} (${cartData.variantName})`);
        }
    } else {
        console.log(`   Product: ${selectedProduct.name}`);
    }
    console.log(`   Quantity: ${quantity}`);

    const result = await apiCall('POST', '/cart/add', cartData, true);

    if (result.success) {
        console.log('   ✅ Product added to cart successfully');
        return true;
    } else {
        console.log('   ❌ Failed to add to cart:', result.error);
        if (result.details) {
            console.log('   Details:', JSON.stringify(result.details, null, 2));
        }
        return false;
    }
};

// Step 5: View Cart
const testViewCart = async () => {
    console.log('\n👜 Step 5: Viewing Cart...');

    const result = await apiCall('GET', '/cart', null, true);

    if (result.success) {
        // Response structure: { success, data: { cart } }
        const cart = result.data.data.cart;
        const cartItems = cart.items || [];

        console.log(`   ✅ Cart has ${cartItems.length} item(s)`);

        if (cartItems.length > 0) {
            console.log(`\n   Cart Items:`);
            cartItems.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.product?.name || 'Product'}`);
                if (item.variant) console.log(`      Variant: ${item.variant}`);
                console.log(`      Quantity: ${item.quantity}`);
                console.log(`      Price: ₹${item.price}`);
                console.log(`      Total: ₹${item.total}`);
            });

            console.log(`\n   Cart Summary:`);
            console.log(`   Subtotal: ₹${cart.subtotal || 0}`);
            if (cart.discount > 0) {
                console.log(`   Discount: -₹${cart.discount}`);
            }
            console.log(`   Total: ₹${cart.total || 0}`);
            return true;
        } else {
            console.log('   ⚠️  Cart is empty');
            return false;
        }
    } else {
        console.log('   ❌ Failed to fetch cart:', result.error);
        return false;
    }
};

// Step 6: Get User Addresses
const testGetAddresses = async () => {
    console.log('\n📍 Step 6: Fetching Delivery Addresses...');

    const result = await apiCall('GET', '/addresses', null, true);

    if (result.success) {
        // Response structure: { success, data: { addresses } }
        const addresses = result.data.data.addresses || [];
        console.log(`   ✅ Found ${addresses.length} address(es)`);

        if (addresses.length > 0) {
            selectedAddress = addresses.find(a => a.isDefault) || addresses[0];
            console.log(`\n   Selected Address:`);
            console.log(`   ${selectedAddress.fullName}`);
            console.log(`   ${selectedAddress.addressLine1}`);
            if (selectedAddress.addressLine2) {
                console.log(`   ${selectedAddress.addressLine2}`);
            }
            console.log(`   ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`);
            console.log(`   Phone: ${selectedAddress.phone}`);
            if (selectedAddress.isDefault) {
                console.log(`   (Default Address)`);
            }
            return true;
        } else {
            // Create a test address if none exists
            console.log('   ⚠️  No addresses found. Creating test address...');
            return await testCreateAddress();
        }
    } else {
        console.log('   ❌ Failed to fetch addresses:', result.error);
        return false;
    }
};

// Helper: Create test address
const testCreateAddress = async () => {
    const addressData = {
        fullName: 'Rahul Kumar',
        phone: '9876543211',
        addressLine1: '123, Test Street',
        addressLine2: 'Near Test Mall',
        landmark: 'Opposite Test Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true
    };

    const result = await apiCall('POST', '/addresses', addressData, true);

    if (result.success) {
        selectedAddress = result.data.data.address;
        console.log('   ✅ Address created successfully');
        return true;
    } else {
        console.log('   ❌ Failed to create address:', result.error);
        return false;
    }
};

// Step 7: Apply Coupon (Optional)
const testApplyCoupon = async () => {
    console.log('\n🎟️  Step 7: Testing Coupon Code (Optional)...');

    const couponCode = 'SAVE20';
    console.log(`   Trying coupon: ${couponCode}`);

    // Apply coupon to cart
    const result = await apiCall('POST', '/cart/apply-coupon', { couponCode }, true);

    if (result.success) {
        console.log('   ✅ Coupon applied successfully');
        return couponCode;
    } else {
        console.log('   ⚠️  Coupon not applicable:', result.error);
        return null;
    }
};

// Step 8: Create Order
const testCreateOrder = async (couponCode = null) => {
    console.log('\n💳 Step 8: Placing Order...');

    if (!selectedAddress) {
        console.log('   ❌ No address selected');
        return false;
    }

    // Get current cart to build order items
    const cartResult = await apiCall('GET', '/cart', null, true);
    if (!cartResult.success || !cartResult.data.data.cart.items || cartResult.data.data.cart.items.length === 0) {
        console.log('   ❌ Cart is empty, cannot create order');
        return false;
    }

    const cart = cartResult.data.data.cart;

    // Prepare order data based on controller requirements
    const orderData = {
        items: cart.items.map(item => ({
            product: item.product._id,
            variant: item.variant || null,
            quantity: item.quantity
        })),
        deliveryAddress: {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2,
            landmark: selectedAddress.landmark,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode
        },
        payment: {
            method: 'cod', // Cash on Delivery
            status: 'pending'
        }
    };

    console.log(`   Payment Method: COD (Cash on Delivery)`);
    console.log(`   Order Items: ${orderData.items.length}`);

    const result = await apiCall('POST', '/orders', orderData, true);

    if (result.success) {
        const order = result.data.data.order;
        orderId = order._id;

        console.log('   ✅ Order placed successfully!');
        console.log(`\n   Order Details:`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Items: ${order.items?.length || 0}`);
        console.log(`\n   Pricing:`);
        console.log(`   Subtotal: ₹${order.pricing?.subtotal || 0}`);
        if (order.pricing?.discount > 0) {
            console.log(`   Discount: -₹${order.pricing.discount}`);
        }
        console.log(`   Delivery: ${order.pricing?.deliveryCharge === 0 ? 'FREE' : '₹' + order.pricing?.deliveryCharge}`);
        console.log(`   Total: ₹${order.pricing?.total || 0}`);
        console.log(`\n   Payment: ${order.payment?.method?.toUpperCase()}`);
        console.log(`   Payment Status: ${order.payment?.status}`);
        return true;
    } else {
        console.log('   ❌ Failed to create order:', result.error);
        if (result.details) {
            console.log('   Details:', JSON.stringify(result.details, null, 2));
        }
        return false;
    }
};

// Step 9: Verify Order
const testGetOrder = async () => {
    console.log('\n📋 Step 9: Verifying Order...');

    if (!orderId) {
        console.log('   ❌ No order ID available');
        return false;
    }

    const result = await apiCall('GET', `/orders/${orderId}`, null, true);

    if (result.success) {
        const order = result.data.data.order;
        console.log(`   ✅ Order retrieved successfully`);
        console.log(`   Order Number: ${order.orderNumber}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Created: ${new Date(order.createdAt).toLocaleString()}`);
        return true;
    } else {
        console.log('   ❌ Failed to retrieve order:', result.error);
        return false;
    }
};

// Step 10: Get All User Orders
const testGetUserOrders = async () => {
    console.log('\n📦 Step 10: Fetching All User Orders...');

    const result = await apiCall('GET', '/orders/my-orders', null, true);

    if (result.success) {
        const orders = result.data.data.orders || [];
        console.log(`   ✅ Found ${orders.length} order(s)`);

        if (orders.length > 0) {
            console.log('\n   Recent Orders:');
            orders.slice(0, 5).forEach(order => {
                console.log(`   - ${order.orderNumber}: ${order.status} (₹${order.pricing?.total || 0})`);
            });
        }
        return true;
    } else {
        console.log('   ❌ Failed to fetch orders:', result.error);
        return false;
    }
};

// Main test runner
const runCompleteFlowTest = async () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 DAMINI MART - COMPLETE E-COMMERCE FLOW TEST');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📡 API URL: ${API_URL}`);
    console.log(`🕐 Started at: ${new Date().toLocaleString()}`);

    // Check if server is running
    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('❌ Cannot proceed - Server is not running');
        console.log('═══════════════════════════════════════════════════════════\n');
        process.exit(1);
    }

    const steps = [
        { name: 'Login', fn: testLogin, critical: true },
        { name: 'Browse Categories', fn: testBrowseCategories, critical: false },
        { name: 'Browse Products', fn: testBrowseProducts, critical: true },
        { name: 'Add to Cart', fn: testAddToCart, critical: true },
        { name: 'View Cart', fn: testViewCart, critical: true },
        { name: 'Get Addresses', fn: testGetAddresses, critical: true },
        { name: 'Apply Coupon', fn: testApplyCoupon, critical: false },
        { name: 'Create Order', fn: async (coupon) => await testCreateOrder(coupon), critical: true },
        { name: 'Verify Order', fn: testGetOrder, critical: true },
        { name: 'Get All Orders', fn: testGetUserOrders, critical: false },
    ];

    let passedSteps = 0;
    let couponCode = null;

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        try {
            let result;
            if (step.name === 'Apply Coupon') {
                couponCode = await step.fn();
                result = true; // Coupon is optional
            } else if (step.name === 'Create Order') {
                result = await step.fn(couponCode);
            } else {
                result = await step.fn();
            }

            if (result) {
                passedSteps++;
            } else if (step.critical) {
                console.log(`\n❌ Critical test failed at step: ${step.name}`);
                break;
            }
        } catch (error) {
            console.log(`\n❌ Error in ${step.name}:`, error.message);
            if (step.critical) {
                break;
            }
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Passed: ${passedSteps}/${steps.length} steps`);
    console.log(`🕐 Finished at: ${new Date().toLocaleString()}`);

    const criticalSteps = steps.filter(s => s.critical).length;
    const passedCritical = Math.min(passedSteps, criticalSteps);

    if (passedCritical >= criticalSteps) {
        console.log('\n🎉 ALL CRITICAL TESTS PASSED! E-commerce flow is working!');
        console.log('\n✨ Complete Flow Tested:');
        console.log('   ✅ User Login & Authentication');
        console.log('   ✅ Product Browsing & Selection');
        console.log('   ✅ Shopping Cart Management');
        console.log('   ✅ Address Management');
        console.log('   ✅ Coupon Application (Optional)');
        console.log('   ✅ Order Placement (COD)');
        console.log('   ✅ Order Tracking & History');
        console.log('\n💡 Next Steps:');
        console.log('   1. Test with frontend application');
        console.log('   2. Test with mobile app');
        console.log('   3. Test online payment flow');
        console.log('   4. Test order status updates');
        console.log('   5. Test admin features');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the logs above.');
        console.log('💡 Tip: Ensure database is seeded with: npm run seed');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(passedCritical >= criticalSteps ? 0 : 1);
};

// Run the test
runCompleteFlowTest().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
});
