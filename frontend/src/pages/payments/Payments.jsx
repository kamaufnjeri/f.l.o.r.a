import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, paymentsQueryParams } from '../../lib/helpers';
import { FaTimes, FaEllipsisV } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useParams } from 'react-router-dom';
import DateFilter from '../../components/filters/DateFilter';
import SortFilter from '../../components/filters/SortFilter';
import FromToDateModal from '../../components/modals/FromToDateModal';
import TypesFilter from '../../components/filters/TypesFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';

const Payments = () => {
    const [openDateModal, setOpenDateModal] = useState(false);
    const { currentOrg } = useAuth();
    const [header, setHeader] = useState('Payments')

    const [searchItem, setSearchItem] = useState({
        name: '',
        type: "",
        date: '',
        sortBy: '',
        search: ''
    })
    const { orgId } = useParams();

    const [selectOptions, setSelectOptions] = useState([
        { name: "All", value: "all" },
        { name: "Invoices", value: "is_invoices" },
        { name: "Bills", value: "is_bills" },
    ])

    const [isVisible, setIsVisible] = useState(false);

    const openDropDown = () => {
        setIsVisible(true);
    }

    const closeDropDown = () => {
        setIsVisible(false);
    }

    const [payments, setPayments] = useState([]);
    const [paymentsData, setPaymentsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const getData = async () => {
        const newPaymentsData = await getItems(`${orgId}/payments`, `?paginate=true`);
        setPaymentsData(newPaymentsData);
        setHeader('Payments')

    }
    useEffect(() => {

        getData();
    }, [])
    const handleChange = async (e) => {
        setSearchItem(prev => ({ ...prev, name: e.target.value, search: '' }));
        const queyParamsUrl = paymentsQueryParams({
            type: searchItem.type,
            paginate: false,
            search: e.target.value,
            date: searchItem.date,
            sortBy: searchItem.sortBy,
        })
        const newPayments = await getItems(`${orgId}/payments`, queyParamsUrl);
        setPayments(newPayments)
    }
    const handleTypesChange = async (e) => {
        setSearchItem(prev => ({ ...prev, type: e.target.value, search: '' }));
        const queyParamsUrl = paymentsQueryParams({
            type: e.target.value,
            paginate: true,
            search: '',
            date: searchItem.date,
            sortBy: searchItem.sortBy
        })
        const newPaymentsData = await getItems(`${orgId}/payments`, queyParamsUrl);
        setPaymentsData(newPaymentsData);
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
            const queyParamsUrl = paymentsQueryParams({
                type: searchItem.type,
                paginate: true,
                search: '',
                date: e.target.value,
                sortBy: searchItem.sortBy,
            })
            const newPaymentsData = await getItems(`${orgId}/payments`, queyParamsUrl);
            setPaymentsData(newPaymentsData);
            setPageNo(1);
        }


    }
    const handleSortsChange = async (e) => {
        setSearchItem(prev => ({ ...prev, sortBy: e.target.value, search: '' }));
        const queyParamsUrl = paymentsQueryParams({
            type: searchItem.type,
            paginate: true,
            search: '',
            date: searchItem.date,
            sortBy: e.target.value,
        })
        const newPaymentsData = await getItems(`${orgId}/payments`, queyParamsUrl);
        setPaymentsData(newPaymentsData);
        setPageNo(1);

    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const queyParamsUrl = paymentsQueryParams({
            type: searchItem.type,
            paginate: true,
            search: searchItem.name,
            date: searchItem.date,
            sortBy: searchItem.sortBy,
        })
        const newPaymentsData = await getItems(`${orgId}/payments`, queyParamsUrl);
        setPaymentsData(newPaymentsData);
        setPageNo(1);
        setHeader(`Payments matching '${searchItem.name}'`)

        setSearchItem(prev => ({ ...prev, search: prev.name, name: '' }));
    }
    const nextPage = async () => {
        try {
            const response = await api.get(paymentsData.next);
            if (response.status == 200) {
                setPaymentsData(response.data)
                setPageNo(pageNo + 1);
            } else {
                throw new Error();
            }
        }
        catch (error) {
            toast.error(`Error': Error fetching payments`);
        }
    }

    const previousPage = async () => {

        try {
            const response = await api.get(paymentsData.previous);
            if (response.status == 200) {
                setPaymentsData(response.data)
                setPageNo(pageNo - 1);
            } else {
                throw new Error();
            }
        }
        catch (error) {
            toast.error(`Error': Error fetching Payments`);
        }
    }

    const downloadPDF = () => {
        const querlParams = paymentsQueryParams({
            type: searchItem.type,
            paginate: false,
            search: searchItem.search,
            date: searchItem.date,
            sortBy: searchItem.sortBy,
        });
        const url = `/${orgId}/payments/download/${querlParams}`;
        downloadListPDF(url, 'Payments')
    }

    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setPaymentsData}
                setPageNo={setPageNo}
                type='payments'
            />
            <div className='flex flex-row w-full items-center justify-between'>
                <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-1'>
                    <div className='w-[88%] relative h-[90%] flex flex-row gap-1'>
                        <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter serial number or description' value={searchItem.name} onChange={e => handleChange(e)} />
                        <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <TypesFilter handleTypesChange={handleTypesChange} searchItem={searchItem} selectOptions={selectOptions} type='type' />
                            </div>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <DateFilter handleDatesChange={handleDatesChange} searchItem={searchItem} />

                            </div>
                            <div className='w-[30%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <SortFilter handleSortsChange={handleSortsChange} searchItem={searchItem} />
                            </div>
                        </div>
                        {payments?.payments?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {payments.payments.map((payment) => (<Link to={`/dashboard/${orgId}${payment?.details?.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{
                                payment?.details?.serial_number
                            }</Link>))}
                        </div>}
                    </div>

                    <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
                </form>

                <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800' />
                <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                    <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />

                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
                        Download
                    </button>
                </div>
            </div>
            <FormHeader header={header} />


            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Payment #</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Serial No #</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
                    <span className='w-[30%] border-gray-800 border-r-2 flex flex-col'>
                    Description

                    </span>
                    <span className='w-[20%] border-gray-800 border-r-2 p-1 '>Amount Paid ({ currentOrg.currency })</span>
                   


                </div>
                {paymentsData?.results?.data && paymentsData.results.data.payments.map((payment, index) => (
                    <Link to={`/dashboard/${orgId}${payment?.details?.url}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={payment.id}>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{payment?.details?.serial_number}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{payment.date}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(payment?.details?.type)}</span>
                        <span className='w-[30%] border-gray-800 border-r-2 flex flex-col'>
                            
                            <div className={`flex flex-row flex-1`}>
                                <i className='text-sm w-[60%] p-1'>({payment.description})</i>
                            </div>
                        </span>

                        <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{payment.amount_paid}</span>

                       

                    </Link>
                ))}
                {paymentsData?.results?.data?.totals && <span className='text-right text-xl font-bold w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer'>


                    <span className='w-[80%] border-gray-800 border-r-2 p-1 underline '>Total</span>

                    <span className='w-[20%] border-gray-800 border-r-2 p-1 underline'>{paymentsData?.results?.data?.totals.amount_paid}</span>


                </span>}
            </div>
            <PrevNext pageNo={pageNo} data={paymentsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

        </div>
    )
}

export default Payments
