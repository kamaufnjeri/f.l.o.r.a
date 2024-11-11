import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, invoiceBillQueryParam, replaceDash } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft, FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { Link, useParams } from 'react-router-dom';
import {  dueDaysOptions,  statusOptions } from '../lib/constants';
import TypesFilter from '../components/filters/TypesFilter';
import PrevNext from '../components/shared/PrevNext';
import { downloadListPDF } from '../lib/download/downloadList';

const Invoices = () => {
  const [searchItem, setSearchItem] = useState({
    name: '',
    dueDays: 'all',
    status: 'all', 
    search: ''
  })

  const { orgId } = useParams();
  const [invoices, setInvoices] = useState([]);
  const [invoicesData, setInvoicesData] = useState([]);
  const [pageNo, setPageNo] = useState(1);

  const [isVisible, setIsVisible] = useState(false);

  const openDropDown = () => {
      setIsVisible(true);
  }

  const closeDropDown = () => {
      setIsVisible(false);
  }

  const getData = async () => {
    const newinvoicesData = await getItems(`${orgId}/invoices`, `?paginate=true`);
    setInvoicesData(newinvoicesData);
  }
  useEffect(() => {

    getData();
  }, [])

  const handleChange = async (e) => {
        setSearchItem(prev => ({ ...prev, name: e.target.value, search: '' }));
    const queyParamsUrl = invoiceBillQueryParam({
      search: e.target.value,
      dueDays: searchItem.dueDays,
      status: searchItem.status,
      paginate: false
  })

    const newinvoices = await getItems(`${orgId}/invoices`, queyParamsUrl);
    setInvoices(newinvoices)
  }

  const handleDueDaysChange = async (e) => {
    setSearchItem(prev => ({ ...prev, dueDays: e.target.value, search: '' }));
    const queyParamsUrl = invoiceBillQueryParam({
        search: '',
        dueDays: e.target.value,
        status: searchItem.status, 
        paginate: true
    })

    const newinvoicesData = await getItems(`${orgId}/invoices`, queyParamsUrl);
    setInvoicesData(newinvoicesData);
    setPageNo(1);

  }
 
  const handleStatusChange = async (e) => {
   
    setSearchItem(prev => ({ ...prev, status: e.target.value, search: '' }));
    const queyParamsUrl = invoiceBillQueryParam({
        search: '',
        dueDays: searchItem.dueDays,
        status: e.target.value,
        paginate: true
    })
      const newinvoicesData = await getItems(`${orgId}/invoices`, queyParamsUrl);
      setInvoicesData(newinvoicesData);
      setPageNo(1);
    }


  
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const queyParamsUrl = invoiceBillQueryParam({
        search: searchItem.name,
        dueDays: searchItem.dueDays,
        status: searchItem.status,
        paginate: true
    })
    const newinvoicesData = await getItems(`${orgId}/invoices`, queyParamsUrl);
    setInvoicesData(newinvoicesData);
    setPageNo(1);
    setSearchItem(prev => ({ ...prev, name: '', search: prev.name }))
  }

  const nextPage = async () => {
    try {
      const response = await api.get(invoicesData.next);
      if (response.status == 200) {
        setInvoicesData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching invoices`);
    }
  }

  const previousPage = async () => {

    try {
      const response = await api.get(invoicesData.previous);
      if (response.status == 200) {
        setInvoicesData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching invoices`);
    }
  }
  const downloadPDF = () => {
    const querlParams = invoiceBillQueryParam({
        paginate: false,
        search: searchItem.search,
        dueDays: searchItem.dueDays,
        status: searchItem.status,
    });
    const url = `/${orgId}/invoices/download/${querlParams}`;
    downloadListPDF(url, 'Invoices')
}
  return (
    <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
     
      <FormHeader header='Invoices' />
      <div className='flex flex-row w-full items-center justify-between'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-2'>
          <div className='w-[90%] relative h-[90%] flex flex-row gap-2'>
            <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter invoice number or customer' value={searchItem.name} onChange={e => handleChange(e)} />
            <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                               <TypesFilter searchItem={searchItem} handleTypesChange={handleDueDaysChange} selectOptions={dueDaysOptions} type='dueDays' title='due days'/>
                            </div>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                            <TypesFilter searchItem={searchItem} handleTypesChange={handleStatusChange} selectOptions={statusOptions} type='status' title='status'/>

                            </div>

                        </div>
            {invoices.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {invoices.map((invoice) => (<Link to={`/dashboard/${orgId}/${invoice?.invoice_data?.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{invoice.serial_number}</Link>))}
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
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Invoice #</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Due Date</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Type</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Customer</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Status</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Amount Due</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Amount Paid</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Due Days</span>

        </div>
        {invoicesData?.results?.data && invoicesData.results.data.map((invoice, index) => (
          <Link to={`/dashboard/${orgId}/${invoice?.invoice_data?.url}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={invoice.id}>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>{invoice.serial_number}</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{invoice.due_date}</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>{capitalizeFirstLetter(invoice.invoice_data.type)}</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>{invoice.customer_name}</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>{capitalizeFirstLetter(replaceDash(invoice.status))}</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{invoice.amount_due}</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>{invoice.amount_paid}</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>{invoice.invoice_data.due_days}</span>
          </Link>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={invoicesData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>

    </div>
  )
 }
        
export default  Invoices
