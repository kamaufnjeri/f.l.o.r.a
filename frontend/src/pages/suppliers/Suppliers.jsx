import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { getItems, getNumber } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from "../../context/AuthContext";
import AddSupplierModal from '../../components/modals/AddSupplierModal';
import SubHeader from '../../components/shared/SubHeader';


const Suppliers = () => {
  const [searchItem, setSearchItem] = useState({
    name: '',
    search: '',
  })
  const { orgId } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const { currentOrg } = useAuth();
  const [header, setHeader] = useState('Suppliers');
  const navigate = useNavigate();

  const handleRowClick = (supplierId) => {
    navigate(`/dashboard/${orgId}/suppliers/${supplierId}`);
  };


  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }

  const getData = async () => {
    const newSuppliersData = await getItems(`${orgId}/suppliers`, `?paginate=true`);
    setSuppliersData(newSuppliersData);
    setSearchItem({ name: '', search: '' })
    setHeader('Suppliers')

  }
  useEffect(() => {

    getData();
  }, [])
  const handleChange = async (e) => {
    setSearchItem(prev => ({ search: prev.search, name: e.target.value }));
    const newsuppliers = await getItems(`${orgId}/suppliers`, `?search=${e.target.value}`);
    setSuppliers(newsuppliers)
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newSuppliersData = await getItems(`${orgId}/suppliers`, `?search=${searchItem.name}&paginate=true`);
    setSuppliersData(newSuppliersData);
    setPageNo(1);
    setHeader(`Suppliers matching '${searchItem.name}'`)

    setSearchItem(prev => ({ search: prev.name, name: '' }))
  }


  const nextPage = async () => {
    try {
      const response = await api.get(suppliersData.next);
      if (response.status == 200) {
        setSuppliersData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching suppliers`);
    }
  }

  const previousPage = async () => {

    try {
      const response = await api.get(suppliersData.previous);
      if (response.status == 200) {
        setSuppliersData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching suppliers`);
    }
  }
  const downloadPDF = () => {
    const url = `/${orgId}/suppliers/download/?search=${searchItem.search}`
    downloadListPDF(url, 'Suppliers')
  }

  return (
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <SubHeader supplier={true} getData={getData} />


      <div className='grid lg:grid-cols-2 grid-cols-1  w-full gap-4 items-center shadow-md rounded-md p-2'>
        <form onSubmit={handleSubmit} className='flex h-10 flex-row gap-2 self-start rounded-md text-black relative'>
          <input type='name' className='w-[70%] rounded-md border border-gray-800 outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Search suppliers by name' value={searchItem.name} onChange={e => handleChange(e)} />
          <button className='w-[30%] border-2 bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
          {suppliers?.suppliers?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white' >
            {suppliers.suppliers.map((supplier) => (<Link to={`${supplier.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1' key={supplier.id}>{supplier.name}</Link>))}
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
        <PrevNext pageNo={pageNo} data={suppliersData} previousPage={previousPage} nextPage={nextPage} className='w-full' />
      </div>
      <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>
            <th className='p-1 border-b border-r border-gray-800'>No.</th>
            <th className='p-1 border-b border-r border-gray-800'>Name</th>
            <th className='p-1 border-b border-r border-gray-800'>Email</th>
            <th className='p-1 border-b border-r border-gray-800'>Phone no.</th>
            <th className='p-1 border-b border-r border-gray-800'>Amount Due ({currentOrg.currency})</th>

          </tr>
        </thead>
        <tbody>
        {suppliersData?.results?.data?.suppliers && suppliersData.results.data?.suppliers.map((supplier, index) => (
            <tr key={supplier.id} className='hover:bg-gray-200 cursor-pointer'
              onClick={() => handleRowClick(supplier.id)}
            >
              <td className='p-1 border-b border-r border-gray-800'>
                {getNumber(pageNo, index)}.
              </td>
              <td className='p-1 border-b border-r border-gray-800'>
                {supplier.name}
              </td>
              <td className='p-1 border-b border-r border-gray-800'>
                {supplier.email}
              </td>
              <td className='p-1 border-b border-r border-gray-800'>
                {supplier.phone_number}
              </td>
              <td className='p-1 border-b border-r border-gray-800 text-right'>
                {supplier.amount_due}
              </td>

            </tr>
          ))}
          {suppliersData?.results?.data?.totals &&
            <tr className='text-right font-bold bg-gray-300 '>
              <td className='p-1 border-b border-r border-gray-800' colSpan={4}>Total</td>
              <td className='p-1 border-b border-r border-gray-800'>{suppliersData?.results?.data?.totals?.amount_due}</td>
            </tr>}
        </tbody>
      </table>
</div>
    </div>
  )
}

export default Suppliers
