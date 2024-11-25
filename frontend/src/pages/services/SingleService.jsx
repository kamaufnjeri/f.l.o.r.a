import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRequest, getItems } from '../../lib/helpers';
import FromToDateModal from '../../components/modals/FromToDateModal';
import FormHeader from '../../components/forms/FormHeader';
import DateFilter from '../../components/filters/DateFilter';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import UpdateServiceModal from '../../components/modals/UpdateServiceModal.jsx';


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
    const navigate = useNavigate();
    const { getSelectOptions } = useSelectOptions();

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

    const deleteService = async () => {
        const response = await deleteRequest(`${orgId}/services/${serviceData.id}`);
        if (response.success) {
            toast.success('Service deleted successfully');
            getSelectOptions();
            navigate(`/dashboard/${orgId}/services`)
        } else {
            toast.error(`${response.error}`)

        }
    }
    const downloadPDF = () => {
        const querlParams = `?date=${searchItem.date}`
        const url = `/${orgId}/services/${id}/download/${querlParams}`;
        downloadListPDF(url, `Service ${serviceData.name} Details`)
    }
    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setServiceData}
                type={`services/${id}`}
            />
            <UpdateServiceModal

                setOpenModal={setOpenEditModal}
                openModal={openEditModal}
                setServiceData={setServiceData}
                serviceData={serviceData}
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
                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={deleteService}>
                        Delete
                    </button>
                </div>

            </div>

            <FormHeader header={`Service ${serviceData.name} Details`} />

            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row gap-4 mb-2'>
                    <span><strong>Name: </strong>{serviceData.name}</span>
                    <span><strong>Description: </strong>{serviceData.description}</span>

                </div>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Service Income #</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[30%] border-gray-800 border-r-2 p-1 '>Details</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Quantity</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Rate ({currentOrg.currency})</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Total ({currentOrg.currency})</span>
                </div>
                {serviceData?.service_data && serviceData.service_data.entries.map((entry, index) => (
                    <Link to={entry.details.url ? `/dashboard/${orgId}${entry.details.url}` : ''} className={`w-full flex flex-row font-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer`} key={index}>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{entry.details.serial_number}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{entry.details.date}</span>
                        <span className='w-[30%] border-gray-800 border-r-2 p-1 '>{entry.details.description}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{entry.quantity}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{entry.price}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{entry.details.total}</span>

                    </Link>
                ))}
                {serviceData?.service_data?.total && (
                    <div className={`w-full flex flex-row font-extrabold  underline text-right border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer`}>
                        <span className='w-[85%] border-gray-800 border-r-2 p-1'>Total</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{serviceData?.service_data.total}</span>

                    </div>)}
            </div>

        </div>
    )
}

export default SingleService
