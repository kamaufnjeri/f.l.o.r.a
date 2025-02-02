import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, getItems, replaceDash } from '../../lib/helpers';
import FromToDateModal from '../../components/modals/FromToDateModal';
import FormHeader from '../../components/forms/FormHeader';
import DateFilter from '../../components/filters/DateFilter';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import UpdateSupplierModal from '../../components/modals/UpdateSupplierModal.jsx';
import DeleteModal from '../../components/modals/DeleteModal.jsx';


const SingleSupplier = () => {
    const { orgId, id } = useParams();
    const [supplierData, setSupplierData] = useState({})
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
        const newSupplierData = await getItems(`${orgId}/suppliers/${id}`);
        setSupplierData(newSupplierData)
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
            const newSupplierData = await getItems(`${orgId}/suppliers/${id}`, queyParamsUrl);
            setSupplierData(newSupplierData);
        }


    }


    const deleteSupplier = () => {
        const deleteUrl = `${orgId}/suppliers/${supplierData.id}`
        setDeleteUrl(deleteUrl);
        setDeleteModalTitle(`supplier ${supplierData.name}`);
        setOpenDeleteModal(true);
    }

    const downloadPDF = () => {
        const querlParams = `?date=${searchItem.date}`
        const url = `/${orgId}/suppliers/${id}/download/${querlParams}`;
        downloadListPDF(url, `Supplier ${supplierData?.name} Details`)
    }
    return (
        <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setSupplierData}
                type={`suppliers/${id}`}
            />
            <DeleteModal
                openModal={openDeleteModal}
                setOpenModal={setOpenDeleteModal}
                setDeleteUrl={setDeleteUrl}
                deleteUrl={deleteUrl}
                title={deleteModalTitle}
                setTitle={setDeleteModalTitle}
                getData={getData}
                navigateUrl={`/dashboard/${orgId}/suppliers`}
            />
            <UpdateSupplierModal

                setOpenModal={setOpenEditModal}
                openModal={openEditModal}
                setSupplierData={setSupplierData}
                supplierData={supplierData}
            />
            <div className='grid grid-cols-2 w-full gap-4 items-start '>
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
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={deleteSupplier}>
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
                <FormHeader header={`Supplier ${supplierData?.name} Details`} />
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-2 w-full'>
                    <span><strong>Name: </strong>{supplierData?.name}</span>
                    <span><strong>Email: </strong>{supplierData?.email}</span>
                    <span><strong>Phone Number: </strong>{supplierData?.phone_number}</span>
                </div>
            </div>
            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-b border-r border-gray-800'>Purchase #</th>
                        <th className='p-1 border-b border-r border-gray-800'>Date</th>
                        <th className='p-1 border-b border-r border-gray-800'>Due date</th>
                        <th className='p-1 border-b border-r border-gray-800'>Status</th>
                        <th className='p-1 border-b border-r border-gray-800'>Due days</th>
                        <th className='p-1 border-b border-r border-gray-800'>Type</th>
                        <th className='p-1 border-b border-r border-gray-800' colSpan={2}>Details</th>
                        <th className='p-1 border-b border-r border-gray-800'>Amout paid ({currentOrg.currency})</th>
                        <th className='p-1 border-b border-r border-gray-800'>Amount due ({currentOrg.currency})</th>
                    </tr>
                </thead>
                <tbody>
                    {supplierData?.supplier_data && supplierData?.supplier_data?.bills.map((bill, index) => (
                        <tr key={index} className='hover:bg-gray-200 cursor-pointer'
                            onClick={() => handleRowClick(bill.details.url)}
                        >
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.details.serial_number}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.details.date}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.due_date}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {capitalizeFirstLetter(replaceDash(bill.status))}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.details.due_days}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.details.type}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800' colSpan={2}>
                                {bill.details.description}
                            </td>

                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {bill.amount_paid}
                            </td>
                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {bill.amount_due}
                            </td>
                        </tr>
                    ))}
                    {supplierData?.supplier_data?.totals && (
                        <tr className='text-right font-bold bg-gray-300 '>
                            <td className='p-1 border-b border-r border-gray-800' colSpan={8}>Total</td>
                            <td className='p-1 border-b border-r border-gray-800'>{supplierData.supplier_data.totals.amount_due}</td>
                            <td className='p-1 border-b border-r border-gray-800'>{supplierData.supplier_data.totals.amount_due}</td>

                        </tr>
                    )}
                </tbody>
            </table>
            

        </div>
    )
}

export default SingleSupplier
