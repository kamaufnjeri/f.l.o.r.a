import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import UnAuthorizedHeader from '../../components/unauthorized/UnAuthorizedHeader'
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import Loading from '../../components/shared/Loading';

const ForgotPassword = () => {
    const [forgotData, setForgotData] = useState({
        email: "",
    })
    const [isLoading, setIsLoading] = useState(false);
    
    const handleChange = (e, fieldName) => {
        setForgotData({...forgotData, [fieldName]: e.target.value});
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await postRequest(forgotData, 'auth/forgot-password');
        if (response.success) {
           if (response.data) {
                toast.success(response.data.message);
                setForgotData({
                    email: "",
                });
           }
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
        <div className='flex flex-row rounded-sm w-[800px] bg-white h-[60%]'>
            <div className='flex flex-col w-1/2 items-center justify-center'>
                <img src="/assets/logo.png" className='h-[100px] w-auto' alt="" />
                <div className='flex flex-col items-center justify-center w-full'>
                    <h2 className='font-bold text-2xl'>Forgot Password</h2>
                    <form className='flex flex-col w-[80%]' onSubmit={handleSubmit}>
                        
                        <div className='flex flex-col'>
                        <label htmlFor="email" className='font-bold'>Email Address</label>
                            <input
                             required
                             type="email" 
                             name="email"
                             value={forgotData.email}
                             onChange={(e) => handleChange(e, "email")}
                             className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800'/>
                        </div>
                       
                       
                        <div className='flex flex-col'>
                            <button className='h-[35px] bg-purple-600 border-purple-600 text-white font-bold rounded-md mt-2 mb-1 border-2 hover:bg-white hover:text-purple-600'>Send</button>
                        </div>
                        <div className='text-sm mb-2'>
                            <span >Go back to login? </span><Link to='/login' className='text-blue-900'>Login now</Link>
                        </div>
                    </form>
                </div>
            </div>
            <div className='w-1/2 relative'>
                <img src="/assets/forgot_img.jpg" alt="forgot image" className='h-full'/>
                <div className='absolute top-0 bottom-0 left-0 right-0 bg-purple-800 opacity-50'></div>
            </div>
      </div>
    </div></>
  )
}

export default ForgotPassword
