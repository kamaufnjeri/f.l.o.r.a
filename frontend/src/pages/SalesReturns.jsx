import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, returnsQueryParams } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { dateOptions, sortOptions } from '../lib/constants';
import FromToDateModal from '../components/modals/FromToDateModal';
import DateFilter from '../components/filters/DateFilter';
import SortFilter from '../components/filters/SortFilter';


const SalesReturns = () => {
  const [openDateModal, setOpenDateModal] = useState(false);

  const [searchItem, setSearchItem] = useState({
    name: '',
    date: '',
    sortBy: '',
  })


  const [salesReturns, setSalesReturns] = useState([]);
  const [salesReturnsData, setSalesReturnsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newSalesReturnsData = await getItems('sales_returns', `?paginate=true`);
    setSalesReturnsData(newSalesReturnsData);
  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem({ ...searchItem, name: e.target.value });
    const queyParamsUrl = returnsQueryParams({
      paginate: false,
      search: e.target.value,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
  })

    console.log(queyParamsUrl)
    const newSalesReturns = await getItems('sales_returns', queyParamsUrl);
    setSalesReturns(newSalesReturns)
  }
  const showModal = (setOpenModal) => {
    setOpenModal(true);
  };
  const handleDatesChange = async (e) => {
    if (e.target.value === '*') {
      showModal(setOpenDateModal);
    } else {

      setSearchItem({ ...searchItem, date: e.target.value });
      const queyParamsUrl = returnsQueryParams({
        paginate: true,
        search: '',
        date: e.target.value,
        sortBy: searchItem.sortBy,
      })
      const newSalesReturnsData = await getItems('sales_returns', queyParamsUrl);
      setSalesReturnsData(newSalesReturnsData);
      setPageNo(1);
    }


  }
  const handleSortsChange = async (e) => {
    setSearchItem({ ...searchItem, sortBy: e.target.value });
    const queyParamsUrl = returnsQueryParams({
      paginate: true,
      search: '',
      date: searchItem.date,
      sortBy: e.target.value,
    })
    const newSalesReturnsData = await getItems('sales_returns', queyParamsUrl);
    setSalesReturnsData(newSalesReturnsData);
    setPageNo(1);

  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const queyParamsUrl = returnsQueryParams({
      paginate: true,
      search: searchItem.name,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
    })
    const newSalesReturnsData = await getItems('sales_returns', queyParamsUrl);
    setSalesReturnsData(newSalesReturnsData);
    setPageNo(1);
    setSearchItem({ ...searchItem, name: '' })
  }

  const nextPage = async () => {
    try {
      const response = await axios.get(salesReturnsData.next);
      if (response.status == 200) {
        setSalesReturnsData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching salesReturns`);
    }
  }

  const previousPage = async () => {

    try {
      const response = await axios.get(salesReturnsData.previous);
      if (response.status == 200) {
        setSalesReturnsData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching SalesReturns`);
    }
  }

  return (
    <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setSalesReturnsData}
        setPageNo={setPageNo}
        type='sales_returns'
      />
      <FormHeader header='Sales Returns List' />
      <div className='flex flex-row w-full items-center justify-between'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-2'>
          <div className='w-[90%] relative h-[90%] flex flex-row gap-2'>
            <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter sales number or description' value={searchItem.name} onChange={e => handleChange(e)} />
            <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
              
              <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <DateFilter handleDatesChange={handleDatesChange} searchItem={searchItem}/>

              </div>
              <div className='w-[30%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <SortFilter handleSortsChange={handleSortsChange} searchItem={searchItem}/>
              </div>
            </div>
            {salesReturns.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {salesReturns.map((sales_return) => (<Link to={`/sales/${sales_return.sales}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{sales_return.sales_no}</Link>))}
            </div>}
          </div>

          <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
        </form>

      </div>


      <div className='overflow-auto custom-scrollbar flex flex-col max-h-[75%] flex-1 w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Return #</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Sales #</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
          <span className='w-[35%] border-gray-800 border-r-2 p-1'>Items</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Return Quantity</span>
        </div>
        {salesReturnsData?.results?.data && salesReturnsData.results.data.map((sales_return, index) => (
          <Link to={`/sales/${sales_return.sales}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={sales_return.id}>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{sales_return.sales_no}</span>
            <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{sales_return.date}</span>
            <span className='w-[55%] flex flex-col border-gray-800 border-r-2'>
              <ul className='flex flex-col w-full'>
                {sales_return.return_entries.map((entry, index) => (
                  <li key={index} className='w-full flex flex-row'>
                    <span className='border-gray-800 border-r-2 p-1 w-[63.8%]'>{entry.stock_name}</span>
                    <span className='p-1 w-[36.2%] border-gray-800 border-b-2'>
                      {entry.return_quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <span>
              <i className='text-sm'>({sales_return.description})</i>
              </span>
            </span>
           
          </Link>
        ))}
      </div>
      <div className='absolute bottom-1 flex flex-row gap-4 justify-center items-center cursor-pointer z-10'>
        {salesReturnsData.previous && <FaAngleDoubleLeft onClick={previousPage} className='text-2xl' />}
        <span className='rounded-lg bg-gray-800 text-white h-8 flex items-center justify-center text-xl w-8'>{pageNo}</span>
        {salesReturnsData.next && <FaAngleDoubleRight onClick={nextPage} className='text-2xl' />}
      </div>
    </div>
  )
}

export default SalesReturns
