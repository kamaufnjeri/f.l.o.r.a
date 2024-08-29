import React, { useRef } from 'react';
import { sidebarIconsBottom} from '../../lib/constants';
import { Link, useLocation } from 'react-router-dom';
import { MdLogout } from "react-icons/md";

import SideBarMainComponent from './SideBarMainComponent';


const Sidebar = ({ setOpenAddAccountModal, setOpenAddItemModal }) => {

  const { pathname } = useLocation();
  
  return (
    <div className='absolute top-0 left-0 z-10 bottom-0 w-[15rem] bg-neutral border-r-2 border-gray-400 flex flex-col'>
     <div className='w-[15rem] z-10'>
    <div>
        <img src="/assets/logo.png" alt="Logo image" className='w-full h-auto' />
      </div>
    </div>
      <SideBarMainComponent setOpenAddAccountModal={setOpenAddAccountModal} setOpenAddItemModal={setOpenAddItemModal}/>
      <div className='border border-t-gray-400 flex flex-col font-medium'>
        <div className='flex flex-row gap-5 m-1 hover:bg-neutral-200 p-1 rounded-sm cursor-pointer text-red-500'>
            <MdLogout className='text-xl'/>
            <span>Logout</span>
        </div>
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
  );
};

export default Sidebar;
