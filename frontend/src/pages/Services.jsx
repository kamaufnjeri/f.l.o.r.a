import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, replaceDash } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useParams } from 'react-router-dom';
import PrevNext from '../components/shared/PrevNext';


const Services = () => {
  const [searchItem, setSearchItem] = useState({
    name: ''
  })
  const { orgId } = useParams();
  const [services, setServices] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newServicesData = await getItems(`${orgId}/services`, `?paginate=true`);
    setServicesData(newServicesData);
    console.log(newServicesData)
    setPageNo(1);
}
  useEffect(() => {
   
    getData();
}, [])
  const handleChange = async (e) => {
    setSearchItem({ name: e.target.value });
    const newServices = await getItems(`${orgId}/services`, `?search=${e.target.value}`);
    setServices(newServices)
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newservicesData = await getItems(`${orgId}/services`, `?search=${searchItem.name}&paginate=true`);
    setServicesData(newservicesData);
    setPageNo(1);
    setSearchItem({ name: '' })
  }

  const nextPage = async () => {
    try {
      const response = await api.get(servicesData.next);
      if (response.status == 200) {
        setServicesData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching services`);
    }
  }

  const previousPage = async () => {
    
    try {
      const response = await api.get(servicesData.previous);
      if (response.status == 200) {
        setServicesData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching services`);
    }
  }

  return (
    <div className='flex-1 flex flex-col items-center justify-center relative h-full mr-2'>
      <FormHeader header='Services List' />
      <div className='flex flex-row w-full items-center justify-between'>
      <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-[40%] border-2 border-gray-800 rounded-md text-black relative'>
        <input type='name' className='w-[70%] outline-none border-none p-2' placeholder='Enter name or description of service' value={searchItem.name} onChange={e => handleChange(e)} />
        <button className='w-[30%] border-2 bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
        {services.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>
          {services.map((service) => (<span className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{service.name}</span>))}
        </div>}
      </form>
      <div onClick={getData} className='self-end p-1 cursor-pointer w-[10%] hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
        Reset
      </div>
      </div>
      

      <div className='overflow-auto custom-scrollbar flex flex-col flex-1 h-full w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>No.</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1 '>Name</span>
          <span className='w-[50%] border-gray-800 border-r-2 p-1'>Description</span>

        </div>
        {servicesData?.results?.data && servicesData.results.data.map((service, index) => (
          <div className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={service.id}>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{index + 1}.</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>{service.name}</span>
          <span className='w-[50%] border-gray-800 border-r-2 p-1'>{service.description}</span>
        
        </div>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={servicesData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>

    </div>
  )
}

export default Services
