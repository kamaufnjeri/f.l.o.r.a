import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FromToDateModal from '../../components/modals/FromToDateModal';
import FormHeader from '../../components/forms/FormHeader';
import DateFilter from '../../components/filters/DateFilter';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import UpdateItemModal from '../../components/modals/UpdateItemModal';
import DeleteModal from '../../components/modals/DeleteModal';
import { getItems } from '../../lib/helpers';

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
    const [openDeleteModal, setOpenDeleteModal] = useState('');
    const [deleteUrl, setDeleteUrl] = useState('');
    const [deleteModalTitle, setDeleteModalTitle] = useState('');
    const navigate = useNavigate();

    const handleRowClick = (url) => {
        if (url) {
            navigate(`/dashboard/${orgId}${url}`);

        }
    };

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


    const deleteStock = () => {
        const deleteUrl = `${orgId}/stocks/${stockData.id}`
        setDeleteUrl(deleteUrl);
        setDeleteModalTitle(`stock ${stockData.name}`);
        setOpenDeleteModal(true);
    }

    const downloadPDF = () => {
        const querlParams = `?date=${searchItem.date}`
        const url = `/${orgId}/stocks/${id}/download/${querlParams}`;
        downloadListPDF(url, `Stock Summary for ${stockData.name}`)
    }
    return (
        <div className='flex flex-col items-start justify-start h-full gap-2 w-full '>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setStockData}
                type={`stocks/${id}`}
            />
            <DeleteModal
                openModal={openDeleteModal}
                setOpenModal={setOpenDeleteModal}
                setDeleteUrl={setDeleteUrl}
                deleteUrl={deleteUrl}
                title={deleteModalTitle}
                setTitle={setDeleteModalTitle}
                getData={getData}
                navigateUrl={`/dashboard/${orgId}/stocks`}
            />
            <UpdateItemModal
                setOpenModal={setOpenEditModal}
                openModal={openEditModal}
                setStockData={setStockData}
                stockData={stockData}
            />
            <div className='grid grid-cols-2 w-full gap-4 items-start'>
                <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />
                <div className='absolute  top-5 right-2'>
                    <div className={`rounded-md p-1 bg-neutral-200 absolute -top-3 right-5
                     border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                            Download
                        </button>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={() => setOpenEditModal(true)}>
                            Edit
                        </button>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={deleteStock}>
                            Delete
                        </button>
                       
                    </div>
                    {!isVisible ?
                            <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
                            <FaTimes className='cursor-pointer hover:text-purple-800 text-lg' onClick={closeDropDown} />

                        }
                </div>
            </div>
            <div className='flex flex-col items-start justify-between w-full gap-2'>
                <FormHeader header={`Stock Summary for ${stockData.name}`} />
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-2 w-full'>
                    <span><strong>Name: </strong>{stockData.name}</span>
                    <span><strong>Unit Name: </strong>{stockData.unit_name}</span>
                    <span><strong>Unit alias: </strong>{stockData.unit_alias}</span>
                </div>
            </div>
           

            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-b border-r border-gray-800'>No.</th>
                        <th className='p-1 border-b border-r border-gray-800'>Date</th>
                        <th className='p-1 border-b border-r border-gray-800'>Transaction type</th>
                        <th className='p-1 border-b border-r border-gray-800' colSpan={2}>Details</th>
                        <th className='p-1 border-b border-r border-gray-800'>Quantity ({stockData.unit_alias})</th>
                        <th className='p-1 border-b border-r border-gray-800'>Rate ({currentOrg.currency})</th>
                        <th className='p-1 border-b border-r border-gray-800'>Total amount ({currentOrg.currency})</th>

                    </tr>
                </thead>
                <tbody>
                {stockData?.stock_summary && stockData.stock_summary.entries.map((entry, index) => (
                        <tr key={index} className={`hover:bg-gray-200 cursor-pointer ${entry.details.type === 'Closing Stock' ? 'font-bold bg-gray-300' : 'font-bold'}`}
                            onClick={() => handleRowClick(entry.details.url)}
                        >
                            <td className='p-1 border-b border-r border-gray-800'>
                                {index + 1}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {entry.details.date}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {entry.details.type}
                            </td>
                            <td className="border-gray-800 border-r border-b p-1 text-left" colSpan={2}>
                                {entry.details.description}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800 text-right'>
                            {(entry.details.type === 'Sales' || entry.details.type === 'Purchase Return') ? '(-)' : ''}{entry.details.quantity}
                            </td>

                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {entry.details.rate}
                            </td>
                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {entry.details.total}
                            </td>
                           
                        </tr>
                    ))}

                </tbody>
            </table>
            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-b border-r border-gray-800'>Name</th>
                        <th className='p-1 border-b border-r border-gray-800'>Total quantity ({stockData.unit_alias})</th>
                       <th className='p-1 border-b border-r border-gray-800'>Total amount ({currentOrg.currency})</th>
                    </tr>
                </thead>
                <tbody>
                {stockData?.stock_summary && stockData.stock_summary.totals.map((entry, index) => (
                        <tr key={index} className='hover:bg-gray-200 cursor-pointer'
                            onClick={() => handleRowClick(entry.details.url)}
                        >
                            <td className='p-1 border-b border-r border-gray-800'>
                                {entry.name}
                            </td>
                           

                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {entry.quantity}
                            </td>
                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {entry.amount}
                            </td>
                        </tr>
                    ))}

                </tbody>
            </table>
           

        </div>


    )
}

export default SingleStock
