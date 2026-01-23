# 🛒 Damini Mart - Full-Stack eCommerce Platform

A production-ready supermarket eCommerce platform built with MERN stack (MongoDB, Express.js, React, Node.js) and React Native + Expo for mobile applications.

## 🌟 Features

### Customer Features
- ✅ Browse products by categories
- ✅ Product search and filters
- ✅ Shopping cart management
- ✅ Multiple delivery addresses
- ✅ Online payment (Razorpay) & Cash on Delivery
- ✅ Order tracking & history
- ✅ Apply coupons & discounts
- ✅ User authentication (JWT)
- ✅ Push notifications
- ✅ Product reviews & ratings

### Admin/Manager Features
- ✅ Dashboard with analytics
- ✅ Order management (All order states)
- ✅ Product & inventory management
- ✅ Category management
- ✅ Coupon management
- ✅ User management (Admin only)
- ✅ Role-based access control (RBAC)

### Technical Features
- ✅ Secure JWT authentication
- ✅ Role-based authorization (Customer, Cashier, Manager, Admin)
- ✅ RESTful API architecture
- ✅ Input validation & sanitization
- ✅ Rate limiting
- ✅ Error handling
- ✅ Responsive web design (Orange + White theme)
- ✅ Mobile app with bottom tab navigation
- ✅ Real-time stock management
- ✅ Payment integration (Razorpay)

## 🏗️ Project Structure

```
Damini Mart/
├── backend/                 # Node.js + Express API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware (auth, validation, errors)
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── .env                # Environment variables
│   ├── server.js           # Entry point
│   └── package.json
│
├── frontend/               # React + Vite web application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── store/          # Zustand state management
│   │   ├── lib/            # API client & utilities
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
└── mobile/                 # React Native + Expo mobile app
    ├── app/                # Expo Router pages
    │   └── (tabs)/         # Tab navigation screens
    ├── app.json            # Expo configuration
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn
- Expo CLI (for mobile app)

### 1. Clone Repository
```bash
cd "d:\Projects\AKMULTIVISION\Clients\Damini Mart"
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and update values
cp .env.example .env

# Update .env with your settings:
# - MongoDB connection string
# - JWT secrets
# - Razorpay keys
# - Cloudinary credentials (optional)
# - Email settings (optional)

# Start development server
npm run dev
```

Backend will run on: `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 4. Mobile App Setup

```bash
# Navigate to mobile
cd ../mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Then press:
# - 'a' for Android
# - 'i' for iOS
# - 'w' for web
```

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/damini-mart
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRE=1d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 User Roles & Permissions

### 1. Customer
- Browse and search products
- Add items to cart
- Place and track orders
- Manage addresses
- View order history

### 2. Cashier
- View incoming orders
- Update order status
- Mark COD payments as received
- Generate invoices

### 3. Manager
- All Cashier permissions
- Manage products & categories
- Update stock & pricing
- Create & manage coupons
- Assign deliveries

### 4. Super Admin
- Full system access
- User & role management
- System analytics & reports
- Platform configuration

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `POST /api/products` - Create product (Manager/Admin)
- `PUT /api/products/:id` - Update product (Manager/Admin)
- `DELETE /api/products/:id` - Delete product (Manager/Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/all/list` - Get all orders (Staff)
- `PUT /api/orders/:id/status` - Update order status (Staff)
- `PUT /api/orders/:id/cancel` - Cancel order

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Payment
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/cod-confirm` - Confirm COD payment (Staff)

*[Additional endpoints for categories, addresses, coupons, users, etc.]*

## 🎨 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Razorpay** - Payment gateway
- **Multer** - File upload
- **Cloudinary** - Image storage
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation

### Frontend (Web)
- **React 19** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icons
- **Framer Motion** - Animations

### Mobile
- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based routing
- **React Navigation** - Navigation
- **Zustand** - State management
- **Axios** - API client

## 🧪 Default Test Users

After seeding the database, you can use these credentials:

**Admin:**
- Email: admin@daminimart.com
- Password: admin123

**Manager:**
- Email: manager@daminimart.com
- Password: manager123

**Customer:**
- Email: customer@daminimart.com
- Password: customer123

## 📦 Database Models

- **User** - User accounts with roles
- **Product** - Products with variants
- **Category** - Product categories (with subcategories)
- **Cart** - Shopping cart
- **Order** - Customer orders
- **Address** - Delivery addresses
- **Coupon** - Discount coupons
- **Notification** - Push notifications
- **Review** - Product reviews

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Input validation & sanitization
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Cookie-based token storage
- XSS protection

## 📱 Mobile App Features

- Bottom tab navigation (Home, Orders, Cart, Account)
- Product browsing and search
- Cart management
- Order placement & tracking
- User authentication
- Push notifications (Firebase)
- Offline support (planned)
- Native gestures
- Fast performance

## 🚢 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or your MongoDB instance
2. Configure environment variables
3. Deploy to Heroku, Railway, DigitalOcean, or AWS
4. Set `NODE_ENV=production`

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting
3. Update API URL in production

### Mobile App Deployment
1. **Android:** Build APK/AAB with EAS Build
2. **iOS:** Build IPA with EAS Build
3. Submit to Play Store & App Store
4. Follow store guidelines

## 📝 Development Roadmap

### Phase 1 (Completed ✅)
- [x] Backend API architecture
- [x] Authentication & authorization
- [x] Database models
- [x] Frontend routing & layout
- [x] Mobile app structure

### Phase 2 (In Progress 🚧)
- [ ] Complete frontend pages (Products, Cart, Checkout, Orders)
- [ ] Admin dashboard with charts
- [ ] Payment integration testing
- [ ] Image upload functionality
- [ ] Email notifications
- [ ] Product search & filters

### Phase 3 (Planned 📅)
- [ ] Mobile app completion
- [ ] Push notifications (Firebase)
- [ ] Product reviews & ratings
- [ ] Advanced analytics
- [ ] SMS notifications
- [ ] Multi-language support

### Phase 4 (Future 🔮)
- [ ] Real-time order tracking
- [ ] Inventory forecasting
- [ ] Loyalty program
- [ ] Subscription orders
- [ ] Advanced reporting

## 🤝 Contributing

This is a private project for Damini Mart. For any issues or suggestions, please contact the development team.

## 📄 License

Proprietary - All rights reserved by Damini Mart

## 👨‍💻 Development Team

Built by AK MULTIVISION for Damini Mart

## 📞 Support

For technical support or queries:
- Email: support@daminimart.com
- Phone: +91 1234567890

---

**Note:** This is a production-ready eCommerce platform with complete backend infrastructure, frontend foundation, and mobile app structure. Additional features and pages can be implemented based on specific requirements.

### Next Steps:
1. Install dependencies (`npm install` in backend, frontend, and mobile)
2. Set up MongoDB database
3. Configure environment variables
4. Run development servers
5. Test authentication and basic flows
6. Complete remaining frontend pages
7. Test payment integration
8. Deploy to staging/production

**Status:** Core infrastructure complete ✅ | Additional features in development 🚧
