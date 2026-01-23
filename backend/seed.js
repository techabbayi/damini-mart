import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Database connection
import connectDB from './config/db.js';

// Import models
import User from './models/User.model.js';
import Category from './models/Category.model.js';
import Product from './models/Product.model.js';
import Address from './models/Address.model.js';
import Order from './models/Order.model.js';
import Coupon from './models/Coupon.model.js';

dotenv.config();

// Seed Users
const seedUsers = async () => {
    try {
        const hashedPassword = await bcrypt.hash('123456', 10);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@daminimart.com',
                password: hashedPassword,
                phone: '9876543210',
                role: 'admin',
                isVerified: true,
            },
            {
                name: 'Rahul Kumar',
                email: 'rahul@example.com',
                password: hashedPassword,
                phone: '9876543211',
                role: 'customer',
                isVerified: true,
            },
            {
                name: 'Priya Sharma',
                email: 'priya@example.com',
                password: hashedPassword,
                phone: '9876543212',
                role: 'customer',
                isVerified: true,
            },
            {
                name: 'Amit Patel',
                email: 'amit@example.com',
                password: hashedPassword,
                phone: '9876543213',
                role: 'customer',
                isVerified: true,
            },
            {
                name: 'Sneha Reddy',
                email: 'sneha@example.com',
                password: hashedPassword,
                phone: '9876543214',
                role: 'customer',
                isVerified: true,
            },
        ];

        const createdUsers = await User.insertMany(users);
        console.log(`✅ ${createdUsers.length} users created`);
        return createdUsers;
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        return [];
    }
};

