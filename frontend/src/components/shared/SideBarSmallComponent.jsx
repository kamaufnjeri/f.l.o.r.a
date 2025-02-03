import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { sidebarIcons } from '../../lib/constants';
import { MdLogout } from 'react-icons/md';
import { GoArrowRight } from 'react-icons/go';

const SideBarSmallComponent = () => {
    const { currentOrg, logout } = useAuth();
    const { pathname } = useLocation();
   

    return (
        <div className='flex-1 flex flex-col h-full w-full gap-[3px] p-2 relative'>
            {
                (currentOrg && currentOrg.name !== '') ? (
                    <>

                        {
                            sidebarIcons.map((iconItem, index) => (
                                <>
                                    {iconItem.lists ? (
                                        <>
                                            <div
                                                className='flex flex-row items-center gap-5 cursor-pointer rounded-sm p-1 text- hover:bg-neutral-200 hover:text-purple-600 relative group'
                                            >
                                                {iconItem.icon}
                                                <div className='absolute top-0 left-[30px]  z-40 hidden group-hover:flex items-start flex-col gap-1 pt-1 p-2 w-[200px] h-auto bg-neutral-200 rounded-sm shadow'>
                                                    <span className='font-medium text-base flex-1'>{iconItem.name}</span>
                                                    
                                                        {iconItem.lists.map((listItem, listIndex) => (
                                                            <ShowListItem
                                                                key={listItem.name}
                                                                listItem={listItem}
                                                                pathname={pathname}
                                                                orgId={currentOrg.id}
                                                            />))}
                                                       

                                                </div>

                                            </div>

                                        </>
                                    ) : (
                                        <Link
                                            to={`/dashboard/${currentOrg.id}${iconItem.url}`}
                                            key={index}
                                            className='flex flex-row items-center gap-5 cursor-pointer rounded-sm p-1 text-neutral-900 hover:bg-neutral-200 hover:text-purple-600 relative group'
                                        >
                                            {iconItem.icon}
                                            <div className='absolute left-[30px] z-20 hidden group-hover:flex items-center pl-2 bg-neutral-200 w-[200px] h-full rounded-sm shadow'>
                                                <span className='font-medium text-base flex-1'>{iconItem.name}</span>

                                            </div>
                                        </Link>
                                    )}
                                </>
                            ))
                        }

                        <div className='flex flex-row items-center gap-5 cursor-pointer rounded-sm p-1  text-red-500 hover:bg-neutral-200 relative group' onClick={logout}>
                            <MdLogout className='text-2xl' />
                            <div className='absolute left-[30px] z-20 hidden group-hover:flex w-[200px] h-full bg-neutral-200 pl-2 items-center rounded-sm shadow'>
                                <span className='font-medium text-base flex-1'>Logout</span>
                            </div>
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
            className={`block hover:bg-neutral-100 rounded-sm text-sm p-1 w-full ${pathname === listItemUrl ? 'text-purple-700' : 'text-neutral-700'}`}
        >
            <div className='flex flex-row gap-2 items-center'>
                <GoArrowRight />
                <span>{listItem.name}</span>
            </div>
        </Link>
    );

}

export default SideBarSmallComponent
