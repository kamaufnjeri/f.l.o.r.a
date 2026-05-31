import React from 'react';
import SideBarMainComponent from './SideBarMainComponent';
import SideBarSmallComponent from './SideBarSmallComponent';


const Sidebar = ({ setOpenAddAccountModal, setOpenAddItemModal, showSideBar }) => {

  return (
    
    <div className={`bg-gray-100 border-r-2 border-gray-400 flex flex-col  z-10 absolute
      pb-2 pt-[60px] top-0 left-0
    ${showSideBar ? 'increase-width md:w-[220px] lg:w-[220px] w-full px-2 h-full' : 'decrease-width w-[0px] md:w-[70px] lg:w-[70px] min-h-screen'}
    
    `}>


      {showSideBar ? <SideBarMainComponent />
        : <><SideBarSmallComponent/></>}




    </div>
  );
};

export default Sidebar;
