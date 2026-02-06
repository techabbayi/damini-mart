import AIService from '../utils/aiService.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';

// @desc    Get AI-powered product recommendations
// @route   GET /api/ai/recommendations
// @access  Private
export const getAIRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user's context
        const recentOrders = await Order.find({ user: userId })
            .sort('-createdAt')
            .limit(5)
            .populate('items.product');
            
        const context = {
            recentPurchases: recentOrders.map(order => 
                order.items.map(item => item.product)
            ).flat(),
        };
        
        // Get AI recommendations
        const aiRecommendations = await AIService.getRecommendations(userId, context);
        
        // Get actual product recommendations based on AI suggestions
        const products = await Product.find({ isActive: true })
            .limit(10)
            .sort('-popularity');
        
        res.status(200).json({
            success: true,
            data: {
                products,
                aiInsights: aiRecommendations,
                message: 'Personalized just for you!'
            }
        });
    } catch (error) {
        console.error('AI Recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting recommendations',
            error: error.message
        });
    }
};

// @desc    AI-powered smart search
// @route   GET /api/ai/search
// @access  Public
export const aiSmartSearch = async (req, res) => {
    try {
        const { q: query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        // Get AI search enhancements
        const aiSuggestions = await AIService.smartSearch(query);
        
        // Perform actual search
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ],
            isActive: true
        }).limit(20);
        
        res.status(200).json({
            success: true,
            data: {
                products,
                suggestions: aiSuggestions,
                query: query,
                count: products.length
            }
        });
    } catch (error) {
        console.error('Smart search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
};

// @desc    AI Chatbot response
// @route   POST /api/ai/chatbot
// @access  Private
export const aiChatbot = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }
        
        const response = await AIService.getChatbotResponse(message, context);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting chatbot response',
            error: error.message
        });
    }
};

// @desc    Generate AI product description
// @route   POST /api/ai/generate-description
// @access  Private/Admin
export const generateProductDescription = async (req, res) => {
    try {
        const { productId } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const description = await AIService.generateProductDescription(product);
        
        res.status(200).json({
            success: true,
            data: {
                description,
                productName: product.name
            }
        });
    } catch (error) {
        console.error('Generate description error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating description',
            error: error.message
        });
    }
};

// @desc    AI price optimization analysis
// @route   GET /api/ai/price-analysis/:productId
// @access  Private/Admin
export const analyzePricing = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        const analysis = await AIService.analyzePriceOptimization(product);
        
        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Price analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing pricing',
            error: error.message
        });
    }
};
