import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import SmallScreenBar from './SmallScreenBar'
import ExampleModal from '../modals/AddItemModal'
import AddAccountModal from '../modals/AddAccountModal'
import AddItemModal from '../modals/AddItemModal'

const Layout = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [openAddItemModal, setOpenAddItemModal] = useState(false);
    const [openAddAccountModal, setOpenAddAccountModal] = useState(false);
    const [showSideBar, setShowSideBar] = useState(false)

  // Update windowWidth state when the window is resized
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const renderItems = () => {
    if (windowWidth > 720) {
      return  (<div className='flex-none'>
      <Sidebar setOpenAddAccountModal={setOpenAddAccountModal} setOpenAddItemModal={setOpenAddItemModal} setShowSideBar={setShowSideBar} showSideBar={showSideBar}/>
      <Header setOpenAddAccountModal={setOpenAddAccountModal} setOpenAddItemModal={setOpenAddItemModal} setShowSideBar={setShowSideBar} showSideBar={showSideBar}/>  
    </div>)
    } else {
      return (<SmallScreenBar className='flex-none'/>);
    }
  };

  return (
    <div className='absolute right-0 top-0 left-0 bottom-0 w-screen h-screen overflow-hidden flex flex-col'>
      <AddAccountModal openModal={openAddAccountModal} setOpenModal={setOpenAddAccountModal}/>
      <AddItemModal openModal={openAddItemModal} setOpenModal={setOpenAddItemModal}/>
      {renderItems()}
      <div className={`flex-1 mt-[70px] p-3 ${showSideBar ? 'ml-[17rem]' : ''}`}
      style={{ width: `${showSideBar ? 'calc(100vw - 17rem)' : '100vw'}`, height: 'calc(100vh - 60px)'}}
      >
        <Outlet/>
      </div>
    </div>
  );
};
 

export default Layout
