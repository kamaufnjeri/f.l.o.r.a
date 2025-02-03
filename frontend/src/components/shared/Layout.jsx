import React, { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import { useSelectOptions } from '../../context/SelectOptionsContext';


const Layout = () => {
  const [showSideBar, setShowSideBar] = useState(true);
  const { mainContainerRef  } = useSelectOptions();
  


  return (

    <div className={`absolute right-0 top-0 left-0 bottom-0 w-screen h-screen ${showSideBar ? 'overflow-y-hidden' : 'overflow-y-auto'} overflow-x-hidden`}>
      <Sidebar showSideBar={showSideBar} />

      <Header setShowSideBar={setShowSideBar} showSideBar={showSideBar} />


      <div 
      ref={mainContainerRef}
      className={`flex flex-col h-[calc(100vh-80px)] absolute 
      md:p-2 lg:p-2 p-4
      overflow-y-auto custom-scrollbar overflow-x-hidden gap-4 top-[70px] right-0 bottom-0
         ${showSideBar ? 
          'lg:w-[calc(100%-220px)] md:w-[calc(100%-220px)] w-full left-0 md:left-[220px] lg:left-[220px]' :
          'md:w-[calc(100%-70px)] lg:w-[calc(100%-70px)] w-full md:left-[70px] lg:left-[70px] left-0'
        }`}>


        <Outlet />
      </div>


    </div>
  );
};


export default Layout
