import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Cart = ({ items, removeFromCart, total }) => {
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout', { 
            state: { 
                cartItems: items,
                subtotal: total,
                bookingFee: 100,
                serviceFee: 49,
                total: total + 149
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white shadow-lg rounded-lg p-4 w-full sticky top-24"
        >
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Your Cart</h2>
                <span className="text-sm text-gray-500">{items.length} items</span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-between items-start p-2 bg-gray-50 rounded-lg text-sm"
                    >
                        <div className="flex-1 pr-2">
                            <h3 className="font-medium text-gray-800 text-sm">{item.type}</h3>
                            <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">₹{item.price.replace('₹', '')}</span>
                            <button
                                onClick={() => removeFromCart(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {items.length > 0 ? (
                <>
                    <div className="border-t border-gray-200 mt-3 pt-3">
                        <div className="flex justify-between items-center mb-2 text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{total}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2 text-sm">
                            <span className="text-gray-600">Booking Fee</span>
                            <span className="font-medium">₹100</span>
                        </div>
                        <div className="flex justify-between items-center mb-3 text-sm">
                            <span className="text-gray-600">Service Fee</span>
                            <span className="font-medium">₹49</span>
                        </div>
                        <div className="flex justify-between items-center font-medium">
                            <span>Total</span>
                            <span>₹{total + 149}</span>
                        </div>
                    </div>
                    <button
                        className="w-full mt-4 bg-yellow-400 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors text-sm"
                        onClick={handleCheckout}
                    >
                        Proceed to Checkout
                    </button>
                </>
            ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                    Your cart is empty
                </div>
            )}
        </motion.div>
    );
};

export default Cart;
