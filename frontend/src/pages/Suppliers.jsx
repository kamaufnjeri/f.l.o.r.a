import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { getItems } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft, FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useParams } from 'react-router-dom';
import PrevNext from '../components/shared/PrevNext';
import { downloadListPDF } from '../lib/download/downloadList';

const Suppliers= () => {
  const [searchItem, setSearchItem] = useState({
    name: '',
    search: '',
  })
  const { orgId } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }

  const getData = async () => {
    const newSuppliersData = await getItems(`${orgId}/suppliers`, `?paginate=true`);
    setSuppliersData(newSuppliersData);
    setSearchItem({ name: '', search: ''})

}
  useEffect(() => {
   
    getData();
}, [])
  const handleChange = async (e) => {
    setSearchItem(prev => ({ search: prev.search, name: e.target.value }));
    const newsuppliers = await getItems(`${orgId}/suppliers`, `?search=${e.target.value}`);
    setSuppliers(newsuppliers)
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newSuppliersData = await getItems(`${orgId}/suppliers`, `?search=${searchItem.name}&paginate=true`);
    setSuppliersData(newSuppliersData);
    setPageNo(1);
    setSearchItem(prev => ({ search: prev.name, name: '' }))
  }


  const nextPage = async () => {
    try {
      const response = await api.get(suppliersData.next);
      if (response.status == 200) {
        setSuppliersData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching suppliers`);
    }
  }

  const previousPage = async () => {
    
    try {
      const response = await api.get(suppliersData.previous);
      if (response.status == 200) {
        setSuppliersData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching suppliers`);
    }
  }
  const downloadPDF = () => {
    const url = `/${orgId}/suppliers/download/?search=${searchItem.search}`
    downloadListPDF(url, 'Suppliers')
  }

  return (
    <div className='flex-1 flex flex-col items-center justify-center relative h-full mr-2'>
      <FormHeader header='Suppliers List' />
      <div className='flex flex-row w-full items-center justify-between'>
      <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-[40%] border-2 border-gray-800 rounded-md text-black relative'>
        <input type='name' className='w-[70%] outline-none border-none p-2' placeholder='Search suppliers by name' value={searchItem.name} onChange={e => handleChange(e)} />
        <button className='w-[30%] border-2 bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
        {suppliers.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>
          {suppliers.map((supplier) => (<span className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{supplier.name}</span>))}
        </div>}
      </form>
      <div onClick={getData} className='self-end p-1 cursor-pointer w-[10%] hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
        Reset
      </div>
      </div>
      <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
           
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
              Download
            </button>
           


          </div>
      

      <div className='overflow-auto custom-scrollbar flex flex-col flex-1 h-full w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>No.</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1 '>Name</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>Email</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Phone No.</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Amount Due</span>

        </div>
        {suppliersData?.results?.data && suppliersData.results.data.map((supplier, index) => (
          <div className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={supplier.id}>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}.</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{supplier.name}</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>{supplier.email}</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{supplier.phone_number}</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{supplier.amount_due}</span>

        </div>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={suppliersData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>

    </div>
  )
}

export default Suppliers
