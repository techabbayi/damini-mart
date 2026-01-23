import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variant: {
            type: String,
            default: null // Variant name if product has variants
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: {
            type: Number,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    subtotal: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    appliedCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function (next) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    // Apply discount if coupon is applied
    // (discount calculation will be done by controller)

    // Calculate final total
    this.total = this.subtotal - this.discount;

    next();
});

// Method to add item to cart
cartSchema.methods.addItem = function (productId, variantName, quantity, price) {
    const existingItemIndex = this.items.findIndex(item =>
        item.product.toString() === productId.toString() &&
        item.variant === variantName
    );

    if (existingItemIndex > -1) {
        // Update quantity if item already exists
        this.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        this.items.push({
            product: productId,
            variant: variantName,
            quantity,
            price
        });
    }
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId, variantName = null) {
    this.items = this.items.filter(item =>
        !(item.product.toString() === productId.toString() && item.variant === variantName)
    );
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, variantName, quantity) {
    const item = this.items.find(item =>
        item.product.toString() === productId.toString() &&
        item.variant === variantName
    );

    if (item) {
        item.quantity = quantity;
    }
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
    this.items = [];
    this.discount = 0;
    this.appliedCoupon = null;
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
