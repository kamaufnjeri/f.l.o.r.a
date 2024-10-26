import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, paymentsQueryParams } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import DateFilter from '../components/filters/DateFilter';
import SortFilter from '../components/filters/SortFilter';
import FromToDateModal from '../components/modals/FromToDateModal';
import TypesFilter from '../components/filters/TypesFilter';
import PrevNext from '../components/shared/PrevNext';

const Payments = () => {
    const [openDateModal, setOpenDateModal] = useState(false);
    const [searchItem, setSearchItem] = useState({
        name: '',
        type: "",
        date: '',
        sortBy: '',
    })
    const { orgId } = useParams();

    const [selectOptions, setSelectOptions] = useState([
        { name: "All", value: "all" },
        { name: "Invoices", value: "invoices" },
        { name: "Bills", value: "bills" },
    ])

    const [payments, setPayments] = useState([]);
    const [paymentsData, setPaymentsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const getData = async () => {
        const newPaymentsData = await getItems(`${orgId}/payments`, `?paginate=true`);
        setPaymentsData(newPaymentsData);
    }
    useEffect(() => {

        getData();
    }, [])
    const handleChange = async (e) => {
        setSearchItem({ ...searchItem, name: e.target.value });
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
        setSearchItem({ ...searchItem, type: e.target.value });
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

            setSearchItem({ ...searchItem, date: e.target.value });
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
        setSearchItem({ ...searchItem, sortBy: e.target.value });
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
        setSearchItem({ ...searchItem, name: '' })
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
            <FormHeader header='Payments List' />
            <div className='flex flex-row w-full items-center justify-between'>
                <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-1'>
                    <div className='w-[90%] relative h-[90%] flex flex-row gap-1'>
                        <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter bill/invoice number or description' value={searchItem.name} onChange={e => handleChange(e)} />
                        <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <TypesFilter handleTypesChange={handleTypesChange} searchItem={searchItem} selectOptions={selectOptions} type='type'/>
                            </div>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <DateFilter handleDatesChange={handleDatesChange} searchItem={searchItem} />

                            </div>
                            <div className='w-[30%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <SortFilter handleSortsChange={handleSortsChange} searchItem={searchItem}/>
                            </div>
                        </div>
                        {payments.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {payments.map((payment) => (<Link to={`/${payment?.payment_data?.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{
                            payment?.payment_data?.type == "bill" ? payment?.payment_data?.bill_no : payment?.payment_data?.invoice_no
                            }</Link>))}
                        </div>}
                    </div>

                    <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
                </form>

            </div>


            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Payment #</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Bill/Invoice #</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Amount Paid</span>
                    <span className='w-[50%] border-gray-800 border-r-2 flex flex-col'>
                        <div className='flex flex-row flex-1'>
                            <span className='w-[60%] p-1'>Account</span>
                            <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit</span>
                            <span className='w-[20%] border-gray-800 border-l-2 p-1'>Credit</span>
                        </div>

                    </span>


                </div>
                {paymentsData?.results?.data && paymentsData.results.data.map((payment, index) => (
                    <Link to={`/${payment?.payment_data?.url}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={payment.id}>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{payment?.payment_data?.type == "bill" ? payment?.payment_data?.bill_no : payment?.payment_data?.invoice_no }</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{payment.date}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(payment?.payment_data?.type)}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{payment.amount_paid}</span>

                        <span className='w-[50%] border-gray-800 border-r-2 flex flex-col'>
                            {payment.journal_entries.map((entry, index) =>
                                <div className={`flex flex-row flex-1`} key={index}>
                                    <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                                </div>)}
                            <div className={`flex flex-row flex-1`}>
                                <i className='text-sm w-[60%] p-1'>({payment.description})</i>
                                <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{payment?.journal_entries_total?.debit_total}</span>
                                <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{payment?.journal_entries_total?.debit_total}</span>
                            </div>
                        </span>


                    </Link>
                ))}
            </div>
            <PrevNext pageNo={pageNo} data={paymentsData} previousPage={previousPage} nextPage={nextPage} className='w-full'/>

        </div>
    )
}

export default Payments
