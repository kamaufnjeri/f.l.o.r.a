import React, { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'


const Layout = () => {
  const [showSideBar, setShowSideBar] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      const observer = new MutationObserver(() => {
        container.scrollTop = container.scrollHeight;
      });

      observer.observe(container, { childList: true, subtree: true });

      return () => observer.disconnect();
    }
  }, []);


  return (

    <div className='absolute right-0 top-0 left-0 bottom-0 w-screen h-screen overflow-hidden'>
      <Sidebar showSideBar={showSideBar} />

      <Header setShowSideBar={setShowSideBar} showSideBar={showSideBar} />


      <div 
      ref={containerRef}
      className={`flex flex-col h-[calc(100vh-80px)] px-10 py-4 absolute 
      overflow-y-auto custom-scrollbar gap-4 top-[70px] right-0 bottom-0
         ${showSideBar ? 
          'lg:w-[calc(100%-290px)] md:w-[calc(100%-290px)] w-full left-0 md:left-[280px] lg:left-[280px' :
          'w-full left-0'
        }`}>


        <Outlet />
      </div>


    </div>
  );
};


export default Layout
