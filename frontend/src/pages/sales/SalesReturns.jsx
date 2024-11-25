import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { getItems, returnsQueryParams } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useParams } from 'react-router-dom';
import FromToDateModal from '../../components/modals/FromToDateModal';
import DateFilter from '../../components/filters/DateFilter';
import SortFilter from '../../components/filters/SortFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';


const SalesReturns = () => {
  const [openDateModal, setOpenDateModal] = useState(false);

  const [searchItem, setSearchItem] = useState({
    name: '',
    date: '',
    sortBy: '',
    search: ''
  })
  const { orgId } = useParams();
  const [salesReturns, setSalesReturns] = useState([]);
  const [salesReturnsData, setSalesReturnsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }

  const getData = async () => {
    const newSalesReturnsData = await getItems(`${orgId}/sales_returns`, `?paginate=true`);
    setSalesReturnsData(newSalesReturnsData);
  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem(prev => ({ ...prev, name: e.target.value, search: '' }));
    const queyParamsUrl = returnsQueryParams({
      paginate: false,
      search: e.target.value,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
    })

    console.log(queyParamsUrl)
    const newSalesReturns = await getItems(`${orgId}/sales_returns`, queyParamsUrl);
    setSalesReturns(newSalesReturns)
  }
  const showModal = (setOpenModal) => {
    setOpenModal(true);
  };
  const handleDatesChange = async (e) => {
    if (e.target.value === '*') {
      showModal(setOpenDateModal);
    } else {

      setSearchItem(prev => ({ ...prev, date: e.target.value, search: '' }));
      const queyParamsUrl = returnsQueryParams({
        paginate: true,
        search: '',
        date: e.target.value,
        sortBy: searchItem.sortBy,
      })
      const newSalesReturnsData = await getItems(`${orgId}/sales_returns`, queyParamsUrl);
      setSalesReturnsData(newSalesReturnsData);
      setPageNo(1);
    }


  }
  const handleSortsChange = async (e) => {
    setSearchItem(prev => ({ ...prev, sortBy: e.target.value, search: '' }));
    const queyParamsUrl = returnsQueryParams({
      paginate: true,
      search: '',
      date: searchItem.date,
      sortBy: e.target.value,
    })
    const newSalesReturnsData = await getItems(`${orgId}/sales_returns`, queyParamsUrl);
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
    const newSalesReturnsData = await getItems(`${orgId}/sales_returns`, queyParamsUrl);
    setSalesReturnsData(newSalesReturnsData);
    setPageNo(1);
    setSearchItem(prev => ({ ...prev, name: '', search: prev.name }))
  }

  const nextPage = async () => {
    try {
      const response = await api.get(salesReturnsData.next);
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
      const response = await api.get(salesReturnsData.previous);
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

  const downloadPDF = () => {
    const querlParams = returnsQueryParams({
      paginate: false,
      search: searchItem.search,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
    });
    const url = `/${orgId}/sales_returns/download/${querlParams}`;
    downloadListPDF(url, 'Sales Returns')
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
      <FormHeader header='Sales Returns' />
      <div className='flex flex-row w-full items-center justify-between'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-2'>
          <div className='w-[90%] relative h-[90%] flex flex-row gap-2'>
            <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter sales number or description' value={searchItem.name} onChange={e => handleChange(e)} />
            <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>

              <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <DateFilter handleDatesChange={handleDatesChange} searchItem={searchItem} />

              </div>
              <div className='w-[30%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <SortFilter handleSortsChange={handleSortsChange} searchItem={searchItem} />
              </div>
            </div>
            {salesReturns.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {salesReturns.map((sales_return) => (<Link to={`/dashboard/${orgId}/sales/${sales_return.sales}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{sales_return.sales_no}</Link>))}
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


      <div className='overflow-auto custom-scrollbar flex flex-col max-h-[75%] flex-1 w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Return #</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Sales #</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
          <span className='w-[55%] flex flex-col border-gray-800 border-r-2'>

          <div className='w-full flex '>
              <span className='border-gray-800 border-r-2 p-1 w-[46%]'>Items</span>
             
              <span className='p-1 w-[18%] border-gray-800 border-r-2'>
               RReturn Price
              </span>
              <span className='p-1 w-[18%] border-gray-800 border-r-2'>
                Quantity
              </span>
              <span className='p-1 w-[18%] border-gray-800'>
                Total
              </span>
            </div>

          </span>
        </div>
        {salesReturnsData?.results?.data && salesReturnsData.results.data.map((sales_return, index) => (
          <Link to={`/dashboard/${orgId}/sales/${sales_return.sales}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={sales_return.id}>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{sales_return.sales_no}</span>
            <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{sales_return.date}</span>
            <span className='w-[55%] flex flex-col border-gray-800 border-r-2'>
            <ul className='flex flex-col w-full'>
                {sales_return.return_entries.map((entry, index) => (
                  <li key={index} className='w-full flex'>
                    <span className='border-gray-800 border-r-2 border-b-2 p-1 w-[46%]'>{entry.stock_name}</span>
                    
                    <span className='p-1 w-[18%] border-gray-800 border-b-2  border-r-2'>
                      {entry.return_price}
                    </span>
                    <span className='p-1 w-[18%] border-gray-800 border-b-2 border-r-2'>
                      {entry.quantity}
                    </span>
                    <span className='p-1 w-[18%] border-gray-800 border-b-2'>
                      {
                        entry.return_quantity * entry.return_price
                      }
              </span>
                  </li>
                ))}
              </ul>
              <div className='w-full flex flex-row border-gray-800'>

                  <span className='border-gray-800 border-r-2 p-1 w-[46%]'><i className='text-sm'>({sales_return.description})</i></span>
                  <span className='p-1 w-[18%] border-gray-800 underline border-r-2'>Total</span>
                  <span className='p-1 w-[18%] border-gray-800 underline border-r-2'>
                    { sales_return?.items_data?.total_quantity}
                  </span>
                  <span className='p-1 w-[18%] border-gray-800 underline'>
                    { sales_return?.items_data?.total_amount}
                  </span>

              </div>
            </span>

          </Link>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={salesReturnsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

    </div>
  )
}

export default SalesReturns
