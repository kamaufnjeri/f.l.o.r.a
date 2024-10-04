import React, { useRef, useState } from 'react';
import {sidebarIcons, sidebarIconsBottom} from '../../lib/constants';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa'; // Import the arrow icon
import { MdLogout } from "react-icons/md";
import { FaHome, FaTimes } from 'react-icons/fa';
import { FaUser, FaBars } from 'react-icons/fa'; // FontAwesome user icon
import { GoDotFill } from "react-icons/go";
import SideBarMainComponent from './SideBarMainComponent';


const SmallScreenBar = () => {
    
    const { pathname } = useLocation();
    
    const [navbar, setNavbar] = useState(false);
  

    const showNavbar = () => {
        setNavbar(!navbar);
    }
  
  
    return (
      <div className='flex flex-col w-screen h-screen'>
        <div className='w-screen p-2 z-10 flex flex-row justify-between items-center'>
            <div>
                <img src="/assets/logo.png" alt="Logo image" className='w-[10rem] h-auto' />
            </div>
            {navbar && <FaTimes className='text-2xl hover:text-purple-700' onClick={() => showNavbar()}/>}
            {!navbar &&<FaBars className='text-2xl hover:text-purple-700' onClick={() => showNavbar()}/>}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 top-[5rem] bg-neutral-200 z-10 h-auto overflow-scrolly-auto custom-scrollbar w-screen ${navbar ? 'show-small-screen-navbar' : 'hide-small-screen-navbar'} bg-neutral border-r-2 border-gray-400 flex flex-col`}>
       <div className='flex flex-row gap-2 items-center hover:text-purple-700 m-2 p-1 font-bold'>
        <span>Apple Inc.</span>
      </div>
      <SideBarMainComponent/>
        <div className='border border-t-gray-400 flex flex-col font-medium'>
          <div className='flex flex-row gap-5 m-1 hover:bg-neutral-200 p-1 rounded-sm cursor-pointer text-red-500'>
              <MdLogout className='text-xl'/>
              <span>Logout</span>
          </div>
          <Link to='/profile' className={`flex flex-row gap-5 m-1 hover:bg-neutral-200 p-1 rounded-sm ${pathname == '/profile'? 'bg-neutral-300' : ''}`}>
            <FaUser className='text-xl'/>
            <span>Your profile</span>
        </Link>
          { sidebarIconsBottom.map((iconItem) => (
              <div key={iconItem.name}>
                  <Link to={iconItem.url} className={`flex flex-row gap-5 m-1 hover:bg-neutral-200 p-1 rounded-sm ${pathname == iconItem.url ? 'bg-neutral-300' : ''}`}>
                      {iconItem.icon}
                      <span>{iconItem.name}</span>
                  </Link>
              </div>
          ))}
        </div>
      </div>
      </div>
    );
}

export default SmallScreenBar
