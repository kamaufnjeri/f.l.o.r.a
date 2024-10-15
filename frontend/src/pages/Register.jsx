import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import UnAuthorizedHeader from '../components/unauthorized/UnAuthorizedHeader'
import { postRequest, togglePasswordVisibility } from '../lib/helpers';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loading from '../components/shared/Loading';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [registerData, setRegisterData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
    })


    const showPasswordFunc = () => {
        togglePasswordVisibility(setShowPassword, showPassword);
    }

    const showConfirmPasswordFunc = () => {
        togglePasswordVisibility(setShowConfirmPassword, showConfirmPassword);
    }

    const handleChange = (e, fieldName) => {
        setRegisterData({...registerData, [fieldName]: e.target.value});
    }

    const handleSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        const response = await postRequest(registerData, 'auth/register');
        if (response.success) {
            toast.success("Registration successful! Check your email to verify");
            setRegisterData({
                first_name: "",
                last_name: "",
                email: "",
                phone_number: "",
                password: "",
                confirm_password: "",
            })
        }
        else {
            toast.error(response.error);
        }
        setIsLoading(false);
    }
  return (
    <>
       

    <UnAuthorizedHeader/>

    <div className='flex items-center justify-center unauthorized-height overflow-hidden absolute top-[60px] w-screen bg-purple-800'>
    {isLoading && <Loading/>}
        <div className='flex flex-row rounded-sm w-[800px] bg-white h-[97%]'>
            <div className='flex flex-col w-1/2 items-center justify-start h-full overflow-y-auto custom-scrollbar'>
                <img src="assets/logo.png" className='h-[100px] w-auto' alt="" />
                <div className='flex flex-col items-center justify-center w-full'>
                    <h2 className='font-bold text-2xl'>Register</h2>
                    <form className='flex flex-col w-[80%]' onSubmit={handleSubmit}>
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
                             className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800'/>
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
                            {showPassword ?  <FaEyeSlash className='hover:text-purple-800 absolute right-2 top-2 text-xl' onClick={showPasswordFunc}/>  : <FaEye onClick={showPasswordFunc} className='hover:text-purple-800 absolute right-2 top-2 text-xl'/>}
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
                            {showConfirmPassword ?  <FaEyeSlash className='hover:text-purple-800 absolute right-2 top-2 text-xl' onClick={showConfirmPasswordFunc}/>  : <FaEye onClick={showConfirmPasswordFunc} className='hover:text-purple-800 absolute right-2 top-2 text-xl'/>}
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            <button className='h-[35px] bg-purple-600 border-purple-600 text-white font-bold rounded-md mt-2 mb-1 border-2 hover:bg-white hover:text-purple-600'>Register</button>
                        </div>
                        <div className='text-sm mb-2'>
                            <span >Already have an account? </span><Link to='/login' className='text-blue-900'>Login now</Link>
                        </div>
                    </form>
                </div>
            </div>
            <div className='w-1/2 relative h-full'>
                <img src="assets/register_img.jpg" alt="Register image" className='h-full w-full'/>
                <div className='absolute top-0 bottom-0 left-0 right-0 bg-purple-800 opacity-50'></div>
            </div>
      </div>
    </div></>
  )
}

export default Register
