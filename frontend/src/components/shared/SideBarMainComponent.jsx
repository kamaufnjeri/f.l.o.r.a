import React, { useEffect, useRef, useState } from 'react'
import { FaHome } from 'react-icons/fa';
import { FaChevronDown } from 'react-icons/fa'; // Import the arrow icon
import { GoDotFill } from "react-icons/go";
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { sidebarIcons } from '../../lib/constants';
import AddCustomerModal from '../modals/AddCustomerModal';
import AddSupplierModal from '../modals/AddSupplierModal';

const SideBarMainComponent = ({ setOpenAddItemModal, setOpenAddAccountModal }) => {
    const dropButtonssRef = useRef([]);
    const { pathname } = useLocation();
    const dropIconRef = useRef([]);
    const [openAddACustomerModal, setOpenAddCustomerModal] = useState(false);
    const [openAddSupplierModal, setOpenAddSupplierModal] = useState(false);

    const dropItemsRef = useRef([]);

    const sidebarIconsUpdated = sidebarIcons.map((icon) => ({
      ...icon,
      lists: icon.lists.map((iconItem) => {
        const updatedItem = { ...iconItem };
    
        if (iconItem.url === null) {
          if (iconItem.name === 'Add stock item') {
            updatedItem.onClick = () => setOpenAddItemModal(true);
          }
          if (iconItem.name === 'Add account') {
            updatedItem.onClick = () => {
              setOpenAddAccountModal(true);
            };
          }
          if (iconItem.name === 'Add customer') {
            updatedItem.onClick = () => setOpenAddCustomerModal(true);
          }
          if (iconItem.name === 'Add supplier') {
            updatedItem.onClick = () => setOpenAddSupplierModal(true);
          }
        }
        return updatedItem;
      })
    }));
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
    <div className='flex-1 flex flex-col ml-2 overflow-y-auto custom-scrollbar'>
      <AddCustomerModal openModal={openAddACustomerModal} setOpenModal={setOpenAddCustomerModal}/>
      <AddSupplierModal openModal={openAddSupplierModal} setOpenModal={setOpenAddSupplierModal}/>
    <Link
      className={`flex flex-row items-center gap-5 cursor-pointer m-1 p-1 rounded-sm  hover:bg-neutral-200 hover:text-purple-600
                  ${pathname === '/dashboard' ? 'text-purple-700' : 'text-neutral-900'}`}
      to="/dashboard"
      >
      <FaHome className='text-xl'/>
      <span className='font-medium text-xl flex-1'>Dashboard</span>
  </Link>

      {
        sidebarIconsUpdated.map((iconItem, index) => (
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
              {iconItem.lists.map((listItem, index) => (
                <ShowListItem key={listItem.name} listItem={listItem} pathname={pathname}/>
              ))}
            </div>
          </div>
        ))
      }
    </div>
  )
}


const ShowListItem = ({ listItem, pathname }) => {
  const handleClick = listItem.onClick || (() => {});

  if (listItem.url) {
    return (
      <Link
        to={listItem.url}
        className={`block hover:bg-neutral-200 rounded-sm pb-1 pl-2 ${pathname === listItem.url ? 'text-purple-700' : 'text-neutral-700'}`}
      >
        <div className='flex flex-row gap-2 items-center'>
          <GoDotFill />
          <span>{listItem.name}</span>
        </div>
      </Link>
    );
  } else {
    return (
      <button
        onClick={handleClick}
        className={`block hover:bg-neutral-200 rounded-sm pb-1 pl-2 text-neutral-700 w-full`}
      >
        <div className='flex flex-row gap-2 items-center'>
          <GoDotFill />
          <span>{listItem.name}</span>
        </div>
      </button>
    );
  }
}

export default SideBarMainComponent
