import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, deleteRequest, getItems, replaceDash } from '../../lib/helpers';
import FromToDateModal from '../../components/modals/FromToDateModal';
import FormHeader from '../../components/forms/FormHeader';
import DateFilter from '../../components/filters/DateFilter';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import UpdateCustomerModal from '../../components/modals/UpdateCustomerModal.jsx';


const SingleCustomer = () => {
    const { orgId, id } = useParams();
    const [customerData, setCustomerData] = useState({})
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
        const newCustomerData = await getItems(`${orgId}/customers/${id}`);
        setCustomerData(newCustomerData)
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
            const newCustomerData = await getItems(`${orgId}/customers/${id}`, queyParamsUrl);
            setCustomerData(newCustomerData);
        }


    }

    const deleteCustomer = async () => {
        const response = await deleteRequest(`${orgId}/customers/${customerData.id}`);
        if (response.success) {
            toast.success('Customer deleted successfully');
            getSelectOptions();
            navigate(`/dashboard/${orgId}/customers`)
        } else {
            toast.error(`${response.error}`)

        }
    }
    const downloadPDF = () => {
        const querlParams = `?date=${searchItem.date}`
        const url = `/${orgId}/customers/${id}/download/${querlParams}`;
        downloadListPDF(url, `Customer ${customerData.name} Details`)
    }
    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setCustomerData}
                type={`customers/${id}`}
            />
            <UpdateCustomerModal

                setOpenModal={setOpenEditModal}
                openModal={openEditModal}
                setCustomerData={setCustomerData}
                customerData={customerData}
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
                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={deleteCustomer}>
                        Delete
                    </button>
                </div>

            </div>

            <FormHeader header={`Customer ${customerData.name} Details`} />

            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row justify-between mb-2'>
                    <span><strong>Name: </strong>{customerData.name}</span>
                    <span><strong>Email: </strong>{customerData.email}</span>
                    <span><strong>Phone Number: </strong>{customerData.phone_number}</span>

                </div>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Invoice #</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Due Date</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Status</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Due Days</span>

                    <span className='w-[20%] border-gray-800 border-r-2 p-1'>Details</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Amount Paid ({currentOrg.currency})</span>

                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Amount Due ({currentOrg.currency})</span>
                </div>
                {customerData?.customer_data && customerData.customer_data.invoices.map((invoice, index) => (
                    <Link to={invoice.details.url ? `/dashboard/${orgId}${invoice.details.url}` : ''} className={`w-full flex flex-row font-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer`} key={index}>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{ invoice.serial_number}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{invoice.details.date}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{invoice.due_date}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{invoice.details.type}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(replaceDash(invoice.status))}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{invoice.details.due_days}</span>
                        <span className='w-[20%] border-gray-800 border-r-2 p-1'>{invoice.details.description}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{invoice.amount_paid}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 text-right'>{invoice.amount_due}</span>

                    </Link>
                ))}
                {customerData?.customer_data?.totals && (
                    <div className={`w-full flex flex-row font-extrabold  underline text-right border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer`}>
                        <span className='w-[80%] border-gray-800 border-r-2 p-1'>Total</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{customerData?.customer_data.totals.amount_paid}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{customerData?.customer_data.totals.amount_due}</span>

                    </div>)}
            </div>

        </div>
    )
}

export default SingleCustomer
