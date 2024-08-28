import React, { useRef, useState } from 'react';
import {sidebarIcons, sidebarIconsBottom} from '../../lib/constants';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa'; // Import the arrow icon
import { MdLogout } from "react-icons/md";
import { FaHome } from 'react-icons/fa';
import { GoDotFill } from "react-icons/go";


const Sidebar = () => {
  const dropButtonssRef = useRef([]);
  const { pathname } = useLocation();
  const dropIconRef = useRef([]);
  const dropItemsRef = useRef([]);

  const displayDropDownItems = (index) => {
    const dropItem = dropItemsRef.current[index];
    const dropIcon = dropIconRef.current[index];

    if (dropItem) {
        dropItem.classList.toggle('drop-items-display')
        dropItem.classList.toggle('drop-items-hidden')
        dropIcon.classList.toggle('rotate-chevron')
        dropIcon.classList.toggle('rotate-chevron-0')

    }
  }


  return (
    <div className='absolute left-0 z-10 bottom-0 w-[15rem] bg-neutral border-r-2 border-gray-400 flex flex-col top-[125px]'>
     
      <div className='flex-1 flex flex-col ml-2 overflow-y-auto custom-scrollbar'>
      <Link
        className={`flex flex-row items-center gap-5 cursor-pointer m-1 p-1 rounded-sm  hover:bg-neutral-200 hover:text-purple-600
                    ${pathname === '/' ? 'text-purple-700' : 'text-neutral-900'}`}
        to="/"
        >
        <FaHome className='text-xl'/>
        <span className='font-medium text-xl flex-1'>Dashboard</span>
    </Link>

        {
          sidebarIcons.map((iconItem, index) => (
            <div key={index} className='flex flex-col m-1'>
              <div
                className='flex flex-row items-center gap-5 cursor-pointer rounded-sm p-1 text-neutral-900 hover:bg-neutral-200 hover:text-purple-600'
                onClick={() => displayDropDownItems(index)}
                ref={(el) => dropButtonssRef.current[index] = el}
              >
                {iconItem.icon}
                <span className='font-medium text-xl flex-1'>{iconItem.name}</span>
                <div ref={(el) => dropIconRef.current[index] = el} className='rotate-chevron-0'>
                    <FaChevronDown className='text-sm'/>
                </div>
              </div>
              <div
                ref={(el) => dropItemsRef.current[index] = el}
                className='flex-col ml-5 mb-1 mr-1 rounded-sm font-medium drop-items-hidden'
              >
                {iconItem.lists.map((listItem) => (
                  <Link
                    key={listItem.url}
                    to={listItem.url}
                    className={`block  hover:bg-neutral-200  rounded-sm pb-1 pl-2 ${pathname == listItem.url ? 'text-purple-700' : 'text-neutral-700'}`}
                  >
                   <div className='flex flex-row gap-2 items-center'>
                    <GoDotFill/>
                    <span>{listItem.name}</span>
                   </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        }
      </div>
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
