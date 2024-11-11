import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { capitalizeFirstLetter, getItems, replaceDash } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft, FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import PrevNext from '../components/shared/PrevNext';
import { downloadListPDF } from '../lib/download/downloadList';

const SingleInvoicePayments = () => {
    const { id } = useParams()
    const [paymentsData, setPaymentsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const { orgId } = useParams();
    const [title , setTitle] = useState('')
    const [isVisible, setIsVisible] = useState(false);

    const openDropDown = () => {
        setIsVisible(true);
    }

    const closeDropDown = () => {
        setIsVisible(false);
    }


    const getData = async () => {
        const newPaymentsData = await getItems(`${orgId}}/invoices/${id}/payments`, `?paginate=true`);
        setPaymentsData(newPaymentsData);
        setTitle(`Payments for invoice ${newPaymentsData?.results?.data.payments[0].payment_data.serial_no}`)

    }
    useEffect(() => {

        getData();
    }, [])
    const nextPage = async () => {
        try {
            const response = await axios.get(paymentsData.next);
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
            const response = await axios.get(paymentsData.previous);
            if (response.status == 200) {
                setPaymentsData(response.data)
                setPageNo(pageNo - 1);
            } else {
                throw new Error();
            }
        }
        catch (error) {
            toast.error(`Error': Error fetching payments`);
        }
    }
 const downloadPDF = () => {
       
        const url = `${orgId}}/invoices/${id}/payments/download/`;
        downloadListPDF(url, title)
    }
    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>

            <FormHeader header={title}/>
            <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
                <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                    <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />

                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
                        Download
                    </button>
                </div>
            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Payment #</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Amount Paid</span>
                    <span className='w-[60%] border-gray-800 border-r-2 flex flex-col'>
                        <div className='flex flex-row flex-1'>
                            <span className='w-[60%] p-1'>Account</span>
                            <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit</span>
                            <span className='w-[20%] border-gray-800 border-l-2 p-1'>Credit</span>
                        </div>

                    </span>


                </div>
                {paymentsData?.results?.data?.payments && paymentsData.results.data.payments.map((payment, index) => (
                    <Link to={`/dashboard/${orgId}/${payment?.payment_data?.url}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={payment.id}>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{payment.date}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(payment?.payment_data?.type)}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{payment.amount_paid}</span>

                        <span className='w-[60%] border-gray-800 border-r-2 flex flex-col'>
                            {payment.journal_entries.map((entry, index) =>
                                <div className={`flex flex-row flex-1`} key={index}>
                                    <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                                </div>)}
                            <div className={`flex flex-row flex-1`}>
                                <i className='text-sm w-[60%] p-1'>({payment.description})</i>

                            </div>
                        </span>


                    </Link>
                ))}
                {paymentsData?.results?.data?.totals && <span className='text-right text-xl font-bold w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer'>


                    <span className='w-[76%] border-gray-800 border-r-2 p-1 underline '>Total</span>

                    <span className='w-[12%] border-gray-800 border-r-2 p-1 underline'>{paymentsData?.results?.data?.totals.credit_total}</span>
                    <span className='w-[12%] border-gray-800 border-r-2 p-1 underline'>{paymentsData?.results?.data?.totals.debit_total}</span>


                </span>}
            </div>
            <PrevNext pageNo={pageNo} data={paymentsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />
        </div>
    )
}

export default SingleInvoicePayments
