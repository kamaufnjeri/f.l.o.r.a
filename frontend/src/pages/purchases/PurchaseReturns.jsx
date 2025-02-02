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


const PurchaseReturns = () => {
  const [openDateModal, setOpenDateModal] = useState(false);
  const { currentOrg } = useAuth();
  const [header, setHeader] = useState('Purchase Returns')

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
    const newPurchaseReturnsData = await getItems(`${orgId}/purchase_returns`, `?paginate=true`);
    setPurchaseReturnsData(newPurchaseReturnsData);
    setHeader('Purchase Returns')

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
    setHeader(`Purchase Returns matching '${searchItem.name}'`)

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
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setPurchaseReturnsData}
        setPageNo={setPageNo}
        type='purchase_returns'
      />
      <div className='flex flex-row w-full'>
        <form onSubmit={handleSubmit} className='grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 self-start w-full text-black items-center gap-2'>
          <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-2 relative col-span-2'>
            <input type='name' className='h-10 border border-gray-800 rounded-md outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter purchase number or description' value={searchItem.name} onChange={e => handleChange(e)} />

            <DateFilter handleDatesChange={handleDatesChange} searchItem={searchItem} />


            <SortFilter handleSortsChange={handleSortsChange} searchItem={searchItem} />

            {purchaseReturns?.purchase_returns?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {purchaseReturns.purchase_returns.map((purchase_return) => (<Link to={`/dashboard/${orgId}/${purchase_return.details.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{purchase_return.details.serial_number}</Link>))}
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
      <div className='flex flex-row items-center justify-between w-full'>
        <FormHeader header={header} />
        <PrevNext pageNo={pageNo} data={purchaseReturnsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

      </div>

      <table className="min-w-full border-collapse border border-gray-800">
        <thead>
          <tr className="bg-gray-400 text-left">
            <th className=" p-1 border-r border-b border-gray-800">Purchase #</th>
            <th className=" p-1 border-r border-b border-gray-800">Date</th>
            <th className="p-1 border-r border-b border-gray-800">Item</th>
            <th className="p-1 border-r border-b border-gray-800">Rate ({currentOrg.currency})</th>
            <th className="p-1 border-r border-b border-gray-800">Quantity</th>
            <th className="p-1 border-b border-gray-800">Total ({currentOrg.currency})</th>
          </tr>
        </thead>
        <tbody>
          {purchaseReturnsData?.results?.data?.purchase_returns &&
            purchaseReturnsData.results.data.purchase_returns.map((purchase_return) => {
              return (
                <>
                  {purchase_return.return_entries.map((entry, index) => (
                    <tr
                      key={`${purchase_return.id}-${index}`}
                      onClick={() => handleRowClick(purchase_return.details.url)}
                      className="cursor-pointer text-left"
                    >
                      {index === 0 && (
                        <>
                          <td
                            className="border-r border-b border-gray-800 p-1"
                            rowSpan={purchase_return.return_entries.length + 1}
                          >

                            {purchase_return.details.serial_number}

                          </td>
                          <td
                            className="border-r border-b border-gray-800 p-1"
                            rowSpan={purchase_return.return_entries.length + 1}
                          >

                            {purchase_return.date}

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
                    onClick={() => handleRowClick(purchase_return.details.url)}
                    className="cursor-pointer">
                    <td colSpan={2} className="border-r border-b border-gray-800 p-1 text-right space-x-2">
                      <i className='text-sm'>({purchase_return.description})</i>
                      <span className='underline'>Total</span>
                    </td>
                    <td className="border-r border-b border-gray-800 p-1 underline text-right">
                      {purchase_return.details?.total_quantity}
                    </td>
                    <td className="border-b border-r border-gray-800 p-1 underline text-right">
                      {purchase_return.details?.total_amount}
                    </td>
                  </tr>

                </>
              );
            })}
          {purchaseReturnsData?.results?.data?.totals && (
            <tr className="bg-gray-300 font-bold text-right">
              <td colSpan={4} className="border-r border-b border-gray-800 p-1">
                Grand Total:
              </td>
              <td className="border-r border-b border-gray-800 p-1">
                {purchaseReturnsData.results.data.totals.quantity}
              </td>
              <td className="border-b border-gray-800 p-1">
                {purchaseReturnsData.results.data.totals.amount}
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div >
  )
}

export default PurchaseReturns
