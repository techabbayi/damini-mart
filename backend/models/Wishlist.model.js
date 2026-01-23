import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
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
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

// Remove duplicate products
wishlistSchema.pre('save', function (next) {
    const uniqueItems = [];
    const seenProducts = new Set();

    for (const item of this.items) {
        const productId = item.product.toString();
        if (!seenProducts.has(productId)) {
            seenProducts.add(productId);
            uniqueItems.push(item);
        }
    }

    this.items = uniqueItems;
    next();
});

export default mongoose.model('Wishlist', wishlistSchema);
