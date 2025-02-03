import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getItems } from '../../lib/helpers';
import FromToDateModal from '../../components/modals/FromToDateModal';
import FormHeader from '../../components/forms/FormHeader';
import DateFilter from '../../components/filters/DateFilter';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import UpdateServiceModal from '../../components/modals/UpdateServiceModal.jsx';
import DeleteModal from '../../components/modals/DeleteModal.jsx';


const SingleService = () => {
    const { orgId, id } = useParams();
    const [serviceData, setServiceData] = useState({})
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
        const newServiceData = await getItems(`${orgId}/services/${id}`);
        setServiceData(newServiceData)
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
            const newServiceData = await getItems(`${orgId}/services/${id}`, queyParamsUrl);
            setServiceData(newServiceData);
        }


    }


    const deleteService = () => {
        const deleteUrl = `${orgId}/services/${serviceData.id}`
        setDeleteUrl(deleteUrl);
        setDeleteModalTitle(`service ${serviceData.name}`);
        setOpenDeleteModal(true);
    }

    const downloadPDF = () => {
        const querlParams = `?date=${searchItem.date}`
        const url = `/${orgId}/services/${id}/download/${querlParams}`;
        downloadListPDF(url, `Service ${serviceData.name} Details`)
    }
    return (
        <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setServiceData}
                type={`services/${id}`}
            />
            <DeleteModal
                openModal={openDeleteModal}
                setOpenModal={setOpenDeleteModal}
                setDeleteUrl={setDeleteUrl}
                deleteUrl={deleteUrl}
                title={deleteModalTitle}
                setTitle={setDeleteModalTitle}
                getData={getData}
                navigateUrl={`/dashboard/${orgId}/services`}
            />
            <UpdateServiceModal

                setOpenModal={setOpenEditModal}
                openModal={openEditModal}
                setServiceData={setServiceData}
                serviceData={serviceData}
            />
            <div className='grid grid-cols-2 w-full gap-4 items-start shadow-md rounded-md p-2'>
                <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />
                <div className=' absolute  top-5 right-2'>
                    <div className={`rounded-md p-1 bg-neutral-200 absolute -top-3 right-5
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                            Download
                        </button>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={() => setOpenEditModal(true)}>
                            Edit
                        </button>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={deleteService}>
                            Delete
                        </button>
                    </div>
                    {!isVisible ?
                        <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
                        <FaTimes className='cursor-pointer hover:text-purple-800 text-lg' onClick={closeDropDown} />

                    }

                </div>

            </div>
            <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

            <div className='flex flex-col items-start justify-between w-full gap-2'>
                <FormHeader header={`Service ${serviceData.name} Details`} />
                <div className='w-full flex lg:flex-row md:flex-row flex-col gap-4 mb-2'>
                    <span><strong>Name: </strong>{serviceData.name}</span>
                    <span><strong>Description: </strong>{serviceData.description}</span>

                </div>
            </div>
            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-b border-r border-gray-800'>Service Income #</th>
                        <th className='p-1 border-b border-r border-gray-800'>Date</th>
                        <th className='p-1 border-b border-r border-gray-800' colSpan={2}>Details</th>
                        <th className='p-1 border-b border-r border-gray-800'>Quantity</th>
                        <th className='p-1 border-b border-r border-gray-800'>Rate ({currentOrg.currency})</th>
                        <th className='p-1 border-b border-r border-gray-800'>Total ({currentOrg.currency})</th>
                    </tr>
                </thead>
                <tbody>
                    {serviceData?.service_data && serviceData.service_data.entries.map((entry, index) => (
                        <tr key={entry.id} className='hover:bg-gray-200 cursor-pointer'
                            onClick={() => handleRowClick(entry.details.url)}
                        >
                            <td className='p-1 border-b border-r border-gray-800'>
                                {entry.details.serial_number}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {entry.details.date}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800' colSpan={2}>
                                {entry.details.description}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800 text-right'>
                                {entry.quantity}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800 text-right'>
                                {entry.price}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800 text-right'>
                                {entry.details.total}</td>
                        </tr>
                    ))}

                    <tr className='text-right font-bold bg-gray-300 '>
                        <td className='p-1 border-b border-r border-gray-800' colSpan={6}>Total</td>
                        <td className='p-1 border-b border-r border-gray-800'>{serviceData?.service_data?.total}</td>
                    </tr>
                </tbody>
            </table>
</div>
        </div>
    )
}

export default SingleService
