import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { getItems, returnsQueryParams } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FromToDateModal from '../../components/modals/FromToDateModal';
import DateFilter from '../../components/filters/DateFilter';
import SortFilter from '../../components/filters/SortFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';


const SalesReturns = () => {
  const [openDateModal, setOpenDateModal] = useState(false);
  const { currentOrg } = useAuth();
  const [header, setHeader] = useState('Sales Returns')

  const [searchItem, setSearchItem] = useState({
    name: '',
    date: '',
    sortBy: '',
    search: '',
  })
  const [salesReturns, setSalesReturns] = useState([]);
  const [salesReturnsData, setSalesReturnsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const { orgId } = useParams();
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const handleRowClick = (url) => {
    navigate(`/dashboard/${orgId}/${url}`);
  };

  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }

  const getData = async () => {
    const newSalesReturnsData = await getItems(`${orgId}/sales_returns`, `?paginate=true`);
    setSalesReturnsData(newSalesReturnsData);
    setHeader('Sales Returns')

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
    setHeader(`Sales Returns matching '${searchItem.name}'`)

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
      toast.error(`Error': Error fetching Sales Returns`);
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
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setSalesReturnsData}
        setPageNo={setPageNo}
        type='sales_returns'
      />
      <div className='flex flex-row w-full'>
        <form onSubmit={handleSubmit} className='grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 self-start w-full text-black items-center gap-2 rounded-md shadow-md p-2'>
          <div className='grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 gap-2 relative col-span-2'>
            <input type='name' className='h-10 border border-gray-800 rounded-md outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter sales number or description' value={searchItem.name} onChange={e => handleChange(e)} />

            <DateFilter handleDatesChange={handleDatesChange} searchItem={searchItem} />


            <SortFilter handleSortsChange={handleSortsChange} searchItem={searchItem} />

            {salesReturns?.sales_returns?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {salesReturns.sales_returns.map((sales_return) => (<Link to={`/dashboard/${orgId}/${sales_return.details.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{sales_return.details.serial_number}</Link>))}
            </div>}
          </div>
          <div className='grid grid-cols-2 gap-2 '>
            <button className='h-10 w-[100px] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>

            <div className='flex items-center justify-center place-self-end'>
              <div className={`rounded-md p-1 bg-neutral-200 relative
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

                <button type='button' className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                  Download
                </button>

              </div>
              {!isVisible ?
                <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
                <FaTimes className='cursor-pointer hover:text-purple-800  text-lg' onClick={closeDropDown} />

              }

            </div>
          </div>
        </form>


      </div>
      <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

      <div className='flex flex-row items-center justify-between w-full'>
        <FormHeader header={header} />
        <PrevNext pageNo={pageNo} data={salesReturnsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

      </div>

      <table className="min-w-full border-collapse border border-gray-800">
        <thead>
          <tr className="bg-gray-400 text-left">
            <th className=" p-1 border-r border-b border-gray-800">Sale #</th>
            <th className=" p-1 border-r border-b border-gray-800">Date</th>
            <th className="p-1 border-r border-b border-gray-800">Item</th>
            <th className="p-1 border-r border-b border-gray-800">Rate ({currentOrg.currency})</th>
            <th className="p-1 border-r border-b border-gray-800">Quantity</th>
            <th className="p-1 border-b border-gray-800">Total ({currentOrg.currency})</th>
          </tr>
        </thead>
        <tbody>
          {salesReturnsData?.results?.data?.sales_returns &&
            salesReturnsData.results.data.sales_returns.map((sales_return) => {
              return (
                <>
                  {sales_return.return_entries.map((entry, index) => (
                    <tr
                      key={`${sales_return.id}-${index}`}
                      onClick={() => handleRowClick(sales_return.details.url)}
                      className="cursor-pointer text-left"
                    >
                      {index === 0 && (
                        <>
                          <td
                            className="border-r border-b border-gray-800 p-1"
                            rowSpan={sales_return.return_entries.length + 1}
                          >
                            
                              {sales_return.details.serial_number}
                            
                          </td>
                          <td
                            className="border-r border-b border-gray-800 p-1"
                            rowSpan={sales_return.return_entries.length + 1}
                          >
                            
                              {sales_return.date}
                            
                          </td>
                        </>
                      )}
                      <td className="border-r border-b border-gray-800 p-1">
                        {entry.stock_name}
                      </td>
                      <td className="border-r border-b border-gray-800 p-1 text-right">
                        {entry.return_price}
                      </td>
                      <td className="border-r border-b border-gray-800 p-1 text-right">
                        {entry.quantity}
                      </td>
                      <td className="border-b border-gray-800 p-1 text-right">
                        
                          {entry.return_quantity * entry.return_price}
                        
                      </td>
                    </tr>
                  ))}
                  <tr
                    onClick={() => handleRowClick(sales_return.details.url)}
                    className="cursor-pointer">
                    <td colSpan={2} className="border-r border-b border-gray-800 p-1 text-right space-x-2">
                      <i className='text-sm'>({sales_return.description})</i>
                      <span className='underline'>Total</span>
                    </td>
                    <td className="border-r border-b border-gray-800 p-1 underline text-right">
                      {sales_return.details?.total_quantity}
                    </td>
                    <td className="border-b border-r border-gray-800 p-1 underline text-right">
                      {sales_return.details?.total_amount}
                    </td>
                  </tr>

                </>
              );
            })}
          {salesReturnsData?.results?.data?.totals && (
            <tr className="bg-gray-300 font-bold text-right">
              <td colSpan={4} className="border-r border-b border-gray-800 p-1">
                Grand Total:
              </td>
              <td className="border-r border-b border-gray-800 p-1">
                {salesReturnsData.results.data.totals.quantity}
              </td>
              <td className="border-b border-gray-800 p-1">
                {salesReturnsData.results.data.totals.amount}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}

export default SalesReturns
