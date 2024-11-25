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
import DateFilter from '../../components/filters/DateFilter';
import SortFilter from '../../components/filters/SortFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';

const Sales = () => {
  const [openDateModal, setOpenDateModal] = useState(false);
  const [searchItem, setSearchItem] = useState({
    name: '',
    search: '',
    sales: '',
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

  const { orgId } = useParams();
  const [selectOptions, setSelectOptions] = useState([
    { name: "All", value: "all" },
    { name: " Invoice Sales", value: "is_invoices" },
    { name: "Regular Sales", value: "is_not_invoices" },
  ])

  const [sales, setSales] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newSalesData = await getItems(`${orgId}/sales`, `?paginate=true`);
    setSalesData(newSalesData);
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
    setSearchItem(prev => ({ ...prev, search: prev.name, name: '' }))
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
    console.log(url)
    downloadListPDF(url, 'Sales')
  }

  return (
    <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setSalesData}
        setPageNo={setPageNo}
        type='sales'
      />
      <FormHeader header='Sales' />
      <div className='flex flex-row w-full items-center justify-between'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-2'>
          <div className='w-[90%] relative h-[90%] flex flex-row gap-2'>
            <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter sales number or description' value={searchItem.name} onChange={e => handleChange(e)} />
            <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
              <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <TypesFilter searchItem={searchItem} selectOptions={selectOptions} type='sales' handleTypesChange={handleSalesChange} />

              </div>
              <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />

              </div>
              <div className='w-[30%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <SortFilter searchItem={searchItem} handleSortsChange={handleSortsChange} />
              </div>
            </div>
            {sales.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {sales.map((sale) => (<Link to={`${sale.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{sale.serial_number}</Link>))}
            </div>}
          </div>

          <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
        </form>
        <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
           
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
              Download
            </button>
          </div>

      </div>


      <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Sales #</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Date</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
          <span className='w-[35%] border-gray-800 border-r-2 p-1'>Items</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Total Amount</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Total Quantity</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Due amount</span>

        </div>
        {salesData?.results?.data && salesData.results.data.map((sale, index) => (
          <Link to={`${sale.id}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={sale.id}>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{sale.serial_number}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{sale.date}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(sale.items_data.type)}</span>

            <span className='w-[35%] border-gray-800 border-r-2 p-1'>
              <ul className='flex flex-wrap gap-3'>
                {sale.items_data.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <i className='text-sm'>({sale.description})</i>
            </span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{sale.items_data.total_amount}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{sale.items_data.total_quantity}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{sale.items_data.amount_due > 0 ? sale.items_data.amount_due : '-'}</span>


          </Link>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={salesData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>

    </div>
  )
}

export default Sales
