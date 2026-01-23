import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            Damini <span className="text-orange">Mart</span>
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Your trusted online supermarket for fresh groceries, daily essentials, and more. Quality products delivered to your doorstep.
                        </p>
                        <div className="flex space-x-4 mt-4">
                            <a href="#" className="text-gray-400 hover:text-orange transition">
                                <FiFacebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange transition">
                                <FiInstagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange transition">
                                <FiTwitter size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/products" className="text-gray-400 hover:text-orange transition">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-gray-400 hover:text-orange transition">
                                    My Orders
                                </Link>
                            </li>
                            <li>
                                <Link to="/account" className="text-gray-400 hover:text-orange transition">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-gray-400 hover:text-orange transition">
                                    Cart
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="text-gray-400 hover:text-orange transition">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-orange transition">
                                    Track Order
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-orange transition">
                                    Returns & Refunds
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-orange transition">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center text-gray-400">
                                <FiPhone className="mr-2" />
                                <span>+91 1234567890</span>
                            </li>
                            <li className="flex items-center text-gray-400">
                                <FiMail className="mr-2" />
                                <span>support@daminimart.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; 2026 Damini Mart. All rights reserved.</p>
                    <div className="mt-2 space-x-4">
                        <a href="#" className="hover:text-orange transition">
                            Privacy Policy
                        </a>
                        <span>|</span>
                        <a href="#" className="hover:text-orange transition">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
