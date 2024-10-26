import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { capitalizeFirstLetter, getItems,  replaceDash } from '../lib/helpers';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { Link, useParams } from 'react-router-dom';
import PrevNext from '../components/shared/PrevNext';

const SingleBillPayments = () => {
    const {id} = useParams()
    const [paymentsData, setPaymentsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const { orgId } = useParams();
    const getData = async () => {
        const newPaymentsData = await getItems(`${orgId}/bills/${id}/payments`, `?paginate=true`);
        setPaymentsData(newPaymentsData);
    }
    useEffect(() => {

        getData();
    }, [])
   
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
            toast.error(`Error': Error fetching payments`);
        }
    }

    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>

            <FormHeader header='Payments List' />
            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Payment #</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Bill #</span>
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
                    <Link to={`/dashboard/${orgId}/${payment?.payment_data?.url}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={payment.id}>
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

export default SingleBillPayments
