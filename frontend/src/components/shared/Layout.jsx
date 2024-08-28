import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import Logo from './logo'
import SmallScreenBar from './SmallScreenBar'

const Layout = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
      <Logo/>
      <Sidebar/>
      <Header/>
      
    </div>)
    } else {
      return (<SmallScreenBar className='flex-none'/>);
    }
  };

  return (
    <div className='absolute right-0 top-0 left-0 bottom-0 w-screen h-screen overflow-hidden flex flex-col'>
      {renderItems()}
      <div className='flex-1 mt-[6rem] ml-[16rem]'
      style={{ width: 'calc(100vw - 16rem)', height: 'calc(100vh - 6rem)'}}
      >
        <Outlet/>
      </div>
    </div>
  );
};
 

export default Layout