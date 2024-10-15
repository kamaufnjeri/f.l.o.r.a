import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import UnAuthorizedHeader from '../components/unauthorized/UnAuthorizedHeader';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { postRequest, togglePasswordVisibility } from '../lib/helpers';
import { toast } from 'react-toastify';
import Loading from '../components/shared/Loading';

import logo from '../../public/assets/logo.png';
import forgotImg from '../../public/assets/forgot_img.jpg';

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { uidb64, token } = useParams();
    const [resetData, setResetData] = useState({
        password: "",
        confirm_password: ""
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const showPasswordFunc = () => {
        togglePasswordVisibility(setShowPassword, showPassword);
    };

    const showConfirmPasswordFunc = () => {
        togglePasswordVisibility(setShowConfirmPassword, showConfirmPassword);
    };

    const handleChange = (e, fieldName) => {
        setResetData({...resetData, [fieldName]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await postRequest(resetData, `auth/reset-password/${uidb64}/${token}`);
        if (response.success) {
            toast.success("Password reset successfully!");
            setResetData({
                password: "",
                confirm_password: ""
            });
            navigate('/login');
           
        } else {
            toast.error(response.error);
        }
        setIsLoading(false);
    };

    return (
        <>
            <UnAuthorizedHeader />
            <div className='flex items-center justify-center unauthorized-height w-screen bg-purple-800 absolute top-[60px]'>
                {isLoading && <Loading />}
                <div className='flex flex-row rounded-sm w-[800px] bg-white h-[70%]'>
                    <div className='flex flex-col w-1/2 items-center justify-center'>
                        <img src={logo} className='h-[100px] w-auto' alt="Logo" />
                        <div className='flex flex-col items-center justify-center w-full'>
                            <h2 className='font-bold text-2xl'>Reset Password</h2>
                            <form className='flex flex-col w-[80%]' onSubmit={handleSubmit}>
                                <div className='flex flex-col'>
                                    <label htmlFor="password" className='font-bold'>Password</label>
                                    <div className='w-full h-[35px] relative'>
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={resetData.password}
                                            onChange={(e) => handleChange(e, "password")}
                                            className='rounded-md w-full outline-none border-2 border-gray-300 h-full pl-1 focus:border-gray-800'
                                        />
                                        {showPassword ? 
                                            <FaEyeSlash className='hover:text-purple-800 absolute right-2 top-2 text-xl' onClick={showPasswordFunc} /> : 
                                            <FaEye onClick={showPasswordFunc} className='hover:text-purple-800 absolute right-2 top-2 text-xl' />
                                        }
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <label htmlFor="confirm_password" className='font-bold'>Confirm Password</label>
                                    <div className='w-full h-[35px] relative'>
                                        <input
                                            required
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirm_password"
                                            value={resetData.confirm_password}
                                            onChange={(e) => handleChange(e, "confirm_password")}
                                            className='rounded-md w-full outline-none border-2 border-gray-300 h-full pl-1 focus:border-gray-800'
                                        />
                                        {showConfirmPassword ? 
                                            <FaEyeSlash className='hover:text-purple-800 absolute right-2 top-2 text-xl' onClick={showConfirmPasswordFunc} /> : 
                                            <FaEye onClick={showConfirmPasswordFunc} className='hover:text-purple-800 absolute right-2 top-2 text-xl' />
                                        }
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <button className='h-[35px] bg-purple-600 border-purple-600 text-white font-bold rounded-md mt-2 mb-1 border-2 hover:bg-white hover:text-purple-600'>Reset</button>
                                </div>
                                <div className='text-sm mb-2'>
                                    <span>Go back to login? </span><Link to='/login' className='text-blue-900'>Login now</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className='w-1/2 relative'>
                        <img src={forgotImg} alt="Reset image" className='h-full' />
                        <div className='absolute top-0 bottom-0 left-0 right-0 bg-purple-800 opacity-50'></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;
