import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, getQueryParams } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useParams } from 'react-router-dom';
import FromToDateModal from '../../components/modals/FromToDateModal';
import TypesFilter from '../../components/filters/TypesFilter';
import SortFilter from '../../components/filters/SortFilter';
import DateFilter from '../../components/filters/DateFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';

const Purchases = () => {
  const [openDateModal, setOpenDateModal] = useState(false);
  const { currentOrg } = useAuth();
  const [header, setHeader] = useState('Purchases')

  const [searchItem, setSearchItem] = useState({
    name: '',
    search: '',
    purchases: '',
    date: '',
    sortBy: '',
  })
  const [isVisible, setIsVisible] = useState(false);

  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }


  const [selectOptions, setSelectOptions] = useState([
    { name: "All", value: "all" },
    { name: "Bill Purchases", value: "is_bills" },
    { name: "Regular Purchases", value: "is_not_bills" },
  ])
  const { orgId } = useParams();
  const [purchases, setPurchases] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const getData = async () => {
    const newPurchasesData = await getItems(`${orgId}/purchases`, `?paginate=true`);
    setPurchasesData(newPurchasesData);
    setHeader('Purchases')
  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem(prev => ({ ...prev, name: e.target.value, search: '' }));
    const queryParamsUrl = getQueryParams({
      type: 'purchases',
      paginate: false,
      search: e.target.value,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.purchases
    })

    const newPurchases = await getItems(`${orgId}/purchases`, queryParamsUrl);
    setPurchases(newPurchases)
  }
  const handlePurchasesChange = async (e) => {
    setSearchItem(prev => ({ ...prev, purchases: e.target.value, search: '' }));
    const queryParamsUrl = getQueryParams({
      type: 'purchases',
      paginate: true,
      search: '',
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: e.target.value
    })

    const newPurchasesData = await getItems(`${orgId}/purchases`, queryParamsUrl);
    setPurchasesData(newPurchasesData);
    setPageNo(1);

  }
  const showModal = (setOpenModal) => {
    setOpenModal(true);
  };
  const handleDatesChange = async (e) => {
    if (e.target.value === '*') {
      showModal(setOpenDateModal);
    } else {

      setSearchItem(prev => ({ ...prev, date: e.target.value, search: '' }));
      const queryParamsUrl = getQueryParams({
        type: 'purchases',
        paginate: true,
        search: '',
        date: e.target.value,
        sortBy: searchItem.sortBy,
        typeValue: searchItem.purchases
      })
      const newPurchasesData = await getItems(`${orgId}/purchases`, queryParamsUrl);
      setPurchasesData(newPurchasesData);
      setPageNo(1);
    }


  }
  const handleSortsChange = async (e) => {
    setSearchItem(prev => ({ ...prev, sortBy: e.target.value, search: '' }));
    const queryParamsUrl = getQueryParams({
      type: 'purchases',
      paginate: true,
      search: '',
      date: searchItem.date,
      sortBy: e.target.value,
      typeValue: searchItem.purchases
    })
    const newPurchasesData = await getItems(`${orgId}/purchases`, queryParamsUrl);
    setPurchasesData(newPurchasesData);
    setPageNo(1);

  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const queryParamsUrl = getQueryParams({
      type: 'purchases',
      paginate: true,
      search: searchItem.name,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.purchases
    })
    const newPurchasesData = await getItems(`${orgId}/purchases`, queryParamsUrl);
    setPurchasesData(newPurchasesData);
    setPageNo(1);
    setHeader(`Purchases matching '${searchItem.name}'`)
    setSearchItem(prev => ({ ...prev, name: '', search: prev.name }))
  }

  const nextPage = async () => {
    try {
      const response = await api.get(purchasesData.next);
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
      const response = await api.get(purchasesData.previous);
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
  const downloadPDF = () => {
    const querlParams = getQueryParams({
      type: 'purchases',
      paginate: false,
      search: searchItem.search,
      date: searchItem.date,
      sortBy: searchItem.sortBy,
      typeValue: searchItem.purchases
    });
    const url = `/${orgId}/purchases/download/${querlParams}`;
    downloadListPDF(url, 'Purchases')
  }
  return (
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full '>
      <FromToDateModal
        openModal={openDateModal}
        setOpenModal={setOpenDateModal}
        setSearchItem={setSearchItem}
        searchItem={searchItem}
        setData={setPurchasesData}
        setPageNo={setPageNo}
        type='purchases'
      />
      <div className='flex flex-row w-full'>
        <form onSubmit={handleSubmit} className='grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 self-start w-full text-black items-center gap-2'>
          <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-2 relative col-span-2'>
            <input type='name' className='h-10 border border-gray-800 rounded-md outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter purchase number or description' value={searchItem.name} onChange={e => handleChange(e)} />
            <TypesFilter searchItem={searchItem} selectOptions={selectOptions} type='purchases' handleTypesChange={handlePurchasesChange} />

            <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />



            <SortFilter searchItem={searchItem} handleSortsChange={handleSortsChange} />

            {purchases?.purchases?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 -bottom-14 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

              {purchases?.purchases?.map((purchase) => (<Link to={`${purchase.id}`} key={purchase.id} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{purchase.serial_number}</Link>))}
            </div>}
          </div>
          <div className='grid grid-cols-2 gap-2 '>
            <button className='h-10 w-[100px] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>

            <div className='flex items-center justify-center place-self-end'>
              <div className={`rounded-md p-1 bg-neutral-200 relative
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

                <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
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
        {purchasesData && <PrevNext pageNo={pageNo} data={purchasesData} previousPage={previousPage} nextPage={nextPage} className='w-full' />}

      </div>

      <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>
            <th className='p-1 border-r border-b border-gray-800'>Purchase #</th>
            <th className='p-1 border-r border-b border-gray-800'>Date</th>
            <th className='p-1 border-r border-b border-gray-800'>Type</th>
            <th className='p-1 border-r border-b border-gray-800' colSpan={2}>Items</th>
            <th className='p-1 border-r border-b border-gray-800'>Total Amount ({currentOrg?.currency})</th>
            <th className='p-1 border-r border-b border-gray-800'>Total Quantity</th>
            <th className='p-1 border-r border-b border-gray-800'>Due Amount ({currentOrg?.currency})</th>

          </tr>


        </thead>
        <tbody>
          {purchasesData?.results?.data?.purchases && purchasesData.results.data.purchases.map((purchase, index) => (

            <tr
              key={purchase.id}
              className="hover:bg-gray-200 cursor-pointer"
            >
              <td className="border-gray-800 border-r border-b p-1">
                <Link to={`${purchase.id}`}>
                  {purchase.serial_number}
                </Link>
              </td>
              <td className="border-gray-800 border-r border-b p-1">
                <Link to={`${purchase.id}`}>
                  {purchase.date}
                </Link>
              </td>
              <td className="border-gray-800 border-r border-b p-1">
                <Link to={`${purchase.id}`}>
                  {capitalizeFirstLetter(purchase.details.type)}
                </Link>
              </td>
              <td className="border-gray-800 border-r border-b p-1" colSpan={2}>
                <Link to={`${purchase.id}`} >
                  <ul className="flex flex-wrap gap-3">
                    {purchase.details.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <i className="text-sm">({purchase.description})</i>
                </Link>
              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">
                <Link to={`${purchase.id}`}>
                  {purchase.details.total_amount}
                </Link>
              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">
                <Link to={`${purchase.id}`}>
                  {purchase.details.total_quantity}
                </Link>
              </td>
              <td className="border-gray-800 border-r border-b p-1 text-right">
                <Link to={`${purchase.id}`}>
                  {purchase.details.amount_due > 0 ? purchase.details.amount_due : '-'}
                </Link>
              </td>
            </tr>))}
          {purchasesData?.results?.data?.totals &&
            <tr className='text-right font-bold bg-gray-300'>
              <td className='border-gray-800 border-r border-b p-1' colSpan={5}>Total</td>
              <td className='border-gray-800 border-r border-b p-1'>
                {purchasesData?.results?.data?.totals?.amount}
              </td>
              <td className='border-gray-800 border-r border-b p-1'>{purchasesData?.results?.data?.totals?.quantity}</td>
              <td className='border-gray-800 border-r border-b p-1'>{purchasesData?.results?.data?.totals?.amount_due}</td>
            </tr>
          }

        </tbody>

      </table>


    </div>
  )
}

export default Purchases
