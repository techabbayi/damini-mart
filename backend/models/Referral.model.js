import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Each user has only one referral code
    },
    referralCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
    },
    referredUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        reward: {
            type: Number,
            default: 50, // ₹50 reward for each referral
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'expired'],
            default: 'pending',
        },
    }],
    totalEarnings: {
        type: Number,
        default: 0,
    },
    totalReferrals: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Generate a unique referral code
referralSchema.statics.generateCode = async function(userId) {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Generate code from name + random string
    const name = user.name.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${name}${random}`;
};

// Method to add a referral
referralSchema.methods.addReferral = async function(referredUserId, reward = 50) {
    this.referredUsers.push({
        user: referredUserId,
        reward,
        status: 'completed',
    });
    this.totalReferrals += 1;
    this.totalEarnings += reward;
    await this.save();
    return this;
};

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
