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
                      setCurrentOrg(response.data?.current_organisation)
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
            setCurrentOrg(response.data?.user?.current_organisation)
            setLoginData({
               email: "",
               password: "",
            });
            
            if (!response.data.user.current_organisation || !response.data.user.current_organisation.id) {
                navigate('/organisation-create')

            } else {
                navigate(`/dashboard/${response.data?.user?.current_organisation.id}`)
            }
           
        }
        else {
            toast
            .error(response.error);
        }
    };

    const changeCurrentOrg = async (orgId) => {
        const response = await postRequest({
            org_id: orgId
        }, 'organisations/change-current-organisation');
        if (response.success) {
            toast.success("Organisation changed successfully!");
            
            setCurrentOrg(response.data)
           
            navigate(`/dashboard/${response.data?.id}`)
        }
        else {
            toast
            .error(response.error);
        }   
    }

    const logout = async () => {
       const refreshToken = localStorage.getItem('refreshToken');
        const response = await postRequest({
            "refresh": refreshToken
        }, 'auth/logout');
        if (response.success) {
            localStorage.clear();
            toast.success("Logout successful!");
            setUser(null);
            navigate("/")
        }
        else {
            toast
            .error(response.error);
        }
       
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    const value = {
        user,
        currentOrg,
        setUser,
        setCurrentOrg,
        loading,
        login,
        logout,
        isAuthenticated,
        changeCurrentOrg,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
