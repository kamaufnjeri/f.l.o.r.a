import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { getItems, getNumber } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import SubHeader from '../../components/shared/SubHeader';


const Services = () => {
  const [searchItem, setSearchItem] = useState({
    name: '',
    search: '',
  })
  const { orgId } = useParams();
  const [services, setServices] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [header, setHeader] = useState('Services')
  const navigate = useNavigate();

  const handleRowClick = (serviceId) => {
    navigate(`/dashboard/${orgId}/services/${serviceId}`);
  };


  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }

  const getData = async () => {
    const newServicesData = await getItems(`${orgId}/services`, `?paginate=true`);
    setServicesData(newServicesData);
    setPageNo(1);
    setHeader('Services');
    setSearchItem({ name: '', search: '' })

  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem(prev => ({ search: prev.search, name: e.target.value }))
    const newServices = await getItems(`${orgId}/services`, `?search=${e.target.value}`);
    setServices(newServices)
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newservicesData = await getItems(`${orgId}/services`, `?search=${searchItem.name}&paginate=true`);
    setServicesData(newservicesData);
    setPageNo(1);
    setHeader(`Services matching '${searchItem.name}'`)
    setSearchItem(prev => ({ name: '', search: prev.name }))
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
  const downloadPDF = () => {
    const url = `/${orgId}/services/download/?search=${searchItem.search}`
    downloadListPDF(url, 'Services')
  }

  return (
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <SubHeader service={true} getData={getData} />

      <div className='grid lg:grid-cols-2 grid-cols-1  w-full gap-4 items-center shadow-md rounded-md p-2'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row gap-2 self-start rounded-md text-black relative'>
          <input type='name' className='w-[70%] rounded-md border border-gray-800 outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter name or description of service' value={searchItem.name} onChange={e => handleChange(e)} />
          <button className='w-[30%] border-2 bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
          {services.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>
            {services.map((service) => (<Link to={service.id} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{service.name}</Link>))}
          </div>}
        </form>
        <div className='grid grid-cols-2 gap-2'>
          <div onClick={getData} className='p-1 h-10 cursor-pointer hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border text-center border-gray-800'>
            Reset
          </div>

          <div className='flex items-center justify-center gap-2 place-self-end'>
            <div className={`rounded-md p-1 bg-neutral-200 relative
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

              <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                Download
              </button>

            </div>
            {!isVisible ?
              <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
              <FaTimes className='cursor-pointer hover:text-purple-800 text-lg' onClick={closeDropDown} />

            }

          </div>
        </div>

      </div>
      <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

      <div className='flex flex-row items-center justify-between w-full'>
        <FormHeader header={header} />
        <PrevNext pageNo={pageNo} data={servicesData} previousPage={previousPage} nextPage={nextPage} className='w-full' />
      </div>

      <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>
            <th className='p-1 border-b border-r border-gray-800'>No.</th>
            <th className='p-1 border-b border-r border-gray-800'>Name</th>
            <th className='p-1 border-b border-r border-gray-800'>Description</th>

          </tr>
        </thead>
        <tbody>
          {servicesData?.results?.data && servicesData.results.data.map((service, index) => (
            <tr key={service.id} className='hover:bg-gray-200 cursor-pointer'
              onClick={() => handleRowClick(service.id)}
            >
              <td className='p-1 border-b border-r border-gray-800'>
                {getNumber(pageNo, index)}.
              </td>
              <td className='p-1 border-b border-r border-gray-800'>
                {service.name}
              </td>
              <td className='p-1 border-b border-r border-gray-800'>
                {service.description}
              </td>

            </tr>
          ))}

        </tbody>
      </table>
</div>
    </div>
  )
}

export default Services
