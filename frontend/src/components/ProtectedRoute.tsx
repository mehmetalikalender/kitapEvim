// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean; // Bu sayfa sadece adminlere mi özel?
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const { isAuthenticated, isAdmin } = useAuth();

    // Adam hiç giriş yapmamışsa, login sayfasına postala
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Adam giriş yapmış ama sayfa admin sayfasıysa ve adam admin değilse, ana sayfaya yolla
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Her şey yolundaysa içeriği göster
    return <>{children}</>;
};

export default ProtectedRoute;