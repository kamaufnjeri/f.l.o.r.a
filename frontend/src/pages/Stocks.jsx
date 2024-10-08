import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { getItems } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import PrevNext from '../components/shared/PrevNext';


const Stocks = () => {
  const [searchItem, setSearchItem] = useState({
    name: ''
  })
  const [stocks, setStocks] = useState([]);
  const [stocksData, setStocksData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newStocksData = await getItems('stocks', `?paginate=true`);
    setStocksData(newStocksData);
}
  useEffect(() => {
   
    getData();
}, [])
  const handleChange = async (e) => {
    setSearchItem({ name: e.target.value });
    const newStocks = await getItems('stocks', `?search=${e.target.value}`);
    setStocks(newStocks)
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newStocksData = await getItems('stocks', `?search=${searchItem.name}&paginate=true`);
    setStocksData(newStocksData);
    setPageNo(1);
    setSearchItem({ name: '' })
  }

  const nextPage = async () => {
    try {
      const response = await axios.get(stocksData.next);
      if (response.status == 200) {
        setStocksData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching stocks`);
    }
  }

  const previousPage = async () => {
    
    try {
      const response = await axios.get(stocksData.previous);
      if (response.status == 200) {
        setStocksData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching stocks`);
    }
  }

  return (
    <div className='flex-1 flex flex-col items-center justify-center maincontainer-height mr-2'>
      <FormHeader header='Stocks List' />
      <div className='flex flex-row w-full items-center justify-between'>
      <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-[40%] border-2 border-gray-800 rounded-md text-black relative'>
        <input type='name' className='w-[70%] outline-none border-none p-2' placeholder='Search stocks by name' value={searchItem.name} onChange={e => handleChange(e)} />
        <button className='w-[30%] border-2 bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
        {stocks.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>
          {stocks.map((stock) => (<span className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{stock.name}</span>))}
        </div>}
      </form>
      <div onClick={getData} className='self-end p-1 cursor-pointer w-[10%] hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
        Reset
      </div>
      </div>
      

      <div className='overflow-auto custom-scrollbar flex flex-col h-[500px] w-full p-1'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>No.</span>
          <span className='w-[40%] border-gray-800 border-r-2 p-1 '>Name</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>Unit name</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Quantity</span>
        </div>
        {stocksData?.results?.data && stocksData.results.data.map((stock, index) => (
          <div className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={stock.id}>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}.</span>
          <span className='w-[40%] border-gray-800 border-r-2 p-1'>{stock.name}</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>{stock.unit_name}</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{stock.total_quantity} {stock.unit_alias}</span>
        </div>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={stocksData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>
    </div>
  )
}

export default Stocks
