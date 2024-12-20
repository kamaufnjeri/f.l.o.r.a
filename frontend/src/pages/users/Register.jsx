import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import UnAuthorizedHeader from '../../components/unauthorized/UnAuthorizedHeader'
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import Loading from '../../components/shared/Loading';
import RegisterComponent from '../../components/RegisterComponent';

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [registerData, setRegisterData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
    })


   

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
                <img src="/assets/logo.png" className='h-[100px] w-auto' alt="" />
                <div className='flex flex-col items-center justify-center w-full'>
                    <h2 className='font-bold text-2xl'>Register</h2>
                    <form className='flex flex-col w-[80%]' onSubmit={handleSubmit}>
                        <RegisterComponent handleChange={handleChange} registerData={registerData}/>
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
                <img src="/assets/register_img.jpg" alt="Register image" className='h-full w-full'/>
                <div className='absolute top-0 bottom-0 left-0 right-0 bg-purple-800 opacity-50'></div>
            </div>
      </div>
    </div></>
  )
}

export default Register
