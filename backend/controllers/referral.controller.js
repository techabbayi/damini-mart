import Referral from '../models/Referral.model.js';
import User from '../models/User.model.js';

// @desc    Get or create user's referral code
// @route   GET /api/referrals/my-code
// @access  Private
export const getMyReferralCode = async (req, res) => {
    try {
        let referral = await Referral.findOne({ user: req.user.id });
        
        if (!referral) {
            // Create new referral code for user
            const code = await Referral.generateCode(req.user.id);
            referral = await Referral.create({
                user: req.user.id,
                referralCode: code,
            });
        }
        
        // Populate referred users
        await referral.populate('referredUsers.user', 'name email');
        
        res.status(200).json({
            success: true,
            data: referral,
        });
    } catch (error) {
        console.error('Get referral code error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching referral code',
            error: error.message,
        });
    }
};

// @desc    Apply referral code during registration
// @route   POST /api/referrals/apply
// @access  Private
export const applyReferralCode = async (req, res) => {
    try {
        const { referralCode } = req.body;
        
        if (!referralCode) {
            return res.status(400).json({
                success: false,
                message: 'Referral code is required',
            });
        }
        
        // Find the referral
        const referral = await Referral.findOne({ 
            referralCode: referralCode.toUpperCase() 
        });
        
        if (!referral) {
            return res.status(404).json({
                success: false,
                message: 'Invalid referral code',
            });
        }
        
        // Check if user already used a referral code
        const existingReferral = await Referral.findOne({
            'referredUsers.user': req.user.id,
        });
        
        if (existingReferral) {
            return res.status(400).json({
                success: false,
                message: 'You have already used a referral code',
            });
        }
        
        // Check if user is trying to use their own code
        if (referral.user.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot use your own referral code',
            });
        }
        
        // Add referral
        await referral.addReferral(req.user.id);
        
        // Create referral code for the new user
        const newUserCode = await Referral.generateCode(req.user.id);
        await Referral.create({
            user: req.user.id,
            referralCode: newUserCode,
        });
        
        res.status(200).json({
            success: true,
            message: 'Referral code applied successfully! You both earned ₹50!',
            data: {
                reward: 50,
                yourCode: newUserCode,
            },
        });
    } catch (error) {
        console.error('Apply referral code error:', error);
        res.status(500).json({
            success: false,
            message: 'Error applying referral code',
            error: error.message,
        });
    }
};

// @desc    Get referral statistics
// @route   GET /api/referrals/stats
// @access  Private
export const getReferralStats = async (req, res) => {
    try {
        const referral = await Referral.findOne({ user: req.user.id })
            .populate('referredUsers.user', 'name email createdAt');
        
        if (!referral) {
            return res.status(404).json({
                success: false,
                message: 'No referral data found',
            });
        }
        
        const stats = {
            totalReferrals: referral.totalReferrals,
            totalEarnings: referral.totalEarnings,
            referralCode: referral.referralCode,
            pendingRewards: referral.referredUsers
                .filter(r => r.status === 'pending')
                .reduce((sum, r) => sum + r.reward, 0),
            completedRewards: referral.referredUsers
                .filter(r => r.status === 'completed')
                .reduce((sum, r) => sum + r.reward, 0),
            recentReferrals: referral.referredUsers
                .sort((a, b) => b.joinedAt - a.joinedAt)
                .slice(0, 5),
        };
        
        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching referral statistics',
            error: error.message,
        });
    }
};

// @desc    Get all referrals (Admin only)
// @route   GET /api/referrals/all
// @access  Private/Admin
export const getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find()
            .populate('user', 'name email')
            .populate('referredUsers.user', 'name email')
            .sort('-totalEarnings');
        
        res.status(200).json({
            success: true,
            count: referrals.length,
            data: referrals,
        });
    } catch (error) {
        console.error('Get all referrals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all referrals',
            error: error.message,
        });
    }
};
