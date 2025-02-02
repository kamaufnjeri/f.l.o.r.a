import React from 'react'
import { FaBars, FaPlus, FaTimes } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const Header = ({ setShowSideBar, showSideBar }) => {
  const { currentOrg, user } = useAuth();


  const showSideBarFunc = () => {
    setShowSideBar(!showSideBar)
  }
  return (
    <div className={`font-bold h-[60px] text-gray-800 flex flex-row absolute top-0 right-0 left-0
    items-center justify-between bg-gray-100 border-b-2 border-gray-300 w-full p-2 z-20
     `}>
      <div className={`p-2 flex w-[220px] items-center justify-between duration-300 transform ease-in-out transition-all ${showSideBar ? 'flex-row-reverse ' : 'flex-row'}`}>
        <FaBars className='text-2xl hover:text-purple-700 ml-2 cursor-pointer z-20' onClick={() => showSideBarFunc()} />


        <Link to='/'>
          <img src="/assets/logo.png" className='h-[60px] w-auto' alt="Logo image" />
        </Link>
      </div>
      <Link to={`/dashboard/${currentOrg.id}/accounts`} className='md:flex lg:flex hover:border-purple-600 hover:text-purple-700 hidden'>
        Accounts
      </Link>
      <Link to={`/dashboard/${currentOrg.id}/purchases`} className='md:flex lg:flex hover:border-purple-600 hover:text-purple-700 hidden'>
        Purchases
      </Link>
      <Link to={`/dashboard/${currentOrg.id}/sales`} className='md:flex lg:flex hover:border-purple-600 hover:text-purple-700 hidden'>
        Sales
      </Link>
      <Link to={`/dashboard/${currentOrg.id}/service_income`} className='md:flex lg:flex hover:border-purple-600 hover:text-purple-700 hidden'>
        Service Income
      </Link>
      <Link to={`/dashboard/${currentOrg.id}/journals`} className='md:flex lg:flex hover:border-purple-600 hover:text-purple-700 hidden'>Journals</Link>
      <div className='flex group relative'>
        <span className='md:flex lg:flex hover:border-purple-600 hover:text-purple-700'>
          Organisations
        </span>
        <div className='text-lg hidden group-hover:flex flex-col gap-2 absolute right-2 top-[40px] bg-gray-200 rounded-sm duration-300 transition-all ease-in-out w-[150px]' >
          {user && user?.user_organisations.map((organisation, index) => (
            <div key={index} className={`flex flex-row gap-2 items-start justify-start ${currentOrg.id === organisation.org_id ? 'text-purple-800 border-purple-800' : 'border-purple-800'}`}>
              <span onClick={() => changeCurrentOrg(organisation.org_id)} className=''>
                {organisation.org_name[0]}
              </span>
              <i className='text-xs font-light bg-gray-300 p-1'>{organisation.org_name}</i>
            </div>

          ))}
        </div>

      </div>
      <div className='flex items-center gap-2 p-2 flex-col relative group'>
        <span className='text-lg hidden group-hover:block absolute right-0 -bottom-5 bg-gray-200 rounded-sm duration-300 transition-all ease-in-out w-[150px] text-center'>{user.first_name} {user.last_name}</span>

        <Link
          to='/profile'
          className='rounded-full w-15 h-15 hover:ring-4 ring-neutral-400 flex items-center justify-center flex-row gap-2'
        >
          <img src="/assets/flora.png" alt="" className='w-12 h-12 rounded-full cursor-pointer' />
        </Link>

      </div>

    </div>
  )
}

export default Header
