import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { getItems } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Sales = () => {
    const [searchItem, setSearchItem] = useState({
        name: '',
        sales: 'all',
      })
    
      const [selectOptions, setSelectOptions] = useState([
        { name: "All", value: "all" },
        { name: "Sales with invoices", value: "is_invoices" },
        { name: "Sales without invoices", value: "is_not_invoices" },
      ])
    
      const [sales, setSales] = useState([]);
      const [salesData, setSalesData] = useState([]);
      const [pageNo, setPageNo] = useState(1);
      const getData = async () => {
        const newSalesData = await getItems('sales', `?paginate=true`);
        setSalesData(newSalesData);
      }
      useEffect(() => {
    
        getData();
      }, [])
      const handleChange = async (e) => {
        setSearchItem({ ...searchItem, name: e.target.value });
        const queyParamsUrl = `?search=${e.target.value}&sales=${searchItem.sales}`
       
        console.log(queyParamsUrl)
        const newSales = await getItems('sales', queyParamsUrl);
        setSales(newSales)
      }
      const handleSelectChange = async (e) => {
        setSearchItem({ ...searchItem, sales: e.target.value });
        const queyParamsUrl = `?paginate=true&search=${searchItem.name}&sales=${e.target.value}`
    
        console.log(searchItem)
        console.log(queyParamsUrl)
    
        const newSalesData = await getItems('sales', queyParamsUrl);
        setSalesData(newSalesData);
        setPageNo(1);
    
      }
      const handleSubmit = async (e) => {
        e.preventDefault();
        const queyParamsUrl = `?paginate=true&search=${searchItem.name}&sales=${searchItem.sales}`
        console.log(queyParamsUrl)
        const newSalesData = await getItems('sales', queyParamsUrl);
        setSalesData(newSalesData);
        setPageNo(1);
        setSearchItem({ ...searchItem, name : '' })
      }
    
      const nextPage = async () => {
        try {
          const response = await axios.get(salesData.next);
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
          const response = await axios.get(salesData.previous);
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
    
      return (
        <div className='flex-1 flex flex-col items-center justify-center relative h-full mr-2'>
          <FormHeader header='Sales List' />
          <div className='flex flex-row w-full items-center justify-between'>
            <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-[80%] text-black items-center gap-2'>
              <div className='w-[70%] relative h-[90%] flex flex-row gap-2'>
                <input type='name' className='w-[60%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter serial number or description' value={searchItem.name} onChange={e => handleChange(e)} />
                <div className='p-1 cursor-pointer w-[40%] h-[90%] font-bold rounded-md border-2 border-gray-800'>
                  <select className='border-none outline-none' value={searchItem.sales} onChange={(e) => handleSelectChange(e)}>
                    {selectOptions.map((option, index) => (
                      <option key={index} value={option.value}>{option.name}</option>
                    ))}
                  </select>
    
                </div>
                {sales.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>
    
                  {sales.map((sale) => (<span className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{sale.serial_number}</span>))}
                </div>}
              </div>
    
              <button className='w-[30%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
            </form>
    
          </div>
    
    
          <div className='overflow-auto custom-scrollbar flex flex-col flex-1 h-full w-full m-2'>
            <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
              <span className='w-[20%] border-gray-800 border-r-2 p-1'>Serial No.</span>
              <span className='w-[20%] border-gray-800 border-r-2 p-1 '>Date</span>
              <span className='w-[40%] border-gray-800 border-r-2 p-1'>Description</span>
              <span className='w-[20%] border-gray-800 border-r-2 p-1'>Amount Due</span>
            </div>
            {salesData?.results?.data && salesData.results.data.map((sale, index) => (
              <div className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={sale.id}>
                <span className='w-[20%] border-gray-800 border-r-2 p-1'>{sale.serial_number}</span>
                <span className='w-[20%] border-gray-800 border-r-2 p-1'>{sale.date}</span>
                <span className='w-[40%] border-gray-800 border-r-2 p-1'>{sale.description}</span>
                <span className='w-[20%] border-gray-800 border-r-2 p-1'>{sale.invoice ? sale.invoice.amount_due : ''}</span>
    
              </div>
            ))}
          </div>
          <div className='absolute bottom-5 flex flex-row gap-4 justify-center items-center cursor-pointer z-10'>
            {salesData.previous && <FaAngleDoubleLeft onClick={previousPage} className='text-2xl' />}
            <span className='rounded-lg bg-gray-800 text-white h-8 flex items-center justify-center text-xl w-8'>{pageNo}</span>
            {salesData.next && <FaAngleDoubleRight onClick={nextPage} className='text-2xl' />}
          </div>
        </div>
      )
}

export default Sales
