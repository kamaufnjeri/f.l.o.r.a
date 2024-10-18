import React, { useState } from 'react'
import { togglePasswordVisibility } from '../lib/helpers';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LoginComponent = ({ loginData, handleChange }) => {
    const [showPassword, setShowPassword] = useState(false);

    const showPasswordFunc = () => {
        togglePasswordVisibility(setShowPassword, showPassword);
    }
  return (
    <>
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
                       
    </>
  )
}

export default LoginComponent
