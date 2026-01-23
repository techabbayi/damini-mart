// Test Wishlist API Endpoints
// Run with: node backend/test-wishlist.js

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testProductId = '';

async function login() {
    console.log('🔐 Logging in...');
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'customer@test.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        if (data.success) {
            authToken = data.data.token;
            console.log('✅ Login successful');
            return true;
        }
        console.log('❌ Login failed:', data.message);
        return false;
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return false;
    }
}

async function getTestProduct() {
    console.log('\n📦 Getting test product...');
    try {
        const response = await fetch(`${API_URL}/products?limit=1`);
        const data = await response.json();

        if (data.success && data.data?.products?.length > 0) {
            testProductId = data.data.products[0]._id;
            console.log('✅ Got test product:', testProductId);
            return true;
        }
        console.log('❌ No products found');
        return false;
    } catch (error) {
        console.error('❌ Get product error:', error.message);
        return false;
    }
}

async function testGetWishlist() {
    console.log('\n📋 Testing GET /wishlist...');
    try {
        const response = await fetch(`${API_URL}/wishlist`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        if (data.success) {
            console.log('✅ Get wishlist successful');
            console.log('   Items:', data.data.wishlist.length);
            return true;
        }
        console.log('❌ Get wishlist failed:', data.message);
        return false;
    } catch (error) {
        console.error('❌ Get wishlist error:', error.message);
        return false;
    }
}

async function testAddToWishlist() {
    console.log('\n➕ Testing POST /wishlist...');
    try {
        const response = await fetch(`${API_URL}/wishlist`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId: testProductId })
        });
        const data = await response.json();

        if (data.success) {
            console.log('✅ Add to wishlist successful');
            console.log('   Total items:', data.data.wishlist.length);
            return true;
        }
        console.log('❌ Add to wishlist failed:', data.message);
        return false;
    } catch (error) {
        console.error('❌ Add to wishlist error:', error.message);
        return false;
    }
}

async function testCheckWishlist() {
    console.log('\n🔍 Testing GET /wishlist/check/:productId...');
    try {
        const response = await fetch(`${API_URL}/wishlist/check/${testProductId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        if (data.success) {
            console.log('✅ Check wishlist successful');
            console.log('   Is in wishlist:', data.data.isInWishlist);
            return true;
        }
        console.log('❌ Check wishlist failed:', data.message);
        return false;
    } catch (error) {
        console.error('❌ Check wishlist error:', error.message);
        return false;
    }
}

async function testRemoveFromWishlist() {
    console.log('\n🗑️ Testing DELETE /wishlist/:productId...');
    try {
        const response = await fetch(`${API_URL}/wishlist/${testProductId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        if (data.success) {
            console.log('✅ Remove from wishlist successful');
            console.log('   Remaining items:', data.data.wishlist.length);
            return true;
        }
        console.log('❌ Remove from wishlist failed:', data.message);
        return false;
    } catch (error) {
        console.error('❌ Remove from wishlist error:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Starting Wishlist API Tests\n');
    console.log('='.repeat(50));

    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Tests aborted: Login failed');
        return;
    }

    // Step 2: Get test product
    const productSuccess = await getTestProduct();
    if (!productSuccess) {
        console.log('\n❌ Tests aborted: No product available');
        return;
    }

    // Step 3: Get empty wishlist
    await testGetWishlist();

    // Step 4: Add to wishlist
    await testAddToWishlist();

    // Step 5: Check if in wishlist
    await testCheckWishlist();

    // Step 6: Get wishlist with item
    await testGetWishlist();

    // Step 7: Remove from wishlist
    await testRemoveFromWishlist();

    // Step 8: Verify removed
    await testCheckWishlist();

    console.log('\n' + '='.repeat(50));
    console.log('✅ All wishlist tests completed!\n');
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
