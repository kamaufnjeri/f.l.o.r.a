import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRequest, getItems } from '../lib/helpers';
import FromToDateModal from '../components/modals/FromToDateModal';
import FormHeader from '../components/forms/FormHeader';
import DateFilter from '../components/filters/DateFilter';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../lib/download/downloadList';
import { useAuth } from '../context/AuthContext';
import UpdateItemModal from '../components/modals/UpdateItemModal';
import { toast } from 'react-toastify';
import { useSelectOptions } from '../context/SelectOptionsContext';

const SingleStock = () => {
    const { orgId, id } = useParams();
    const [stockData, setStockData] = useState({})
    const [searchItem, setSearchItem] = useState({
        date: ''
    })
    const { currentOrg } = useAuth();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDateModal, setOpenDateModal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const { getSelectOptions } = useSelectOptions();

    const openDropDown = () => {
        setIsVisible(true);
    }

    const closeDropDown = () => {
        setIsVisible(false);
    }


    const getData = async () => {
        const newStockData = await getItems(`${orgId}/stocks/${id}`);
        setStockData(newStockData)
    }

    useEffect(() => {
        getData();
    }, [])

    const showModal = (setOpenModal) => {
        setOpenModal(true);
    };
    const handleDatesChange = async (e) => {
        if (e.target.value === '*') {
            showModal(setOpenDateModal);
        } else {

            setSearchItem(prev => ({ ...prev, date: e.target.value }));
            const queyParamsUrl = `?date=${e.target.value}`
            const newStockData = await getItems(`${orgId}/stocks/${id}`, queyParamsUrl);
            setStockData(newStockData);
        }


    }

    const deleteStock = async () => {
        const response = await deleteRequest(`${orgId}/stocks/${stockData.id}`);
        if (response.success) {
          toast.success('Stock deleted successfully');
          getSelectOptions();
          navigate(`/dashboard/${orgId}/stocks`)
        } else {
          toast.error(`${response.error}`)

        }
    }
    const downloadPDF = () => {
        const querlParams = `?date=${searchItem.date}`
        const url = `/${orgId}/stocks/${id}/download/${querlParams}`;
        downloadListPDF(url, `Stock Summary for ${stockData.name}`)
    }
    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setStockData}
                type={`stocks/${id}`}
            />
            <UpdateItemModal
            setOpenModal={setOpenEditModal}
            openModal={openEditModal}
            setStockData={setStockData}
            stockData={stockData}
            />
            <div className='flex flex-row w-full items-center justify-between'>
                <form className='flex h-10 flex-row self-start w-[70%] text-black items-center gap-2'>

                    <div className='w-[40%] rounded-md border-2 border-gray-800  cursor-pointer'>
                        <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />

                    </div>

                </form>
                <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800' />
                <div className={`absolute right-1 top-8 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
           border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                    <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />

                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
                        Download
                    </button>
                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={() => setOpenEditModal(true)}>
                        Edit
                    </button>
                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={deleteStock}>
                        Delete
                    </button>
                </div>

            </div>

            <FormHeader header={`Stock Summary for ${stockData.name}`} />
           
            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
            <div className='w-full flex flex-row justify-between mb-2'>
                <span><strong>Name: </strong>{stockData.name}</span>
                <span><strong>Unit Name: </strong>{stockData.unit_name}</span>
                <span><strong>Unit alias: </strong>{stockData.unit_alias}</span>
                
            </div>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>No #</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Transaction Type</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Quantity ({stockData.unit_alias})</span>

                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Rate ({currentOrg.currency})</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Total Amount  ({currentOrg.currency})</span>
                    <span className='w-[30%] border-gray-800 border-r-2 p-1'>Details</span>

                </div>
                {stockData?.stock_summary && stockData.stock_summary.entries.map((entry, index) => (
                    <Link to={entry.details.url ? `/dashboard/${orgId}${entry.details.url}` : ''}  className={`w-full flex flex-row ${entry.details.type === 'Closing Stock' ? 'font-extrabold underline' : 'font-bold'} border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer`} key={entry.id}>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{entry.details.date}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{entry.details.type}</span>

                        <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{(entry.details.type === 'Sales' || entry.details.type === 'Purchase Return') ? '(-)' : ''}{entry.details.quantity}</span>

                        <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{entry.details.rate}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{entry.details.total}</span>
                        <span className='w-[30%] border-gray-800 border-r-2 p-1'>{entry.details.description}</span>

                    </Link>
                ))}
                <div className='w-[50%] flex flex-col border-2 border-gray-800 mt-2'>
                    <div className='w-full flex flex-row'>
                        <span className='font-bold w-[30%] border-r-2 border-gray-800 p-1'>Name</span>
                        <span className='font-bold w-[30%] border-r-2 border-gray-800 p-1'>Total Quantity ({stockData.unit_alias})</span>
                        <span className='font-bold w-[40%] p-1'>Total Amount ({currentOrg.currency})</span>
                    </div>
                {stockData?.stock_summary && stockData.stock_summary.totals.map((entry, index) => (
                    <div className='flex flex-row w-full border-t-2 border-gray-800' key={index}>
                         <span className='w-[30%] border-r-2 border-gray-800 p-1'>{entry.name}</span>
                         <span className='w-[30%] text-right border-r-2 border-gray-800 p-1'>{entry.quantity} </span>
                         <span className='w-[40%] text-right p-1'>{entry.amount}</span>
                    </div>
                   

                ))} 
                </div>
            </div>

        </div>


    )
}

export default SingleStock