// Seed Categories
const seedCategories = async () => {
    try {
        const categories = [
            {
                name: 'Groceries',
                slug: 'groceries',
                description: 'Daily grocery items',
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
                isActive: true,
            },
            {
                name: 'Fruits & Vegetables',
                slug: 'fruits-vegetables',
                description: 'Fresh fruits and vegetables',
                image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400',
                isActive: true,
            },
            {
                name: 'Dairy Products',
                slug: 'dairy-products',
                description: 'Milk, butter, cheese and more',
                image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
                isActive: true,
            },
            {
                name: 'Snacks & Beverages',
                slug: 'snacks-beverages',
                description: 'Snacks, drinks and beverages',
                image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
                isActive: true,
            },
            {
                name: 'Personal Care',
                slug: 'personal-care',
                description: 'Personal hygiene and care products',
                image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
                isActive: true,
            },
            {
                name: 'Household',
                slug: 'household',
                description: 'Cleaning and household items',
                image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400',
                isActive: true,
            },
        ];

        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ ${createdCategories.length} categories created`);
        return createdCategories;
    } catch (error) {
        console.error('❌ Error seeding categories:', error.message);
        return [];
    }
};

// Seed Products with proper image format
const seedProducts = async (categories) => {
    try {
        const products = [
            // Groceries
            {
                name: 'Tata Salt',
                slug: 'tata-salt-1kg',
                description: 'Iodized salt for daily cooking needs. Contains essential iodine for health.',
                shortDescription: 'Premium quality iodized salt',
                category: categories[0]._id,
                brand: 'Tata',
                images: [{ url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400', alt: 'Tata Salt', isPrimary: true }],
                variants: [
                    { name: '500g', sku: 'SALT-500G', price: 10, comparePrice: 12, stock: 300, unit: 'g' },
                    { name: '1kg', sku: 'SALT-1KG', price: 18, comparePrice: 20, stock: 500, unit: 'kg' },
                    { name: '5kg', sku: 'SALT-5KG', price: 85, comparePrice: 100, stock: 200, unit: 'kg' },
                ],
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Fortune Sunflower Oil',
                slug: 'fortune-sunflower-oil-1l',
                description: 'Pure and healthy sunflower cooking oil. Light and easily digestible.',
                shortDescription: 'Light and healthy cooking oil',
                category: categories[0]._id,
                brand: 'Fortune',
                images: [{ url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', alt: 'Fortune Sunflower Oil', isPrimary: true }],
                variants: [
                    { name: '500ml', sku: 'OIL-500ML', price: 95, comparePrice: 105, stock: 200, unit: 'ml' },
                    { name: '1L', sku: 'OIL-1L', price: 165, comparePrice: 180, stock: 300, unit: 'L' },
                    { name: '5L', sku: 'OIL-5L', price: 800, comparePrice: 900, stock: 100, unit: 'L' },
                ],
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'India Gate Basmati Rice',
                slug: 'india-gate-basmati-rice-5kg',
                description: 'Premium quality long grain basmati rice with natural aroma.',
                shortDescription: 'Long grain aromatic rice',
                category: categories[0]._id,
                brand: 'India Gate',
                images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', alt: 'Basmati Rice', isPrimary: true }],
                variants: [
                    { name: '1kg', sku: 'RICE-1KG', price: 95, comparePrice: 110, stock: 250, unit: 'kg' },
                    { name: '5kg', sku: 'RICE-5KG', price: 420, comparePrice: 450, stock: 200, unit: 'kg' },
                    { name: '10kg', sku: 'RICE-10KG', price: 800, comparePrice: 900, stock: 100, unit: 'kg' },
                ],
                isActive: true,
                isFeatured: true,
            },

            // Fruits & Vegetables
            {
                name: 'Fresh Apples',
                slug: 'fresh-apples-1kg',
                description: 'Crisp and juicy Kashmir apples. Rich in fiber and vitamins.',
                shortDescription: 'Premium quality apples',
                category: categories[1]._id,
                brand: 'Fresh Harvest',
                price: 160,
                comparePrice: 180,
                stock: 100,
                images: [{ url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', alt: 'Fresh Apples', isPrimary: true }],
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Fresh Bananas',
                slug: 'fresh-bananas-1dozen',
                description: 'Ripe and sweet bananas. Rich in potassium and energy.',
                shortDescription: 'Rich in potassium',
                category: categories[1]._id,
                brand: 'Fresh Harvest',
                price: 55,
                comparePrice: 60,
                stock: 150,
                images: [{ url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', alt: 'Fresh Bananas', isPrimary: true }],
                isActive: true,
            },
            {
                name: 'Fresh Tomatoes',
                slug: 'fresh-tomatoes-1kg',
                description: 'Locally grown fresh tomatoes. Perfect for cooking and salads.',
                shortDescription: 'Farm fresh tomatoes',
                category: categories[1]._id,
                brand: 'Fresh Harvest',
                price: 35,
                comparePrice: 40,
                stock: 200,
                images: [{ url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', alt: 'Fresh Tomatoes', isPrimary: true }],
                isActive: true,
            },

            // Dairy Products
            {
                name: 'Amul Milk',
                slug: 'amul-milk-500ml',
                description: 'Fresh full cream milk. Pure and nutritious.',
                shortDescription: 'Pure and nutritious milk',
                category: categories[2]._id,
                brand: 'Amul',
                images: [{ url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', alt: 'Amul Milk', isPrimary: true }],
                variants: [
                    { name: '500ml', sku: 'MILK-500ML', price: 26, comparePrice: 28, stock: 400, unit: 'ml' },
                    { name: '1L', sku: 'MILK-1L', price: 50, comparePrice: 54, stock: 300, unit: 'L' },
                ],
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Amul Butter',
                slug: 'amul-butter-100g',
                description: 'Rich and creamy butter made from pure milk fat.',
                shortDescription: 'Made from pure milk fat',
                category: categories[2]._id,
                brand: 'Amul',
                images: [{ url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', alt: 'Amul Butter', isPrimary: true }],
                variants: [
                    { name: '100g', sku: 'BUTTER-100G', price: 52, comparePrice: 55, stock: 250, unit: 'g' },
                    { name: '500g', sku: 'BUTTER-500G', price: 240, comparePrice: 260, stock: 150, unit: 'g' },
                ],
                isActive: true,
            },

            // Snacks & Beverages
            {
                name: 'Lays Chips',
                slug: 'lays-chips-50g',
                description: 'Crispy potato chips with classic salted flavor.',
                shortDescription: 'Classic salted flavor',
                category: categories[3]._id,
                brand: 'Lays',
                images: [{ url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', alt: 'Lays Chips', isPrimary: true }],
                variants: [
                    { name: '25g', sku: 'CHIPS-25G', price: 10, comparePrice: 12, stock: 600, unit: 'g' },
                    { name: '50g', sku: 'CHIPS-50G', price: 18, comparePrice: 20, stock: 500, unit: 'g' },
                    { name: '100g', sku: 'CHIPS-100G', price: 35, comparePrice: 40, stock: 300, unit: 'g' },
                ],
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Coca Cola',
                slug: 'coca-cola-750ml',
                description: 'Refreshing carbonated soft drink with original taste.',
                shortDescription: 'Original taste',
                category: categories[3]._id,
                brand: 'Coca Cola',
                images: [{ url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', alt: 'Coca Cola', isPrimary: true }],
                variants: [
                    { name: '250ml', sku: 'COLA-250ML', price: 20, comparePrice: 22, stock: 500, unit: 'ml' },
                    { name: '750ml', sku: 'COLA-750ML', price: 38, comparePrice: 40, stock: 400, unit: 'ml' },
                    { name: '2L', sku: 'COLA-2L', price: 90, comparePrice: 100, stock: 200, unit: 'L' },
                ],
                isActive: true,
            },
            {
                name: 'Britannia Biscuits',
                slug: 'britannia-biscuits-200g',
                description: 'Delicious cream biscuits. Perfect tea-time snack.',
                shortDescription: 'Perfect tea-time snack',
                category: categories[3]._id,
                brand: 'Britannia',
                price: 28,
                comparePrice: 30,
                stock: 350,
                images: [{ url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', alt: 'Britannia Biscuits', isPrimary: true }],
                isActive: true,
            },

            // Personal Care
            {
                name: 'Colgate Toothpaste',
                slug: 'colgate-toothpaste-200g',
                description: 'Complete dental protection for strong teeth and fresh breath.',
                shortDescription: 'Strong teeth and fresh breath',
                category: categories[4]._id,
                brand: 'Colgate',
                images: [{ url: 'https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=400', alt: 'Colgate Toothpaste', isPrimary: true }],
                variants: [
                    { name: '100g', sku: 'PASTE-100G', price: 65, comparePrice: 70, stock: 400, unit: 'g' },
                    { name: '200g', sku: 'PASTE-200G', price: 110, comparePrice: 120, stock: 300, unit: 'g' },
                ],
                isActive: true,
                isFeatured: true,
            },
            {
                name: 'Dove Soap',
                slug: 'dove-soap-100g',
                description: 'Moisturizing beauty soap gentle on skin.',
                shortDescription: 'Gentle on skin',
                category: categories[4]._id,
                brand: 'Dove',
                images: [{ url: 'https://images.unsplash.com/photo-1585128393699-e6d03e1d0bfb?w=400', alt: 'Dove Soap', isPrimary: true }],
                variants: [
                    { name: '75g', sku: 'SOAP-75G', price: 40, comparePrice: 45, stock: 450, unit: 'g' },
                    { name: '100g', sku: 'SOAP-100G', price: 50, comparePrice: 55, stock: 400, unit: 'g' },
                    { name: '3x100g', sku: 'SOAP-3X100G', price: 140, comparePrice: 160, stock: 200, unit: 'g' },
                ],
                isActive: true,
            },

            // Household
            {
                name: 'Vim Dishwash Gel',
                slug: 'vim-dishwash-gel-500ml',
                description: 'Tough on grease, gentle on hands. Lemon fresh.',
                shortDescription: 'Lemon fresh',
                category: categories[5]._id,
                brand: 'Vim',
                images: [{ url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400', alt: 'Vim Dishwash Gel', isPrimary: true }],
                variants: [
                    { name: '250ml', sku: 'DISH-250ML', price: 50, comparePrice: 55, stock: 350, unit: 'ml' },
                    { name: '500ml', sku: 'DISH-500ML', price: 88, comparePrice: 95, stock: 300, unit: 'ml' },
                    { name: '750ml', sku: 'DISH-750ML', price: 125, comparePrice: 135, stock: 200, unit: 'ml' },
                ],
                isActive: true,
            },
            {
                name: 'Surf Excel Detergent',
                slug: 'surf-excel-detergent-1kg',
                description: 'Removes tough stains easily. Expert stain removal.',
                shortDescription: 'Expert stain removal',
                category: categories[5]._id,
                brand: 'Surf Excel',
                images: [{ url: 'https://images.unsplash.com/photo-1602876299242-e3604a50d8e2?w=400', alt: 'Surf Excel Detergent', isPrimary: true }],
                variants: [
                    { name: '500g', sku: 'DET-500G', price: 95, comparePrice: 105, stock: 300, unit: 'g' },
                    { name: '1kg', sku: 'DET-1KG', price: 165, comparePrice: 180, stock: 250, unit: 'kg' },
                    { name: '2kg', sku: 'DET-2KG', price: 310, comparePrice: 340, stock: 150, unit: 'kg' },
                ],
                isActive: true,
                isFeatured: true,
            },
        ];

        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} products created`);
        return createdProducts;
    } catch (error) {
        console.error('❌ Error seeding products:', error.message);
        return [];
    }
};

