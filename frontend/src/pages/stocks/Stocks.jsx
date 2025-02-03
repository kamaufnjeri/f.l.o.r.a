import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { getItems } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import PrevNext from '../../components/shared/PrevNext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { downloadListPDF } from '../../lib/download/downloadList';
import SubHeader from '../../components/shared/SubHeader';


const Stocks = () => {
  const [searchItem, setSearchItem] = useState({
    name: '',
    search: ''
  });
  const { orgId } = useParams();
  const [stocks, setStocks] = useState([]);
  const [stocksData, setStocksData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [header, setHeader] = useState('Stocks');
  const navigate = useNavigate();

  const handleRowClick = (stockId) => {
    navigate(`/dashboard/${orgId}/stocks/${stockId}`);
  };


  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }

  const getData = async () => {
    const newStocksData = await getItems(`${orgId}/stocks`, `?paginate=true`);
    setStocksData(newStocksData);
    setHeader('Stocks')

    setSearchItem({ name: '', search: '' })
  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem(prev => ({ search: prev.search, name: e.target.value }));
    const newStocks = await getItems(`${orgId}/stocks`, `?search=${e.target.value}`);
    setStocks(newStocks)
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newStocksData = await getItems(`${orgId}/stocks`, `?search=${searchItem.name}&paginate=true`);
    setStocksData(newStocksData);
    setPageNo(1);
    setHeader(`Stocks matching '${searchItem.name}'`)
    setSearchItem(prev => ({ name: '', search: prev.name }))
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
  const downloadPDF = () => {
    const url = `/${orgId}/stocks/download/?search=${searchItem.search}`
    downloadListPDF(url, 'Stocks')
  }
  return (
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <SubHeader item={true} getData={getData} />

      <div className='grid lg:grid-cols-2 grid-cols-1  w-full gap-4 items-center shadow-md rounded-md p-2'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row gap-2 self-start rounded-md text-black relative'>
          <input type='name' className='w-[70%] rounded-md border border-gray-800 outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Search stocks by name' value={searchItem.name} onChange={e => handleChange(e)} />
          <button className='w-[30%] border-2 bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
          {stocks?.stocks?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>
            {stocks.stocks.map((stock) => (<Link to={`${stock.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1' key={stock.id}>{stock.name}</Link>))}
          </div>}
        </form>
        <div className='grid grid-cols-2 gap-2'>
          <div onClick={getData} className='p-1 h-10 cursor-pointer hover:text-purple-800 hover:border-purple-800 font-bold rounded-md border text-center border-gray-800'>
            Reset
          </div>

          <div className='flex items-center justify-center gap-2 place-self-end'>
            <div className={`rounded-md p-1 bg-neutral-200 relative
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

              <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                Download
              </button>

            </div>
            {!isVisible ?
              <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
              <FaTimes className='cursor-pointer hover:text-purple-800 text-lg' onClick={closeDropDown} />

            }
          </div>
        </div>
      </div>
      <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

      <div className='flex flex-row items-center justify-between w-full'>
        <FormHeader header={header} />
        <PrevNext pageNo={pageNo} data={stocksData} previousPage={previousPage} nextPage={nextPage} className='w-full' />
      </div>
      <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>
            <th className='p-1 border-b border-r border-gray-800'>No.</th>
            <th className='p-1 border-b border-r border-gray-800'>Name</th>
            <th className='p-1 border-b border-r border-gray-800'>Unit name</th>
            <th className='p-1 border-b border-r border-gray-800'>Unit alias</th>
            <th className='p-1 border-b border-r border-gray-800'>Quantity</th>

          </tr>
        </thead>
        <tbody>
          {stocksData?.results?.data?.stocks && stocksData.results.data.stocks.map((stock, index) => (
            <tr key={stock.id} className='hover:bg-gray-200 cursor-pointer'
              onClick={() => handleRowClick(stock.id)}
            >
              <td className='p-1 border-b border-r border-gray-800'>
                {index + 1}.
              </td>
              <td className='p-1 border-b border-r border-gray-800'>
                {stock.name}
              </td>
              <td className='p-1 border-b border-r border-gray-800'>
                {stock.unit_name}
              </td>
              <td className='p-1 border-b border-r border-gray-800'>
                {stock.unit_alias}
              </td>
              <td className='p-1 border-b border-r border-gray-800 text-right'>
                {stock.total_quantity} {stock.unit_alias}
              </td>

            </tr>
          ))}
          {stocksData?.results?.data?.totals &&
            <tr className='text-right font-bold bg-gray-300 '>
              <td className='p-1 border-b border-r border-gray-800' colSpan={4}>Total</td>
              <td className='p-1 border-b border-r border-gray-800'>{stocksData?.results?.data?.totals?.quantity}</td>
            </tr>}
        </tbody>
      </table>
</div>
    </div>
  )
}

export default Stocks
