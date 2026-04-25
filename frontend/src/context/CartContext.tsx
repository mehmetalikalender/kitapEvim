import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface CartItem {
    bookId: string;
    title: string;
    price: number;
    quantity: number;
    coverImageUrl?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (bookId: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (newItem: CartItem) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.bookId === newItem.bookId);
            // Eğer kitap zaten sepette varsa, sadece miktarını (quantity) artır
            if (existingItem) {
                return prevItems.map((item) =>
                    item.bookId === newItem.bookId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Yoksa yeni kitap olarak sepete ekle
            return [...prevItems, { ...newItem, quantity: 1 }];
        });
    };

    const removeFromCart = (bookId: string) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.bookId !== bookId));
    };

    const clearCart = () => setCartItems([]);

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartTotal, getCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart hooku sadece CartProvider içinde kullanılabilir');
    }
    return context;
};