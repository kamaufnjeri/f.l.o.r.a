import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import {  getItems } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft, FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import PrevNext from '../components/shared/PrevNext';
import { downloadListPDF } from '../lib/download/downloadList';


const SingleSalesReturns = () => {
    const {id, orgId} = useParams();
  const [salesReturnsData, setSalesReturnsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [title, setTitle] = useState('')

  const [isVisible, setIsVisible] = useState(false);
  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }


  const getData = async () => {
    const newSalesReturnsData = await getItems(`${orgId}/sales/${id}/sales_returns`, `?paginate=true`);
    setSalesReturnsData(newSalesReturnsData);
    setTitle(`Sales Returns for ${newSalesReturnsData?.results?.data[0].sales_no}`)

  }
  useEffect(() => {

    getData();
  }, [])
  
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
  const hideJournalEntries = () => {
    setShowJournalEntries(!showJournalEntries)
    if (buttonName === 'Show Journal Entries') {
      SetButtonName('Hide Journal Entries')
    } else {
      SetButtonName('Show Journal Entries')
    }
  }
  const downloadPDF = () => {
    const url = `${orgId}/sales/${id}/sales_returns/download/`
    downloadListPDF(url, title)
  }

  return (
    <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
      
      <FormHeader header={title} />
      <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
            <button onClick={hideJournalEntries} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[90%] p-1 rounded-sm'>
              {buttonName}
            </button>
           
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
              Download
            </button>
          
          </div>
      
      
      <div className='overflow-auto custom-scrollbar flex flex-col max-h-[75%] flex-1 w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Return #</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
          <span className='w-[70%] flex flex-col border-gray-800 border-r-2'>

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
        {salesReturnsData?.results?.data && salesReturnsData.results.data.map((sales_return, index) => (
          <span className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={sales_return.id}>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{sales_return.date}</span>
            <span className='w-[70%] flex flex-col border-gray-800 border-r-2'>
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
              {showJournalEntries && <div className='p-1 flex flex-col w-full'>
            <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
              <span className='w-full border-gray-800 border-r-2 flex flex-col'>
                <div className='w-full flex flex-row flex-1'>
                  <span className='w-[60%] p-1'>Account</span>
                  <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit</span>
                  <span className='w-[20%] border-gray-800 border-l-2 p-1'>Credit</span>
                </div>

              </span>

            </div>
            <div className='w-full flex flex-row font-bold border-b-2 border-gray-800 border-l-2'>
              <span className='w-full border-gray-800 border-r-2 flex flex-col'>
                {sales_return.journal_entries && sales_return.journal_entries.map((entry, index) =>
                  <div className={`flex flex-row flex-1`} key={index}>
                    <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                  </div>)}
                <div className={`flex flex-row flex-1`}>
                  <i className='text-sm w-[60%] p-1'>({sales_return.description})</i>
                  <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{sales_return?.journal_entries_total?.debit_total}</span>
                  <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{sales_return?.journal_entries_total?.debit_total}</span>
                </div>
              </span>
            </div>
          </div>}
              
            </span>
           
          </span>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={salesReturnsData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>

    </div>
  )
}

export default SingleSalesReturns
