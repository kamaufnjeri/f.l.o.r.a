import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, replaceDash } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useParams } from 'react-router-dom';
import PrevNext from '../components/shared/PrevNext';


const Accounts = () => {
  const [searchItem, setSearchItem] = useState({
    name: ''
  })
  const { orgId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newAccountsData = await getItems(`${orgId}/accounts`, `?paginate=true`);
    setAccountsData(newAccountsData);
    setPageNo(1);
}
  useEffect(() => {
   
    getData();
}, [])
  const handleChange = async (e) => {
    setSearchItem({ name: e.target.value });
    const newAccounts = await getItems(`${orgId}/accounts`, `?search=${e.target.value}`);
    setAccounts(newAccounts)
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newaccountsData = await getItems(`${orgId}/accounts`, `?search=${searchItem.name}&paginate=true`);
    setAccountsData(newaccountsData);
    setPageNo(1);
    setSearchItem({ name: '' })
  }

  const nextPage = async () => {
    try {
      const response = await api.get(accountsData.next);
      if (response.status == 200) {
        setAccountsData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching accounts`);
    }
  }

  const previousPage = async () => {
    
    try {
      const response = await api.get(accountsData.previous);
      if (response.status == 200) {
        setAccountsData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching accounts`);
    }
  }

  return (
    <div className='flex-1 flex flex-col items-center justify-center relative h-full mr-2'>
      <FormHeader header='Accounts List' />
      <div className='flex flex-row w-full items-center justify-between'>
      <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-[40%] border-2 border-gray-800 rounded-md text-black relative'>
        <input type='name' className='w-[70%] outline-none border-none p-2' placeholder='Enter name, group, (sub) category' value={searchItem.name} onChange={e => handleChange(e)} />
        <button className='w-[30%] border-2 bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
        {accounts.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>
          {accounts.map((account) => (<span className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{account.name}</span>))}
        </div>}
      </form>
      <div onClick={getData} className='self-end p-1 cursor-pointer w-[10%] hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border-2 border-gray-800'>
        Reset
      </div>
      </div>
      

      <div className='overflow-auto custom-scrollbar flex flex-col flex-1 h-full w-full m-2'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[5%] border-gray-800 border-r-2 p-1'>No.</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1 '>Name</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>Group</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Category</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Sub Category</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Balance</span>

        </div>
        {accountsData?.results?.data && accountsData.results.data.map((account, index) => (
          <div className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={account.id}>
          <span className='w-[5%] border-gray-800 border-r-2 p-1'>{index + 1}.</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{account.name}</span>
          <span className='w-[15%] border-gray-800 border-r-2 p-1'>{capitalizeFirstLetter(replaceDash(account.group))}</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{capitalizeFirstLetter(replaceDash(account.category))}</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{capitalizeFirstLetter(replaceDash(account.sub_category))}</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{account.account_balance}</span>
        </div>
        ))}
      </div>
      <PrevNext pageNo={pageNo} data={accountsData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>

    </div>
  )
}

export default Accounts
