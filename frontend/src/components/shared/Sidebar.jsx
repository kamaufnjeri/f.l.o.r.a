import React, { useRef } from 'react';
import { sidebarIconsBottom } from '../../lib/constants';
import { Link, useLocation } from 'react-router-dom';
import { MdLogout } from "react-icons/md";
import SideBarMainComponent from './SideBarMainComponent';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';


const Sidebar = ({ setOpenAddAccountModal, setOpenAddItemModal, showSideBar }) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  

  return (
    <div className={`bg-gray-100 border-r-2 border-gray-400 flex flex-col  z-10 absolute
     px-2 pb-2 pt-[70px] top-0 left-0 bottom-0
    ${showSideBar ? 'increase-width md:w-[270px] lg:w-[270px] w-full' : 'decrease-width'}
    
    `}>
      
                   

      <SideBarMainComponent />
      <div className='border border-t-gray-400 flex flex-col font-medium'>
        <div className='flex flex-row gap-5 m-1 hover:bg-neutral-200 p-1 rounded-sm cursor-pointer text-red-500' onClick={logout}>
          <MdLogout className='text-xl' />
          <span>Logout</span>
        </div>


        <></>
        {sidebarIconsBottom.map((iconItem) => (
          <div key={iconItem.name}>
            <Link to={iconItem.url} className={`flex flex-row gap-5 m-1 hover:bg-neutral-200 p-1 rounded-sm ${pathname == iconItem.url ? 'bg-neutral-300' : ''}`}>
              {iconItem.icon}
              <span>{iconItem.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
