import React, { useState } from 'react'
import { togglePasswordVisibility } from '../lib/helpers';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterComponent = ({ registerData, handleChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const showPasswordFunc = () => {
        togglePasswordVisibility(setShowPassword, showPassword);
    }

    const showConfirmPasswordFunc = () => {
        togglePasswordVisibility(setShowConfirmPassword, showConfirmPassword);
    }
   

   
      
    return (
        <>
            <div className='flex flex-col'>
                <label htmlFor="first_name" className='font-bold'>First Name</label>
                <input required
                    type="text"
                    name="first_name"
                    value={registerData.first_name}
                    onChange={(e) => handleChange(e, "first_name")}
                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800'
                />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="last_name" className='font-bold'>Last Name</label>
                <input required
                    type="text"
                    name="last_name"
                    value={registerData.last_name}
                    onChange={(e) => handleChange(e, "last_name")}
                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800' />
            </div>
            <div className='flex flex-col'>
                <label htmlFor="email" className='font-bold'>Email Address</label>
                <input required
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={(e) => handleChange(e, "email")}
                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800' />
            </div>

            <div className='flex flex-col'>
                <label htmlFor="phone_number" className='font-bold'>Phone Number</label>
                <input required
                    type="text"
                    name="phone_number"
                    value={registerData.phone_number}
                    onChange={(e) => handleChange(e, "phone_number")}
                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800' />
            </div>

            <div className='flex flex-col'>
                <label htmlFor="password" className='font-bold'>Password</label>
                <div className='w-full h-[35px] relative'>
                    <input required
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={registerData.password}
                        onChange={(e) => handleChange(e, "password")}
                        className='rounded-md w-full outline-none border-2 border-gray-300 h-full pl-1 focus:border-gray-800' />
                    {showPassword ? <FaEyeSlash className='hover:text-purple-800 absolute right-2 top-2 text-xl' onClick={showPasswordFunc} /> : <FaEye onClick={showPasswordFunc} className='hover:text-purple-800 absolute right-2 top-2 text-xl' />}
                </div>

            </div>
            <div className='flex flex-col'>
                <label htmlFor="confirm_password" className='font-bold'>Confirm Password</label>
                <div className='w-full h-[35px] relative'>
                    <input required
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        value={registerData.confirm_password}
                        onChange={(e) => handleChange(e, "confirm_password")}
                        className='rounded-md w-full outline-none border-2 border-gray-300 h-full pl-1 focus:border-gray-800' />
                    {showConfirmPassword ? <FaEyeSlash className='hover:text-purple-800 absolute right-2 top-2 text-xl' onClick={showConfirmPasswordFunc} /> : <FaEye onClick={showConfirmPasswordFunc} className='hover:text-purple-800 absolute right-2 top-2 text-xl' />}
                </div>
            </div>
        </>
    )
}

export default RegisterComponent
