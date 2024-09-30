import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Purchases = () => {
  const [searchItem, setSearchItem] = useState({
    name: '',
    purchases: 'all',
  })

  const [selectOptions, setSelectOptions] = useState([
    { name: "All", value: "all" },
    { name: "Bill Purchases", value: "is_bills" },
    { name: "Regular Purchases", value: "is_not_bills" },
  ])

  const [purchases, setPurchases] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newPurchasesData = await getItems('purchases', `?paginate=true`);
    setPurchasesData(newPurchasesData);
  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem({ ...searchItem, name: e.target.value });
    const queyParamsUrl = `?search=${e.target.value}&purchases=${searchItem.purchases}`
   
    console.log(queyParamsUrl)
    const newPurchases = await getItems('purchases', queyParamsUrl);
    setPurchases(newPurchases)
  }
  const handleSelectChange = async (e) => {
    setSearchItem({ ...searchItem, purchases: e.target.value });
    const queyParamsUrl = `?paginate=true&purchases=${e.target.value}`

    console.log(searchItem)
    console.log(queyParamsUrl)

    const newPurchasesData = await getItems('purchases', queyParamsUrl);
    setPurchasesData(newPurchasesData);
    setPageNo(1);

  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const queyParamsUrl = `?paginate=true&search=${searchItem.name}&purchases=${searchItem.purchases}`
    console.log(queyParamsUrl)
    const newPurchasesData = await getItems('purchases', queyParamsUrl);
    setPurchasesData(newPurchasesData);
    setPageNo(1);
    setSearchItem({ ...searchItem, name : '' })
  }

  const nextPage = async () => {
    try {
      const response = await axios.get(purchasesData.next);
      if (response.status == 200) {
        setPurchasesData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching purchases`);
    }
  }

  const previousPage = async () => {

    try {
      const response = await axios.get(purchasesData.previous);
      if (response.status == 200) {
        setPurchasesData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching Purchases`);
    }
  }

  return (
    <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
      <FormHeader header='Purchases List' />
      <div className='flex flex-row w-full items-center justify-between'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-[80%] text-black items-center gap-2'>
          <div className='w-[70%] relative h-[90%] flex flex-row gap-2'>
            <input type='name' className='w-[60%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter purchase number or description' value={searchItem.name} onChange={e => handleChange(e)} />
            <div className='p-1 cursor-pointer w-[40%] h-[90%] font-bold rounded-md border-2 border-gray-800'>
              <select className='border-none outline-none' value={searchItem.purchases} onChange={(e) => handleSelectChange(e)}>
                {selectOptions.map((option, index) => (
                  <option key={index} value={option.value}>{option.name}</option>
                ))}
              </select>

            </div>
            {purchases.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {purchases.map((purchase) => (<Link to={`/purchases/${purchase.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{purchase.serial_number}</Link>))}
            </div>}
          </div>

          <button className='w-[30%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
        </form>

      </div>


      <div className='overflow-auto custom-scrollbar flex flex-col max-h-[75%] flex-1 w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Purchase #</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Date</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
          <span className='w-[35%] border-gray-800 border-r-2 p-1'>Items</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Total Amount</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Total Quantity</span>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>Due Amount</span>


        </div>
        {purchasesData?.results?.data && purchasesData.results.data.map((purchase, index) => (
          <Link to={`/purchases/${purchase.id}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={purchase.id}>
            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{purchase.serial_number}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{purchase.date}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(purchase.items_data.type)}</span>
            <span className='w-[35%] border-gray-800 border-r-2 p-1 flex flex-col'>
              <ul className='flex flex-wrap gap-3'>
                {purchase.items_data.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <i className='text-sm'>({purchase.description})</i>
            </span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{purchase.items_data.total_amount}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{purchase.items_data.total_quantity}</span>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{ purchase.items_data.amount_due > 0 ? purchase.items_data.amount_due : '-' }</span>

          </Link>
        ))}
      </div>
      <div className='absolute bottom-1 flex flex-row gap-4 justify-center items-center cursor-pointer z-10'>
        {purchasesData.previous && <FaAngleDoubleLeft onClick={previousPage} className='text-2xl' />}
        <span className='rounded-lg bg-gray-800 text-white h-8 flex items-center justify-center text-xl w-8'>{pageNo}</span>
        {purchasesData.next && <FaAngleDoubleRight onClick={nextPage} className='text-2xl' />}
      </div>
    </div>
  )
}

export default Purchases
