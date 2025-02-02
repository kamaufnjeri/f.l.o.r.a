import React, { useRef, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa';
import { GoArrowRight, GoDotFill } from "react-icons/go";
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { sidebarIcons } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { MdLogout } from 'react-icons/md';

const SideBarMainComponent = () => {
  const dropButtonssRef = useRef([]);
  const { user, currentOrg, changeCurrentOrg, logout } = useAuth();
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
    <div className='flex-1 flex flex-col overflow-y-auto custom-scrollbar w-full gap-[2px]'>
       
        {
          (currentOrg && currentOrg.name !== '') ? (
            <>
              
              {
                sidebarIcons.map((iconItem, index) => (
                  <>
                    {iconItem.lists ? (
                      <>
                        <div
                          className='flex flex-row items-center gap-5 cursor-pointer rounded-sm p-1 text- hover:bg-neutral-200 hover:text-purple-600'
                          onClick={() => displayDropDownItems(index)}
                          ref={(el) => dropButtonssRef.current[index] = el}
                        >
                          {iconItem.icon}
                          <span className='font-medium text-base flex-1'>{iconItem.name}</span>
                          <div ref={(el) => dropIconRef.current[index] = el} className='rotate-chevron-0'>
                            <FaChevronDown className='text-sm' />
                          </div>
                        </div>
                        <div
                          ref={(el) => dropItemsRef.current[index] = el}
                          className='flex-col ml-2  rounded-sm font-medium drop-items-hidden'
                        >
                          {iconItem.lists.map((listItem, listIndex) => (
                            <ShowListItem
                              key={listItem.name}
                              listItem={listItem}
                              pathname={pathname}
                              orgId={currentOrg.id}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <Link
                        to={`/dashboard/${currentOrg.id}${iconItem.url}`}
                        key={index}
                        className='flex flex-row items-center gap-5 cursor-pointer rounded-sm p-1 text-neutral-900 hover:bg-neutral-200 hover:text-purple-600'
                      >
                        {iconItem.icon}
                        <span className='font-medium text-base flex-1'>{iconItem.name}</span>
                      </Link>
                    )}
                  </>
                ))
              }
              
                <div className='flex flex-row items-center gap-5 cursor-pointer rounded-sm p-1  text-red-500 hover:bg-neutral-200' onClick={logout}>
                  <MdLogout className='text-2xl' />
                  <span>Logout</span>
              </div>
            </>
          ) : (
            <></>
          )
        }


    </div>
  )
}


const ShowListItem = ({ listItem, pathname, orgId }) => {
  const listItemUrl = `/dashboard/${orgId}/${listItem.url}`


  return (
    <Link
      to={listItem.url}
      className={`block hover:bg-neutral-200 rounded-sm text-sm pb-1 pl-2 ${pathname === listItemUrl ? 'text-purple-700' : 'text-neutral-700'}`}
    >
      <div className='flex flex-row gap-2 items-center'>
        <GoArrowRight />
        <span>{listItem.name}</span>
      </div>
    </Link>
  );

}

export default SideBarMainComponent
