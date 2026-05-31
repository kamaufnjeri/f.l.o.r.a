import React from 'react'
import { FaPlus } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdLogout } from 'react-icons/md';


const UnAuthorizedHeader = () => {
  const { isAuthenticated, currentOrg, logout } = useAuth();
  const isAuthenticatedUser = isAuthenticated();

  return (
    <div className={`font-bold h-[60px] text-gray-800 absolute top-0 right-0 z-6 flex flex-row px-4 items-center justify-between  border-b-2 p-1 border-b-gray-300 left-0`}>
      <Link to='/'>
        <img src="/assets/logo.png" className='h-[60px] w-auto' alt="Logo image" />
      </Link>
      <Link to="/home" className='flex flex-row items-center gap-2 hover:text-purple-700'>
        Home
      </Link>

      <Link to="/about-us" className='flex flex-row items-center gap-2 hover:text-purple-700'>
        About Us
      </Link>
      <Link to="/contact-us" className='flex flex-row items-center gap-2 hover:text-purple-700'>
        Contact Us
      </Link>{isAuthenticatedUser ? <>
        <Link to={`/dashboard/${currentOrg.id}`} className='flex flex-row items-center gap-2 hover:text-purple-700'>
          Dashboard
        </Link>
        <span className='flex flex-row items-center gap-2 border-2 border-gray-800 rounded-md p-2 hover:border-purple-600 hover:text-purple-700' onClick={logout}>
          Logout
          <MdLogout className='text-xl' />
        </span>
      </> : <><Link to="/login" className='flex flex-row items-center gap-2 hover:text-purple-700'>
        Login
      </Link>
        <Link to="/register" className='flex flex-row items-center gap-2 border-2 border-gray-800 rounded-md p-2 hover:border-purple-600 hover:text-purple-700'>
          Register
          <FaPlus />
        </Link></>}



    </div>)
}

export default UnAuthorizedHeader;
