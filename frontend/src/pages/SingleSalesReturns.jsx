import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import {  getItems } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';


const SingleSalesReturns = () => {
    const {id} = useParams();
  const [salesReturnsData, setSalesReturnsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newSalesReturnsData = await getItems(`sales/${id}/sales_returns`, `?paginate=true`);
    setSalesReturnsData(newSalesReturnsData);
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

  return (
    <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
      
      <FormHeader header='Sales Returns List' />
      
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

export default SingleSalesReturns
