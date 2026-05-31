import React, { useState } from 'react'
import UnAuthorizedHeader from '../components/unauthorized/UnAuthorizedHeader'
import Loading from '../components/shared/Loading';
import LoginComponent from '../components/LoginComponent';
import { useNavigate } from 'react-router-dom';
import { postRequest } from '../lib/helpers';
import { toast } from 'react-toastify';

const InviteLogin = ({ setIsLogin, uidb64, token }) => {
    const navigate = useNavigate()
    const [loginData, setLoginData] = useState({
        email: "",
       password: "",
       is_login: true,
       
    })
    const [isLoading, setIsLoading] = useState(false);
    
    const handleChange = (e, fieldName) => {
        setLoginData({...loginData, [fieldName]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await postRequest(loginData, `organisations/accept-invite/${uidb64}`);
        if (response.success) {
            toast.success("Invitation accepted!");
            setLoginData({
                email: "",
                password: "",
            })
            navigate('/login');
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
                <img src="/assets/logo.png" className='h-[100px] w-auto' alt="" />
                <div className='flex flex-col items-center justify-center w-full'>
                    <h2 className='font-bold text-2xl'>Authenticate</h2>
                    <form className='flex flex-col w-[80%]' onSubmit={handleSubmit}>
                        
                       <LoginComponent loginData={loginData} handleChange={handleChange}/>
                        <div className='flex flex-col'>
                            <button className='h-[35px] bg-purple-600 border-purple-600 text-white font-bold rounded-md mt-2 mb-1 border-2 hover:bg-white hover:text-purple-600'>Authenticate</button>
                        </div>
                        <div className='text-sm'>
                            <span >Don't have an account? </span><span onClick={() => setIsLogin(false)} className='text-blue-900'>Register now</span>
                        </div>
                    </form>
                </div>
            </div>
            <div className='w-1/2 relative'>
                <img src="/assets/login_img.jpg" alt="Login image" className='h-full'/>
                <div className='absolute top-0 bottom-0 left-0 right-0 bg-purple-800 opacity-50'></div>
            </div>
      </div>
    </div></>
  )
}

export default InviteLogin