// Seed Addresses
const seedAddresses = async (users) => {
    try {
        const addresses = [];

        // Create 2-3 addresses for each customer (skip admin)
        for (let i = 1; i < users.length; i++) {
            const user = users[i];
            addresses.push(
                {
                    user: user._id,
                    fullName: user.name,
                    phone: user.phone,
                    addressLine1: `${Math.floor(Math.random() * 500) + 1}, Block ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}`,
                    addressLine2: 'Near City Center',
                    landmark: 'Opposite Park',
                    city: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune'][Math.floor(Math.random() * 5)],
                    state: ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Maharashtra'][Math.floor(Math.random() * 5)],
                    pincode: `${400000 + Math.floor(Math.random() * 100000)}`,
                    isDefault: true,
                },
                {
                    user: user._id,
                    fullName: user.name,
                    phone: user.phone,
                    addressLine1: `${Math.floor(Math.random() * 200) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
                    addressLine2: 'Main Road',
                    landmark: 'Near Metro Station',
                    city: ['Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur'][Math.floor(Math.random() * 4)],
                    state: ['Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan'][Math.floor(Math.random() * 4)],
                    pincode: `${600000 + Math.floor(Math.random() * 100000)}`,
                    isDefault: false,
                }
            );
        }

        const createdAddresses = await Address.insertMany(addresses);
        console.log(`✅ ${createdAddresses.length} addresses created`);
        return createdAddresses;
    } catch (error) {
        console.error('❌ Error seeding addresses:', error.message);
        return [];
    }
};

// Seed Coupons with corrected field names
const seedCoupons = async () => {
    try {
        const coupons = [
            {
                code: 'WELCOME100',
                description: 'Welcome offer for new users',
                discountType: 'fixed',
                discountValue: 100,
                minOrderValue: 500,
                maxDiscount: 100,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                usageLimit: 1000,
                usedCount: 50,
                isActive: true,
            },
            {
                code: 'SAVE20',
                description: 'Get 20% off on orders above 1000',
                discountType: 'percentage',
                discountValue: 20,
                minOrderValue: 1000,
                maxDiscount: 500,
                startDate: new Date(),
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
                usageLimit: 5000,
                usedCount: 320,
                isActive: true,
            },
            {
                code: 'FIRST50',
                description: 'First order discount',
                discountType: 'fixed',
                discountValue: 50,
                minOrderValue: 300,
                maxDiscount: 50,
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
                usageLimit: 10000,
                usedCount: 1250,
                isActive: true,
            },
            {
                code: 'MEGA25',
                description: 'Mega sale - 25% off',
                discountType: 'percentage',
                discountValue: 25,
                minOrderValue: 1500,
                maxDiscount: 750,
                startDate: new Date(),
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
                usageLimit: 2000,
                usedCount: 180,
                isActive: true,
            },
            {
                code: 'EXPIRED10',
                description: 'Expired coupon for testing',
                discountType: 'percentage',
                discountValue: 10,
                minOrderValue: 200,
                maxDiscount: 100,
                startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
                endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                usageLimit: 500,
                usedCount: 500,
                isActive: false,
            },
        ];

        const createdCoupons = await Coupon.insertMany(coupons);
        console.log(`✅ ${createdCoupons.length} coupons created`);
        return createdCoupons;
    } catch (error) {
        console.error('❌ Error seeding coupons:', error.message);
        return [];
    }
};

// Seed Orders
const seedOrders = async (users, products, addresses) => {
    try {
        if (products.length === 0) {
            console.log('⚠️  Skipping orders - no products available');
            return [];
        }

        const orderStatuses = ['placed', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
        const paymentMethods = ['cod', 'online'];

        const orders = [];
        let orderCounter = 1000;

        // Create orders for each customer
        for (let i = 1; i < users.length; i++) {
            const user = users[i];
            const userAddresses = addresses.filter(addr => addr.user.toString() === user._id.toString());

            if (userAddresses.length === 0) continue;

            // Create 3-5 orders per user
            const numOrders = Math.floor(Math.random() * 3) + 3;

            for (let j = 0; j < numOrders; j++) {
                const numItems = Math.floor(Math.random() * 3) + 1;
                const orderItems = [];
                let subtotal = 0;

                // Add random products to order
                for (let k = 0; k < numItems; k++) {
                    const randomProduct = products[Math.floor(Math.random() * products.length)];
                    const quantity = Math.floor(Math.random() * 3) + 1;

                    // Get price from variant or product
                    let price;
                    let variant = null;
                    if (randomProduct.variants && randomProduct.variants.length > 0) {
                        const randomVariant = randomProduct.variants[Math.floor(Math.random() * randomProduct.variants.length)];
                        price = randomVariant.price;
                        variant = randomVariant.name;
                    } else {
                        price = randomProduct.price || randomProduct.comparePrice || 0;
                    }

                    const total = price * quantity;
                    subtotal += total;

                    orderItems.push({
                        product: randomProduct._id,
                        name: randomProduct.name,
                        image: randomProduct.images[0]?.url || 'https://via.placeholder.com/100',
                        variant: variant,
                        quantity,
                        price,
                        total,
                    });
                }

                const deliveryCharge = subtotal >= 500 ? 0 : 40;
                const discount = Math.random() > 0.5 ? Math.floor(subtotal * 0.1) : 0;
                const total = subtotal + deliveryCharge - discount;

                const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
                const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
                const paymentStatus = status === 'cancelled' ? 'failed' :
                    paymentMethod === 'online' ? 'completed' : 'pending';

                // Create order date (random within last 30 days)
                const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

                const order = {
                    orderNumber: `DM${orderCounter++}`,
                    user: user._id,
                    items: orderItems,
                    deliveryAddress: userAddresses[0],
                    pricing: {
                        subtotal,
                        deliveryCharge,
                        discount,
                        total,
                    },
                    payment: {
                        method: paymentMethod,
                        status: paymentStatus,
                    },
                    status,
                    createdAt,
                    updatedAt: new Date(createdAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000),
                };

                // Add payment details for completed online payments
                if (paymentMethod === 'online' && paymentStatus === 'completed') {
                    order.payment.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
                    order.payment.razorpayPaymentId = `pay_${Date.now()}${Math.floor(Math.random() * 10000)}`;
                    order.payment.paidAt = createdAt;
                }

                orders.push(order);
            }
        }

        const createdOrders = await Order.insertMany(orders);
        console.log(`✅ ${createdOrders.length} orders created`);
        return createdOrders;
    } catch (error) {
        console.error('❌ Error seeding orders:', error.message);
        return [];
    }
};

// Main seed function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Address.deleteMany({});
        await Order.deleteMany({});
        await Coupon.deleteMany({});
        console.log('✅ Data cleared\n');

        // Seed data in order
        const users = await seedUsers();
        console.log('');

        const categories = await seedCategories();
        console.log('');

        const products = await seedProducts(categories);
        console.log('');

        const addresses = await seedAddresses(users);
        console.log('');

        const coupons = await seedCoupons();
        console.log('');

        const orders = await seedOrders(users, products, addresses);
        console.log('');

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Products: ${products.length}`);
        console.log(`   Addresses: ${addresses.length}`);
        console.log(`   Coupons: ${coupons.length}`);
        console.log(`   Orders: ${orders.length}`);
        console.log('\n🔐 Test Credentials:');
        console.log('   Admin: admin@daminimart.com / 123456');
        console.log('   Customer 1: rahul@example.com / 123456');
        console.log('   Customer 2: priya@example.com / 123456');
        console.log('   Customer 3: amit@example.com / 123456');
        console.log('   Customer 4: sneha@example.com / 123456');
        console.log('\n🎯 Test the complete flow:');
        console.log('   1. Login with customer credentials');
        console.log('   2. Browse products and add to cart');
        console.log('   3. Apply coupon code (SAVE20, FIRST50)');
        console.log('   4. Proceed to checkout');
        console.log('   5. View orders and track delivery');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

// Run seeding
seedDatabase();
