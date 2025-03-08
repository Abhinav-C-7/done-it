import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        // Load cart items from localStorage on initial render
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart items to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            // Check if item already exists
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                return prevItems; // Don't add duplicate items
            }
            return [...prevItems, item];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotal = () => {
        return parseFloat(cartItems.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            return total + price;
        }, 0).toFixed(2));
    };

    const getItemCount = () => {
        return cartItems.length;
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotal,
        getItemCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
