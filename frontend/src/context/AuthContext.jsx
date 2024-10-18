import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api'; // Ensure this points to your API library
import { toast } from 'react-toastify';
import { postRequest } from '../lib/helpers';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [currentOrg, setCurrentOrg] = useState(null)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()


    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await api.get('auth/me/');
                    if (response.status == 200) {
                      setUser(response.data)
                      setCurrentOrg(response.data?.current_org)
                    } else {
                      throw new Error();
                    }
                  }
                  catch (error) {
                    console.error(`Error fetching user`);
                    navigate("/login")
                  }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = async (setLoginData, loginData) => {
        localStorage.clear()
        const response = await postRequest(loginData, 'auth/login');
        if (response.success) {
           
            toast.success("Login successful!");
            localStorage.setItem('refreshToken', response?.data?.refresh);
            localStorage.setItem('accessToken', response?.data?.access)
            setUser(response.data?.user)
            setCurrentOrg(response.data?.user?.current_org)
            setLoginData({
               email: "",
               password: "",
            });
            navigate("/dashboard")
        }
        else {
            toast
            .error(response.error);
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    const value = {
        user,
        currentOrg,
        setCurrentOrg,
        loading,
        login,
        logout,
        isAuthenticated,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
