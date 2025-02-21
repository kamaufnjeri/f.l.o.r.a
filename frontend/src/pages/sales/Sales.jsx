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

const Sales = () => {
  const [openDateModal, setOpenDateModal] = useState(false);
  const { currentOrg } = useAuth();
  const [header, setHeader] = useState('Sales')

  const [searchItem, setSearchItem] = useState({
    name: '',
    search: '',
    sales: '',
    date: '',
    sortBy: '',
  })
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();


  const handleRowClick = (salesId) => {
    navigate(`/dashboard/${orgId}/sales/${salesId}`);
  };


  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }


  const [selectOptions, setSelectOptions] = useState([
    { name: "All", value: "all" },
    { name: "Invoices", value: "is_invoices" },
    { name: "Regular", value: "is_not_invoices" },
  ])
  const { orgId } = useParams();
  const [sales, setSales] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newSalesData = await getItems(`${orgId}/sales`, `?paginate=true`);
    setSalesData(newSalesData);
    setHeader('Sales')
  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem(prev => ({ ...prev, name: e.target.value, search: '' }));
    const queyParamsUrl = getQueryParams({
      type: 'sales',
      paginate: false,
      search: e.target.value,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.sales
    })

    const newSales = await getItems(`${orgId}/sales`, queyParamsUrl);
    setSales(newSales)
  }
  const handleSalesChange = async (e) => {
    setSearchItem(prev => ({ ...prev, sales: e.target.value, search: '' }));
    const queyParamsUrl = getQueryParams({
      type: 'sales',
      paginate: true,
      search: '',
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: e.target.value
    })

    const newSalesData = await getItems(`${orgId}/sales`, queyParamsUrl);
    setSalesData(newSalesData);
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
        type: 'sales',
        paginate: true,
        search: '',
        date: e.target.value,
        sortBy: searchItem.sortBy,
        typeValue: searchItem.sales
      })
      const newSalesData = await getItems(`${orgId}/sales`, queyParamsUrl);
      setSalesData(newSalesData);
      setPageNo(1);
    }


  }
  const handleSortsChange = async (e) => {
    setSearchItem(prev => ({ ...prev, sortBy: e.target.value, search: '' }));
    const queyParamsUrl = getQueryParams({
      type: 'sales',
      paginate: true,
      search: '',
      date: searchItem.date,
      sortBy: e.target.value,
      typeValue: searchItem.sales
    })
    const newSalesData = await getItems(`${orgId}/sales`, queyParamsUrl);
    setSalesData(newSalesData);
    setPageNo(1);

  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const queyParamsUrl = getQueryParams({
      type: 'sales',
      paginate: true,
      search: searchItem.name,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.sales
    })
    const newSalesData = await getItems(`${orgId}/sales`, queyParamsUrl);
    setSalesData(newSalesData);
    setPageNo(1);
    setHeader(`Sales matching '${searchItem.name}'`)
    setSearchItem(prev => ({ ...prev, name: '', search: prev.name }))
  }

  const nextPage = async () => {
    try {
      const response = await api.get(salesData.next);
      if (response.status == 200) {
        setSalesData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching sales`);
    }
  }

  const previousPage = async () => {

    try {
      const response = await api.get(salesData.previous);
      if (response.status == 200) {
        setSalesData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching Sales`);
    }
  }
  const downloadPDF = () => {
    const querlParams = getQueryParams({
      type: 'sales',
      paginate: false,
      search: searchItem.search,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.sales
    });
    const url = `/${orgId}/sales/download/${querlParams}`;
    downloadListPDF(url, 'Sales')
  }

  return (
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setSalesData}
        setPageNo={setPageNo}
        type='sales'
      />
      <div className='flex flex-row w-full'>
        <form onSubmit={handleSubmit} className='grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 self-start w-full text-black items-center gap-2 shadow-md rounded-md p-2'>
          <div className='grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-2 relative col-span-2'>
            <input type='name' className='h-10 border border-gray-800 rounded-md outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter sale number or description' value={searchItem.name} onChange={e => handleChange(e)} />

            <TypesFilter searchItem={searchItem} selectOptions={selectOptions} type='sales' handleTypesChange={handleSalesChange} />

            <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />

            <SortFilter searchItem={searchItem} handleSortsChange={handleSortsChange} />

            {sales?.sales?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {sales?.sales?.map((sale) => (<Link to={`${sale.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{sale.serial_number}</Link>))}
            </div>}

          </div>
          <div className='grid grid-cols-2 gap-2 '>
            <button type='submit' className='h-10 w-[100px] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>

            <div className='flex items-center justify-center place-self-end'>
              <div className={`rounded-md p-1 bg-neutral-200 relative
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

                <button type='button' className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={(e) => {
                  e.stopPropagation();
                  downloadPDF();
                  }}>
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
      <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

      <div className='flex flex-row items-center justify-between w-full'>
        <FormHeader header={header} />
        {salesData && <PrevNext pageNo={pageNo} data={salesData} previousPage={previousPage} nextPage={nextPage} className='w-full' />}

      </div>
      <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>
            <th className='p-1 border-r border-b border-gray-800'>Sale #</th>
            <th className='p-1 border-r border-b border-gray-800'>Date</th>
            <th className='p-1 border-r border-b border-gray-800'>Type</th>
            <th className='p-1 border-r border-b border-gray-800' colSpan={2}>Items</th>
            <th className='p-1 border-r border-b border-gray-800'>Total Amount ({currentOrg?.currency})</th>
            <th className='p-1 border-r border-b border-gray-800'>Total Quantity</th>
            <th className='p-1 border-r border-b border-gray-800'>Due Amount ({currentOrg?.currency})</th>

          </tr>


        </thead>
        <tbody>
          {salesData?.results?.data?.sales && salesData.results.data.sales.map((sale, index) => (

            <tr
              key={sale.id}
              onClick={() => handleRowClick(sale.id)}
              className="hover:bg-gray-200 cursor-pointer"
            >
              <td className="border-gray-800 border-r border-b p-1">
               
                  {sale.serial_number}
                
              </td>
              <td className="border-gray-800 border-r border-b p-1">
               
                  {sale.date}
                
              </td>
              <td className="border-gray-800 border-r border-b p-1">
               
                  {capitalizeFirstLetter(sale.details.type)}
                
              </td>
              <td className="border-gray-800 border-r border-b p-1" colSpan={2}>
                  <ul className="flex flex-wrap gap-3">
                    {sale.details.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <i className="text-sm">({sale.description})</i>
                
              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">
               
                  {sale.details.total_amount}
                
              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">
               
                  {sale.details.total_quantity}
                
              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">
               
                  {sale.details.amount_due > 0 ? sale.details.amount_due : '-'}
                
              </td>
            </tr>))}
          {salesData?.results?.data?.totals &&
            <tr className='text-right font-bold bg-gray-300'>
              <td className='border-gray-800 border-r border-b p-1' colSpan={5}>Total</td>
              <td className='border-gray-800 border-r border-b p-1'>
                {salesData?.results?.data?.totals?.amount}
              </td>
              <td className='border-gray-800 border-r border-b p-1'>{salesData?.results?.data?.totals?.quantity}</td>
              <td className='border-gray-800 border-r border-b p-1'>{salesData?.results?.data?.totals?.amount_due}</td>
            </tr>
          }
        </tbody>
      </table>
      </div>
    </div>
  )
}

export default Sales
