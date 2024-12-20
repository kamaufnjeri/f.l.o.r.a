import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { capitalizeFirstLetter, getItems } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import UpdatePaymentModal from '../../components/modals/UpdatePaymentModal';
import DeleteModal from '../../components/modals/DeleteModal';
import { Button } from 'antd';

const SingleInvoicePayments = () => {
    const { id } = useParams()
    const [paymentsData, setPaymentsData] = useState([]);
    const [openUpdatePaymentModal, setOpenUpdatePaymentModal] = useState(false);
    const [paymentModalTitle, setPaymentModalTitle] = useState('')
    const [openDeleteModal, setOpenDeleteModal] = useState('');
    const [deleteUrl, setDeleteUrl] = useState('');
    const [deleteModalTitle, setDeleteModalTitle] = useState('');
    const [paymentId, setPaymentId] = useState(null);
    const [pageNo, setPageNo] = useState(1);
    const { orgId } = useParams();
    const { currentOrg } = useAuth();
    const [title, setTitle] = useState('')
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
        setTitle(newPaymentsData?.results?.data?.title)

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

    const openUpdatePaymentModalFunc = (paymentId) => {
        setPaymentId(paymentId);
        setPaymentModalTitle(`Edit payment ${paymentId}`);
        setOpenUpdatePaymentModal(true);

    }
    const onPaymentSuccess = () => {
        getData();
    }

    const deletePayment = (paymentId) => {
        const deleteUrl = `${orgId}/payments/${paymentId}`
        setDeleteUrl(deleteUrl);
        setDeleteModalTitle(`Payment ${paymentId}`);
        setOpenDeleteModal(true);
    }

    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
            <UpdatePaymentModal
                setOpenModal={setOpenUpdatePaymentModal}
                openModal={openUpdatePaymentModal}
                paymentId={paymentId}
                onPaymentSuccess={onPaymentSuccess}
                setPaymentId={setPaymentId}
                title={paymentModalTitle}
                type={'debit'}
            />
            <DeleteModal
                openModal={openDeleteModal}
                setOpenModal={setOpenDeleteModal}
                setDeleteUrl={setDeleteUrl}
                deleteUrl={deleteUrl}
                title={deleteModalTitle}
                setTitle={setDeleteModalTitle}
                getData={getData}
            />

            <FormHeader header={title} />
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
                    <div className='w-[90%] flex flex-row gap-2'>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>Payment #</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
                        <span className='w-[40%] border-gray-800 border-r-2 flex flex-col'>
                            <div className='flex flex-row flex-1'>
                                <span className='w-[60%] p-1'>Account</span>
                                <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit ({currentOrg.currency})</span>
                                <span className='w-[20%] border-gray-800 border-l-2 p-1'>Credit ({currentOrg.currency})</span>
                            </div>

                        </span>
                        <span className='w-[20%] border-gray-800 border-r-2 p-1 '>Amount Paid ({currentOrg.currency})</span>
                    </div>

                    <span className='w-[10%] border-gray-800 border-r-2 p-1'></span>


                </div>
                {paymentsData?.results?.data?.payments && paymentsData.results.data.payments.map((payment, index) => (
                    <div className='w-full flex flex-row font-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={payment.id}>
                        <Link to={`/dashboard/${orgId}${payment?.details?.url}`} className='w-[90%] flex flex-row gap-2'>

                            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
                            <span className='w-[15%] border-gray-800 border-r-2 p-1'>{payment.date}</span>
                            <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(payment?.details?.type)}</span>
                            <span className='w-[40%] border-gray-800 border-r-2 flex flex-col'>
                                {payment.journal_entries.map((entry, index) =>
                                    <div className={`flex flex-row flex-1`} key={index}>
                                        <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                                        <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                                        <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                                    </div>)}
                                <div className={`flex flex-row flex-1`}>
                                    <i className='text-sm w-[60%] p-1'>({payment.description})</i>

                                </div>
                            </span>
                            <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{payment.amount_paid}</span>
                        </Link>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 relative flex flex-col gap-2'>

                            <Button type="primary" className='w-full self-center' onClick={() => openUpdatePaymentModalFunc(payment.id)}>
                                Edit
                            </Button>
                            <Button type="primary" danger className='w-full self-center' onClick={() => deletePayment(payment.id)}>
                                Delete
                            </Button>

                        </span>

                    </div>
                ))}
                {paymentsData?.results?.data?.totals && <span className='text-right text-xl font-bold w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer'>


                    <span className='w-[71.8%] border-gray-800 border-r-2 p-1 underline text-right'>Total</span>

                    <span className='w-[18.2%] border-gray-800 border-r-2 p-1 underline text-right'>{paymentsData?.results?.data?.totals.amount_paid}</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '></span>


                </span>}
            </div>
            <PrevNext pageNo={pageNo} data={paymentsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />
        </div>
    )
}

export default SingleInvoicePayments
