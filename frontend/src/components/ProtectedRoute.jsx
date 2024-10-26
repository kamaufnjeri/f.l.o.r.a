import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './shared/Loading';

const ProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();

    if (loading) return <Loading />;
    
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
