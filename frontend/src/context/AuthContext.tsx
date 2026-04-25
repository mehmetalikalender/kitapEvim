// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

// Backend'deki rollerin aynısı
export enum UserRole {
    SUPERADMIN = 'SUPERADMIN',
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER',
}

// Kullanıcı Objesi Tipi
interface User {
    id: string;
    email: string;
    firstName: string;
    role: UserRole;
}

// Context'in İçinde Neler Olacak?
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

// Boş bir context oluşturuyoruz
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Uygulamayı saracak olan Provider bileşeni
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Sayfa ilk yüklendiğinde (veya yenilendiğinde) localStorage'a bak
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Giriş yapıldığında çalışacak fonksiyon
    const login = (userData: User, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Çıkış yapıldığında çalışacak fonksiyon
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // Kolaylık sağlayacak yardımcı değişkenler
    const isAuthenticated = !!token;
    const isAdmin = user?.role === UserRole.SUPERADMIN || user?.role === UserRole.ADMIN;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

// İstediğimiz sayfadan auth verilerine ulaşmak için özel Hook'umuz
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth hooku sadece AuthProvider içinde kullanılabilir');
    }
    return context;
};