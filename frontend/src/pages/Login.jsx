import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import UnAuthorizedHeader from '../components/unauthorized/UnAuthorizedHeader'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { postRequest, togglePasswordVisibility } from '../lib/helpers';
import { toast } from 'react-toastify';
import Loading from '../components/shared/Loading';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loginData, setLoginData] = useState({
        email: "",
       password: ""
    })
    const [isLoading, setIsLoading] = useState(false);
    

    const showPasswordFunc = () => {
        togglePasswordVisibility(setShowPassword, showPassword);
    }

    const handleChange = (e, fieldName) => {
        setLoginData({...loginData, [fieldName]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await postRequest(loginData, 'auth/login');
        if (response.success) {
           
            toast.success("Login successful!");
            localStorage.setItem('refreshToken', response?.data?.refresh);
            localStorage.setItem('accessToken', response?.data?.access)
            setLoginData({
               email: "",
               password: "",
            });
        }
        else {
            toast.error(response.error);
        }
        setIsLoading(false);
    }
  return (
   <> <UnAuthorizedHeader/>
    <div className='flex items-center justify-center unauthorized-height w-screen bg-purple-800 absolute top-[60px]'>
        {isLoading && <Loading/>}
        <div className='flex flex-row rounded-sm w-[800px] bg-white'>
            <div className='flex flex-col w-1/2 items-center justify-center'>
                <img src="assets/logo.png" className='h-[100px] w-auto' alt="" />
                <div className='flex flex-col items-center justify-center w-full'>
                    <h2 className='font-bold text-2xl'>Login</h2>
                    <form className='flex flex-col w-[80%]' onSubmit={handleSubmit}>
                        
                        <div className='flex flex-col'>
                        <label htmlFor="email" className='font-bold'>Email Address</label>
                            <input
                             required
                             type="email" 
                             name="email"
                             value={loginData.email}
                             onChange={(e) => handleChange(e, "email")}
                             className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800'/>
                        </div>
                       
                        <div className='flex flex-col'>
                        <label htmlFor="password" className='font-bold'>Password</label>
                            <div className='w-full h-[35px] relative'>
                            <input 
                             required 
                             name="password"
                             value={loginData.password}
                             onChange={(e) => handleChange(e, "password")}
                             type={showPassword ? "text" : "password"} 
                             className='rounded-md w-full outline-none border-2 border-gray-300 h-full pl-1 focus:border-gray-800' />
                            {showPassword ?  <FaEyeSlash className='hover:text-purple-800 absolute right-2 top-2 text-xl' onClick={showPasswordFunc}/>  : <FaEye onClick={showPasswordFunc} className='hover:text-purple-800 absolute right-2 top-2 text-xl'/>}
                            </div>
                           
                            <Link to='/forgot-password' className='text-blue-900'>Forgot password?</Link>
                        </div>
                       
                        <div className='flex flex-col'>
                            <button className='h-[35px] bg-purple-600 border-purple-600 text-white font-bold rounded-md mt-2 mb-1 border-2 hover:bg-white hover:text-purple-600'>Login</button>
                        </div>
                        <div className='text-sm'>
                            <span >Don't have an account? </span><Link to='/register' className='text-blue-900'>Register now</Link>
                        </div>
                    </form>
                </div>
            </div>
            <div className='w-1/2 relative'>
                <img src="assets/login_img.jpg" alt="Login image" className='h-full'/>
                <div className='absolute top-0 bottom-0 left-0 right-0 bg-purple-800 opacity-50'></div>
            </div>
      </div>
    </div></>
  )
}

export default Login
