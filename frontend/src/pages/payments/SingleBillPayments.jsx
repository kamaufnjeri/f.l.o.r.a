import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { capitalizeFirstLetter, deleteRequest, getItems, getNumber, replaceDash } from '../../lib/helpers';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PrevNext from '../../components/shared/PrevNext';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import { Button } from 'antd';
import UpdatePaymentModal from '../../components/modals/UpdatePaymentModal';
import DeleteModal from '../../components/modals/DeleteModal';

const SingleBillPayments = () => {
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
    const navigate = useNavigate();

    const handleRowClick = (url) => {
        navigate(`/dashboard/${orgId}${url}`);
    };

    const openDropDown = () => {
        setIsVisible(true);
    }

    const closeDropDown = () => {
        setIsVisible(false);
    }


    const getData = async () => {
        const newPaymentsData = await getItems(`${orgId}/bills/${id}/payments`, `?paginate=true`);
        setPaymentsData(newPaymentsData);
        setTitle(newPaymentsData?.results?.data?.title)
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
    const downloadPDF = () => {

        const url = `${orgId}}/bills/${id}/payments/download/`;
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
        <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
            <UpdatePaymentModal
                setOpenModal={setOpenUpdatePaymentModal}
                openModal={openUpdatePaymentModal}
                paymentId={paymentId}
                onPaymentSuccess={onPaymentSuccess}
                setPaymentId={setPaymentId}
                title={paymentModalTitle}
                type={'credit'}
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
            <div className='w-full flex flex-col gap-2 items-start justify-between shadow-md rounded-md p-2'>

                <div className='flex flex-row items-start justify-between w-[90%]'>
                    <FormHeader header={title} />
                    <PrevNext pageNo={pageNo} data={paymentsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

                    <div className='absolute  top-7 right-9'>
                        <div className={`rounded-md p-1 bg-neutral-200 absolute -top-3 right-5
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

                            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                                Download
                            </button>

                        </div>
                        {!isVisible ?
                            <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
                            <FaTimes className='cursor-pointer hover:text-purple-800  text-lg' onClick={closeDropDown} />

                        }
                    </div>
                </div>
            </div>
            <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-r border-b border-gray-800'>No.</th>
                        <th className='p-1 border-r border-b border-gray-800'>Date</th>
                        <th className='p-1 border-r border-b border-gray-800'>Type</th>
                        <th className='p-1 border-r border-b border-gray-800' colSpan={2}>Account</th>
                        <th className='p-1 border-r border-b border-gray-800'>Debit ({currentOrg?.currency})</th>
                        <th className='p-1 border-r border-b border-gray-800'>Credit ({currentOrg?.currency})</th>
                        <th className='p-1 border-r border-b border-gray-800'>Amount paid ({currentOrg?.currency})</th>
                        <th className='p-1 border-r border-b border-gray-800'></th>

                    </tr>


                </thead>
                <tbody>
                    {paymentsData?.results?.data && paymentsData.results.data.payments.map((payment, index) => (
                        <>
                            {payment?.journal_entries.map((entry, entryIndex) => (
                                <tr
                                    key={`${payment.id}-${entryIndex}`}
                                    onClick={() => handleRowClick(payment?.details?.url)}

                                    className="cursor-pointer"
                                >

                                    {entryIndex === 0 && <>
                                        <td className="border-gray-800 border-r border-b p-1" rowSpan={payment.journal_entries.length + 1}>

                                            {getNumber(pageNo, index)}
                                        </td>
                                        <td className="border-gray-800 border-r border-b p-1" rowSpan={payment.journal_entries.length + 1}>

                                            {payment?.date}
                                        </td>
                                        <td className="border-gray-800 border-r border-b p-1" rowSpan={payment.journal_entries.length + 1}>
                                            {capitalizeFirstLetter(payment?.details?.type)}
                                        </td>


                                    </>}

                                    <td
                                        className={`p-1 border-r border-b border-gray-800 ${entry.debit_credit === "debit" ? "" : "pl-14"
                                            }`}
                                        colSpan={2}
                                    >
                                        {entry.account_name}
                                    </td>
                                    <td className="border-gray-800 border-r border-b p-1 text-right">
                                        {entry.debit_credit === "debit" ? entry.amount : "-"}
                                    </td>
                                    <td className="border-gray-800 border-r border-b p-1 text-right">
                                        {entry.debit_credit === "credit" ? entry.amount : "-"}
                                    </td>
                                    {entryIndex === 0 && (
                                        <>
                                            <td className="border-gray-800 border-r border-b p-1 text-right" rowSpan={payment.journal_entries.length + 1}>

                                                {payment.amount_paid}

                                            </td>
                                            <td className="border-gray-800 border-r border-b p-1 space-y-2" rowSpan={payment.journal_entries.length + 1}>
                                                <Button type="primary" className='w-full self-center' onClick={(e) => {
                                                    e.stopPropagation();
                                                    openUpdatePaymentModalFunc(payment.id);
                                                    }}>
                                                    Edit
                                                </Button>
                                                <Button type="primary" danger className='w-full self-center' onClick={(e) => {
                                                    e.stopPropagation();
                                                     deletePayment(payment.id);
                                                    }}>
                                                    Delete
                                                </Button>

                                            </td>
                                        </>)}
                                </tr>

                            ))}
                            <tr
                                onClick={() => handleRowClick(payment.details.url)}
                                className="cursor-pointer">

                                <td colSpan={4} className="border-r border-b border-gray-800 p-1 text-center space-x-2">
                                    <i className='text-sm'>({payment.description})</i>
                                </td>
                            </tr>
                        </>
                    ))}
                    {paymentsData?.results?.data?.totals &&
                        <tr className='text-right font-bold bg-gray-300'>
                            <td className='border-gray-800 border-r border-b p-1' colSpan={6}>Total</td>

                            <td className='border-gray-800 border-r border-b p-1'>{paymentsData?.results?.data?.totals.amount_paid}</td>
                            <td className='border-gray-800 border-r border-b p-1'>{paymentsData?.results?.data?.totals.amount_paid}</td>
                            <td className='border-gray-800 border-r border-b p-1'></td>

                        </tr>
                    }
                </tbody>
            </table>
            </div>
        </div>
    )
}

export default SingleBillPayments
