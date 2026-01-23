import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    shortDescription: {
        type: String,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    brand: {
        type: String,
        default: ''
    },
    images: [{
        url: String,
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    variants: [{
        name: String, // e.g., "500g", "1kg", "1L"
        sku: {
            type: String,
            unique: true,
            sparse: true
        },
        price: {
            type: Number,
            required: true
        },
        comparePrice: {
            type: Number, // Original price for showing discount
            default: null
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        lowStockThreshold: {
            type: Number,
            default: 10
        },
        barcode: String,
        weight: Number,
        unit: String // e.g., "kg", "g", "L", "ml", "pieces"
    }],
    // For products without variants
    price: {
        type: Number,
        default: null
    },
    comparePrice: {
        type: Number,
        default: null
    },
    stock: {
        type: Number,
        default: null
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    barcode: String,
    weight: Number,
    unit: String,
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isBestseller: {
        type: Boolean,
        default: false
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },
    discount: {
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage'
        },
        value: {
            type: Number,
            default: 0
        }
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    nutritionalInfo: {
        calories: Number,
        protein: String,
        carbs: String,
        fat: String,
        fiber: String,
        servingSize: String
    },
    ingredients: [String],
    allergens: [String],
    storageInstructions: String,
    expiryDate: Date,
    manufacturingDate: Date,
    countryOfOrigin: String,
    manufacturer: String,
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create slug from name before saving
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function () {
    if (this.variants && this.variants.length > 0) {
        return this.variants.some(v => v.stock > 0);
    }
    return this.stock > 0;
});

// Virtual for low stock warning
productSchema.virtual('lowStock').get(function () {
    if (this.variants && this.variants.length > 0) {
        return this.variants.some(v => v.stock > 0 && v.stock <= v.lowStockThreshold);
    }
    return this.stock > 0 && this.stock <= 10;
});

// Indexes for better query performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
