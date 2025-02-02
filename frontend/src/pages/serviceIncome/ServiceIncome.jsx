import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, getQueryParams } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();


  const handleRowClick = (serviceIncomeId) => {
    navigate(`/dashboard/${orgId}/service_income/${serviceIncomeId}`);
  };


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
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setServiceIncomeData}
        setPageNo={setPageNo}
        type='service_income'
      />
      <div className='flex flex-row w-full'>
        <form onSubmit={handleSubmit} className='grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 self-start w-full text-black items-center gap-2'>
          <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-2 relative col-span-2'>
            <input type='name' className='h-10 border border-gray-800 rounded-md outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter service income number or description' value={searchItem.name} onChange={e => handleChange(e)} />

            <TypesFilter searchItem={searchItem} selectOptions={selectOptions} type='service_income' handleTypesChange={handleServiceIncomeChange} />

            <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />

            <SortFilter searchItem={searchItem} handleSortsChange={handleSortsChange} />

            {serviceIncome?.service_income?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {serviceIncome?.service_income?.map((service_income) => (<Link to={`${service_income.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{service_income.serial_number}</Link>))}
            </div>}
          </div>
          <div className='grid grid-cols-2 gap-2 '>
            <button className='h-10 w-[100px] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>

            <div className='flex items-center justify-center place-self-end'>
              <div className={`rounded-md p-1 bg-neutral-200 relative
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

                <button type='button' className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                  Download
                </button>

              </div>
              {!isVisible ?
                <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
                <FaTimes className='cursor-pointer hover:text-purple-800  text-lg' onClick={closeDropDown} />

              }
            </div>
          </div>

        </form>
      </div>
      <div className='flex flex-row items-center justify-between w-full'>
        <FormHeader header={header} />
        {serviceIncomeData && <PrevNext pageNo={pageNo} data={serviceIncomeData} previousPage={previousPage} nextPage={nextPage} className='w-full' />}

      </div>
      <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>
            <th className='p-1 border-r border-b border-gray-800'>Service Income #</th>
            <th className='p-1 border-r border-b border-gray-800'>Date</th>
            <th className='p-1 border-r border-b border-gray-800'>Type</th>
            <th className='p-1 border-r border-b border-gray-800' colSpan={2}>Services</th>
            <th className='p-1 border-r border-b border-gray-800'>Total Amount ({currentOrg?.currency})</th>
            <th className='p-1 border-r border-b border-gray-800'>Total Quantity</th>
            <th className='p-1 border-r border-b border-gray-800'>Due Amount ({currentOrg?.currency})</th>
          </tr>
        </thead>
        <tbody>
          {serviceIncomeData?.results?.data?.service_income && serviceIncomeData.results.data.service_income.map((service_income, index) => (

            <tr
              key={service_income.id}
              onClick={() => handleRowClick(service_income.id)}
              className="hover:bg-gray-200 cursor-pointer"
            >
              <td className="border-gray-800 border-r border-b p-1">

                {service_income.serial_number}

              </td>
              <td className="border-gray-800 border-r border-b p-1">

                {service_income.date}

              </td>
              <td className="border-gray-800 border-r border-b p-1">

                {capitalizeFirstLetter(service_income.details.type)}

              </td>
              <td className="border-gray-800 border-r border-b p-1" colSpan={2}>
                <ul className="flex flex-wrap gap-3">
                  {service_income.details.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <i className="text-sm">({service_income.description})</i>

              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">

                {service_income.details.total_amount}

              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">

                {service_income.details.total_quantity}

              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">

                {service_income.details.amount_due > 0 ? service_income.details.amount_due : '-'}

              </td>
            </tr>))}
            {serviceIncomeData?.results?.data?.totals &&
            <tr className='text-right font-bold bg-gray-300'>
              <td className='border-gray-800 border-r border-b p-1' colSpan={5}>Total</td>
              <td className='border-gray-800 border-r border-b p-1'>
                {serviceIncomeData?.results?.data?.totals?.amount}
              </td>
              <td className='border-gray-800 border-r border-b p-1'>{serviceIncomeData?.results?.data?.totals?.quantity}</td>
              <td className='border-gray-800 border-r border-b p-1'>{serviceIncomeData?.results?.data?.totals?.amount_due}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  )
}

export default ServiceIncome
