import React, { useEffect, useState } from 'react'
import Loading from './shared/Loading';
import {Navigate} from 'react-router-dom';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode'
import { ref } from 'yup';

const ProtectedRoute = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    
    useEffect(() => {
        auth().catch(() => setIsAuthorized(false))
    }, [

    ])

    const refreshTokenFunc = async (refreshToken) => {
        try {
            const response = await api.post("/auth/token/refresh/", {
                refresh: refreshToken
            })
            if (response.status === 200) {
                localStorage.setItem('accessToken', response.data?.access)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
            }

        } catch (error) {
            console.log(error)
            setIsAuthorized(false)
        }

    }
    

    const auth = async () => {
        const token = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken');

        if (!token && !refreshToken) {
            setIsAuthorized(false);
            return;
        } else {
            if (token) {
                const decoded = jwtDecode(token)
                const now = Date.now() / 1000;
    
                if (decoded.exp < now ) {
                    await refreshTokenFunc(refreshToken)
                } else {
                    setIsAuthorized(true)
            }
            } else if (refreshToken) {
                await refreshTokenFunc(refreshToken);
            } else {
                setIsAuthorized(false)
            }
           
        }
        
    }


    if (isAuthorized === null) {
        return <Loading/>
    }
  return isAuthorized ? children : <Navigate to='/login'/>
}

export default ProtectedRoute
