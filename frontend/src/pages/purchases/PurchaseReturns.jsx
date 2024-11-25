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


const PurchaseReturns = () => {
  const [openDateModal, setOpenDateModal] = useState(false);

  const [searchItem, setSearchItem] = useState({
    name: '',
    date: '',
    sortBy: '',
    search: '',
  })
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [purchaseReturnsData, setPurchaseReturnsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const { orgId } = useParams();
  const [isVisible, setIsVisible] = useState(false);

  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }

  const getData = async () => {
    const newPurchaseReturnsData = await getItems(`${orgId}/purchase_returns`, `?paginate=true`);
    setPurchaseReturnsData(newPurchaseReturnsData);
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
    const newPurchaseReturns = await getItems(`${orgId}/purchase_returns`, queyParamsUrl);
    setPurchaseReturns(newPurchaseReturns)
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
      const newPurchaseReturnsData = await getItems(`${orgId}/purchase_returns`, queyParamsUrl);
      setPurchaseReturnsData(newPurchaseReturnsData);
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
    const newPurchaseReturnsData = await getItems(`${orgId}/purchase_returns`, queyParamsUrl);
    setPurchaseReturnsData(newPurchaseReturnsData);
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
    const newPurchaseReturnsData = await getItems(`${orgId}/purchase_returns`, queyParamsUrl);
    setPurchaseReturnsData(newPurchaseReturnsData);
    setPageNo(1);
    setSearchItem(prev => ({ ...prev, name: '', search: prev.name }))
  }

  const nextPage = async () => {
    try {
      const response = await api.get(purchaseReturnsData.next);
      if (response.status == 200) {
        setPurchaseReturnsData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching purchaseReturns`);
    }
  }

  const previousPage = async () => {

    try {
      const response = await api.get(purchaseReturnsData.previous);
      if (response.status == 200) {
        setPurchaseReturnsData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching Purchase Returns`);
    }
  }
 const downloadPDF = () => {
    const querlParams = returnsQueryParams({
      paginate: false,
      search: searchItem.search,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
    });
    const url = `/${orgId}/purchase_returns/download/${querlParams}`;
    downloadListPDF(url, 'Purchase Returns')
  }

  return (
    <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setPurchaseReturnsData}
        setPageNo={setPageNo}
        type='purchase_returns'
      />
      <FormHeader header='Purchase Returns' />
      <div className='flex flex-row w-full items-center justify-between'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-2'>
          <div className='w-[90%] relative h-[90%] flex flex-row gap-2'>
            <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter purchase number or description' value={searchItem.name} onChange={e => handleChange(e)} />
            <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>

              <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <DateFilter handleDatesChange={handleDatesChange} searchItem={searchItem} />

              </div>
              <div className='w-[30%] rounded-md border-2 border-gray-800  cursor-pointer'>
                <SortFilter handleSortsChange={handleSortsChange} searchItem={searchItem} />
              </div>
            </div>
            {purchaseReturns.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {purchaseReturns.map((purchase_return) => (<Link to={`/dashboard/${orgId}/purchases/${purchase_return.purchase}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{purchase_return.purchase_no}</Link>))}
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
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Purchase #</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
          <span className='w-[55%] flex flex-col border-gray-800 border-r-2'>

            <div className='w-full flex '>
              <span className='border-gray-800 border-r-2 p-1 w-[46%]'>Items</span>
             
              <span className='p-1 w-[18%] border-gray-800 border-r-2'>
               Return Price
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
        {purchaseReturnsData?.results?.data && purchaseReturnsData.results.data.map((purchase_return, index) => (
          <Link to={`/dashboard/${orgId}/purchases/${purchase_return.purchase}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={purchase_return.id}>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{purchase_return.purchase_no}</span>
            <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{purchase_return.date}</span>
            <span className='w-[55%] flex flex-col border-gray-800 border-r-2'>
              <ul className='flex flex-col w-full'>
                {purchase_return.return_entries.map((entry, index) => (
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

                  <span className='border-gray-800 border-r-2 p-1 w-[46%]'><i className='text-sm'>({purchase_return.description})</i></span>
                  <span className='p-1 w-[18%] border-gray-800 underline border-r-2'>Total</span>
                  <span className='p-1 w-[18%] border-gray-800 underline border-r-2'>
                    { purchase_return?.items_data?.total_quantity}
                  </span>
                  <span className='p-1 w-[18%] border-gray-800 underline'>
                    { purchase_return?.items_data?.total_amount}
                  </span>

              </div>
            </span>

          </Link>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={purchaseReturnsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

    </div>
  )
}

export default PurchaseReturns
