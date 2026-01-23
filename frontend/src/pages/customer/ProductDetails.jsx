import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';

export default function ProductDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCartStore();

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            const res = await api.get(`/products/slug/${slug}`);
            console.log('Product Details API Response:', res.data);
            // API returns {success: true, data: {product: {...}}}
            return res.data?.data?.product || res.data?.data;
        }
    });

    // Set selected variant when product loads
    useEffect(() => {
        if (product?.variants?.length > 0 && !selectedVariant) {
            console.log('Setting first variant:', product.variants[0]);
            setSelectedVariant(product.variants[0]);
        }
    }, [product, selectedVariant]);

    const handleAddToCart = async () => {
        await addToCart(
            product._id,
            selectedVariant?.name || null,
            quantity
        );
    };

    const handleBuyNow = async () => {
        await addToCart(
            product._id,
            selectedVariant?.name || null,
            quantity
        );
        navigate('/cart');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="bg-gray-200 h-96 mb-4 rounded"></div>
                    <div className="bg-gray-200 h-8 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold">Product not found</h2>
            </div>
        );
    }

    const currentPrice = selectedVariant?.price || product?.price || 0;
    const comparePrice = selectedVariant?.comparePrice || product?.comparePrice;
    const stock = selectedVariant?.stock ?? product?.stock ?? 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Product Images */}
                <div>
                    <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/500'}
                        alt={product.name}
                        className="w-full h-96 object-cover rounded-lg mb-4"
                    />
                    {product.images?.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.images.slice(1, 5).map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img.url}
                                    alt={`${product.name} ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                    {/* Rating */}
                    {product.ratings?.average > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        className={i < Math.round(product.ratings.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">
                                ({product.ratings.count} reviews)
                            </span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="mb-4">
                        <span className="text-3xl font-bold text-orange-600">₹{currentPrice}</span>
                        {comparePrice && comparePrice > currentPrice && (
                            <>
                                <span className="text-xl text-gray-400 line-through ml-2">₹{comparePrice}</span>
                                <span className="ml-2 text-green-600 font-medium">
                                    {Math.round(((comparePrice - currentPrice) / comparePrice) * 100)}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                        {stock > 0 ? (
                            <span className="text-green-600 font-medium">✓ In Stock ({stock} available)</span>
                        ) : (
                            <span className="text-red-600 font-medium">✗ Out of Stock</span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6">{product.description}</p>

                    {/* Variants */}
                    {product.variants?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Select Variant:</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((variant) => (
                                    <button
                                        key={variant._id}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-4 py-2 border rounded ${selectedVariant?._id === variant._id
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-300 hover:border-orange-300'
                                            }`}
                                    >
                                        {variant.name} - ₹{variant.price}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Quantity:</h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-1 border rounded"
                                disabled={stock === 0}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                max={stock}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 text-center border rounded py-1"
                                disabled={stock === 0}
                            />
                            <button
                                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                                className="px-3 py-1 border rounded"
                                disabled={stock === 0}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={stock === 0}
                            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                        >
                            <FiShoppingCart /> Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={stock === 0}
                            className="btn btn-primary flex-1"
                        >
                            Buy Now
                        </button>
                        <button className="btn border border-gray-300">
                            <FiHeart />
                        </button>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="card">
                <h2 className="text-2xl font-bold mb-4">Product Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {product.category && (
                        <div>
                            <span className="font-semibold">Category:</span>
                            <span className="ml-2">{product.category.name}</span>
                        </div>
                    )}
                    {product.brand && (
                        <div>
                            <span className="font-semibold">Brand:</span>
                            <span className="ml-2">{product.brand}</span>
                        </div>
                    )}
                    {selectedVariant?.weight && (
                        <div>
                            <span className="font-semibold">Weight:</span>
                            <span className="ml-2">{selectedVariant.weight} {selectedVariant.unit}</span>
                        </div>
                    )}
                    {selectedVariant?.sku && (
                        <div>
                            <span className="font-semibold">SKU:</span>
                            <span className="ml-2">{selectedVariant.sku}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
