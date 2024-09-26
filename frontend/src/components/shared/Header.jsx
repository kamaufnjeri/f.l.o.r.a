import React, { useState } from 'react'
import { FaBars, FaPlus } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { Link } from 'react-router-dom';


const Header = ({ setOpenAddAccountModal, setOpenAddItemModal }) => {
    const [isVisible, setIsVisible] = useState(false);
    const openDropDown = () => {
        setIsVisible(!isVisible);
    }
    const showModal = (setOpenModal) => {
      setOpenModal(true);
    };
  return (
    <div className='font-bold h-15 text-gray-800 absolute top-0 right-0 left-[15rem] flex flex-row m-1 items-center justify-between  border-b-2 p-1 border-b-gray-300'>
      <div className='flex flex-row gap-2 items-center hover:text-purple-700'>
        <img src="/assets/apple.jpg" alt="Apple Logo" className='w-14 h-14 rounded-full'/>
        <span>Apple Inc.</span>
      </div>
      <button onClick={() => showModal(setOpenAddItemModal)} className='flex flex-row items-center gap-2 border-2 border-gray-800 rounded-md p-2 hover:border-purple-600 hover:text-purple-700'>
        <FaPlus/>
        Add Item
      </button>
      <button onClick={() => showModal(setOpenAddAccountModal)} className='flex flex-row items-center gap-2 border-2 border-gray-800 rounded-md p-2 hover:border-purple-600 hover:text-purple-700'>
        <FaPlus/>
        Add Account
      </button>
      <div className='relative'>
        <button 
            onClick={() => openDropDown()}
            className='rounded-full w-15 h-15 hover:ring-4 ring-neutral-400 flex items-center justify-center'
        >
            <img src="/assets/flora.png" alt="" className='w-14 h-14 rounded-full cursor-pointer'/>
        </button>
        
            <div className={`absolute right-1 top-16 rounded-sm w-[10rem] p-1
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${
                isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                <Link to='/profile' className='hover:bg-neutral-200 w-full p-1 rounded-sm'>Your profile</Link>
                <Link to='/settings' className='hover:bg-neutral-200 w-full p-1 rounded-sm'>Settings</Link>
                <button className='hover:bg-neutral-200 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                    <MdLogout/>
                    <span>Logout</span>
                </button>
            </div>
    
      </div>
    </div>
  )
}

export default Header
