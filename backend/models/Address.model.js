import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    addressLine1: {
        type: String,
        required: [true, 'Address line 1 is required']
    },
    addressLine2: {
        type: String,
        default: ''
    },
    landmark: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    },
    country: {
        type: String,
        default: 'India'
    },
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    coordinates: {
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        }
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure only one default address per user
addressSchema.pre('save', async function (next) {
    if (this.isDefault) {
        await mongoose.model('Address').updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

// Index for faster queries
addressSchema.index({ user: 1 });
addressSchema.index({ isDefault: 1 });

const Address = mongoose.model('Address', addressSchema);

export default Address;
