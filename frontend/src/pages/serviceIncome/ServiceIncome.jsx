import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, getQueryParams } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useParams } from 'react-router-dom';
import FromToDateModal from '../../components/modals/FromToDateModal';
import TypesFilter from '../../components/filters/TypesFilter';
import SortFilter from '../../components/filters/SortFilter';
import DateFilter from '../../components/filters/DateFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';

const ServiceIncome = () => {
  const [openDateModal, setOpenDateModal] = useState(false);
  const { currentOrg } = useAuth();
  const [header, setHeader] = useState('Service Income')

  const [searchItem, setSearchItem] = useState({
    name: '',
    search: '',
    serviceIncome: '',
    date: '',
    sortBy: '',
  })
  const [isVisible, setIsVisible] = useState(false);

  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }


  const [selectOptions, setSelectOptions] = useState([
    { name: "All", value: "all" },
    { name: "Invoice Service Income", value: "is_invoices" },
    { name: "Regular Service Income", value: "is_not_invoices" },
  ])
  const { orgId } = useParams();
  const [serviceIncome, setServiceIncome] = useState([]);
  const [serviceIncomeData, setServiceIncomeData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newServiceIncomeData = await getItems(`${orgId}/service_income`, `?paginate=true`);
    setServiceIncomeData(newServiceIncomeData);
    setHeader('Service Income')
  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem(prev => ({ ...prev, name: e.target.value, search: '' }));
    const queyParamsUrl = getQueryParams({
      type: 'service_income',
      paginate: false,
      search: e.target.value,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.serviceIncome
    })

    const newServiceIncome = await getItems(`${orgId}/service_income`, queyParamsUrl);
    setServiceIncome(newServiceIncome)
  }
  const handleServiceIncomeChange = async (e) => {
    setSearchItem(prev => ({ ...prev, serviceIncome: e.target.value, search: '' }));
    const queyParamsUrl = getQueryParams({
      type: 'service_income',
      paginate: true,
      search: '',
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: e.target.value
    })

    const newServiceIncomeData = await getItems(`${orgId}/service_income`, queyParamsUrl);
    setServiceIncomeData(newServiceIncomeData);
    setPageNo(1);

  }
  const showModal = (setOpenModal) => {
    setOpenModal(true);
  };
  const handleDatesChange = async (e) => {
    if (e.target.value === '*') {
      showModal(setOpenDateModal);
    } else {

      setSearchItem(prev => ({ ...prev, date: e.target.value, search: '' }));
      const queyParamsUrl = getQueryParams({
        type: 'service_income',
        paginate: true,
        search: '',
        date: e.target.value,
        sortBy: searchItem.sortBy,
        typeValue: searchItem.serviceIncome
      })
      const newServiceIncomeData = await getItems(`${orgId}/service_income`, queyParamsUrl);
      setServiceIncomeData(newServiceIncomeData);
      setPageNo(1);
    }


  }
  const handleSortsChange = async (e) => {
    setSearchItem(prev => ({ ...prev, sortBy: e.target.value, search: '' }));
    const queyParamsUrl = getQueryParams({
      type: 'service_income',
      paginate: true,
      search: '',
      date: searchItem.date,
      sortBy: e.target.value,
      typeValue: searchItem.serviceIncome
    })
    const newServiceIncomeData = await getItems(`${orgId}/service_income`, queyParamsUrl);
    setServiceIncomeData(newServiceIncomeData);
    setPageNo(1);

  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const queyParamsUrl = getQueryParams({
      type: 'service_income',
      paginate: true,
      search: searchItem.name,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.serviceIncome
    })
    const newServiceIncomeData = await getItems(`${orgId}/service_income`, queyParamsUrl);
    setServiceIncomeData(newServiceIncomeData);
    setPageNo(1);
    setHeader(`Service income matching '${searchItem.name}'`)
    setSearchItem(prev => ({ ...prev, name: '', search: prev.name }))
  }

  const nextPage = async () => {
    try {
      const response = await api.get(serviceIncomeData.next);
      if (response.status == 200) {
        setServiceIncomeData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching service income`);
    }
  }

  const previousPage = async () => {

    try {
      const response = await api.get(serviceIncomeData.previous);
      if (response.status == 200) {
        setServiceIncomeData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching Service Income`);
    }
  }
  const downloadPDF = () => {
    const querlParams = getQueryParams({
      type: 'service_income',
      paginate: false,
      search: searchItem.search,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.serviceIncome
    });
    const url = `/${orgId}/service_income/download/${querlParams}`;
    downloadListPDF(url, 'Service Income')
  }
  return (
    <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setServiceIncomeData}
        setPageNo={setPageNo}
        type='service_income'
      />
      <div className='flex flex-row w-full items-center justify-between'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-2'>
          <div className='w-[88%] relative h-[90%] flex flex-row gap-2'>
            <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter service income number or description' value={searchItem.name} onChange={e => handleChange(e)} />
            <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
              <div className='w-[27%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <TypesFilter searchItem={searchItem} selectOptions={selectOptions} type='service_income' handleTypesChange={handleServiceIncomeChange} />

              </div>
              <div className='w-[43%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />

              </div>
              <div className='w-[30%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <SortFilter searchItem={searchItem} handleSortsChange={handleSortsChange} />
              </div>
            </div>
            {serviceIncome?.service_income?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {serviceIncome?.service_income?.map((service_income) => (<Link to={`${service_income.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{service_income.serial_number}</Link>))}
            </div>}
          </div>

          <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
        </form>
        <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
           
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
              Download
            </button>
          </div>

      </div>
      <FormHeader header={header}/>


      <div className='overflow-auto custom-scrollbar flex flex-col max-h-[75%] flex-1 w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Service Income #</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Date</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
          <span className='w-[35%] border-gray-800 border-r-2 p-1'>Services</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Total Amount ({currentOrg?.currency})</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Total Quantity</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Due Amount ({currentOrg?.currency})</span>


        </div>
        {serviceIncomeData?.results?.data?.service_income && serviceIncomeData.results.data.service_income.map((service_income, index) => (
          <Link to={`${service_income.id}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={service_income.id}>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{service_income.serial_number}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{service_income.date}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(service_income.details.type)}</span>
            <span className='w-[35%] border-gray-800 border-r-2 p-1 flex flex-col'>
              <ul className='flex flex-wrap gap-3'>
                {service_income.details.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <i className='text-sm'>({service_income.description})</i>
            </span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{service_income.details.total_amount}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{service_income.details.total_quantity}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{service_income.details.amount_due > 0 ? service_income.details.amount_due : '-'}</span>

          </Link>
        ))}
         {serviceIncomeData?.results?.data?.totals && <span className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 font-bold underline text-right'>
          <span className='w-[70%] border-gray-800 border-r-2 p-1'>Total</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{serviceIncomeData?.results?.data?.totals?.amount}</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{serviceIncomeData?.results?.data?.totals?.quantity}</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{serviceIncomeData?.results?.data?.totals?.amount_due}</span>

        </span>}
      </div>
      { serviceIncomeData && <PrevNext pageNo={pageNo} data={serviceIncomeData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>}

    </div>
  )
}

export default ServiceIncome
