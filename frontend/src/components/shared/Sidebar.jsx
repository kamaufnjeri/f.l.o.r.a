import React from 'react';
import SideBarMainComponent from './SideBarMainComponent';
import SideBarSmallComponent from './SideBarSmallComponent';


const Sidebar = ({ setOpenAddAccountModal, setOpenAddItemModal, showSideBar }) => {

  return (
    
    <div className={`bg-gray-100 border-r-2 border-gray-400 flex flex-col  z-10 absolute
     px-2 pb-2 pt-[60px] top-0 left-0 bottom-0
    ${showSideBar ? 'increase-width w-[220px]' : 'decrease-width'}
    
    `}>


      {showSideBar ? <SideBarMainComponent />
        : <><SideBarSmallComponent/></>}




    </div>
  );
};

export default Sidebar;
