import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, paymentsQueryParams } from '../../lib/helpers';
import { FaTimes, FaEllipsisV } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
    const [header, setHeader] = useState('Payments');
    const [searchItem, setSearchItem] = useState({
        name: '',
        type: "",
        date: '',
        sortBy: '',
        search: ''
    })
    const { orgId } = useParams();
    const navigate = useNavigate();

    const handleRowClick = (url) => {
        if (url) {
            navigate(`/dashboard/${orgId}${url}`);

        }
    };

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
        <div className='flex flex-col items-start justify-start h-full gap-2 w-full '>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setPaymentsData}
                setPageNo={setPageNo}
                type='payments'
            />
            < div className='flex flex-row w-full'>
                <form onSubmit={handleSubmit} className='grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 self-start w-full text-black items-center gap-2'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-2 relative col-span-2'>
                        <input type='name' className='h-10 border border-gray-800 rounded-md outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter serial number or description' value={searchItem.name} onChange={e => handleChange(e)} />

                        <TypesFilter handleTypesChange={handleTypesChange} searchItem={searchItem} selectOptions={selectOptions} type='type' />

                        <DateFilter handleDatesChange={handleDatesChange} searchItem={searchItem} />

                        <SortFilter handleSortsChange={handleSortsChange} searchItem={searchItem} />

                        {payments?.payments?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {payments.payments.map((payment) => (<Link to={`/dashboard/${orgId}${payment?.details?.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{
                                payment?.details?.serial_number
                            }</Link>))}
                        </div>}
                    </div>
                    <div className='grid grid-cols-2 gap-2 '>
                        <button className='h-10 w-[100px] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>

                        <div className='flex items-center justify-center place-self-end'>
                            <div className={`rounded-md p-1 bg-neutral-200 relative
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

                                <button type='button' className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                                    Download
                                </button>

                            </div>
                            {!isVisible ?
                                <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
                                <FaTimes className='cursor-pointer hover:text-purple-800  text-lg' onClick={closeDropDown} />

                            }

                        </div>
                    </div>

                </form>


            </div>
            <div className='flex flex-row items-center justify-between w-full'>
                <FormHeader header={header} />
                <PrevNext pageNo={pageNo} data={paymentsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

            </div>

            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-r border-b border-gray-800'>No.</th>
                        <th className='p-1 border-r border-b border-gray-800'>Purchase/ Sale/ Service Income #</th>
                        <th className='p-1 border-r border-b border-gray-800'>Date</th>
                        <th className='p-1 border-r border-b border-gray-800'>Type</th>

                        <th className='p-1 border-r border-b border-gray-800' colSpan={2}>Description</th>
                        <th className='p-1 border-r border-b border-gray-800'>Amount paid ({currentOrg?.currency})</th>

                    </tr>


                </thead>
                <tbody>
                    {paymentsData?.results?.data && paymentsData.results.data.payments.map((payment, index) => (
                        <tr
                            key={payment.id}
                            onClick={() => handleRowClick(payment?.details?.url)}

                            className="hover:bg-gray-200 cursor-pointer"
                        >
                            <td className="border-gray-800 border-r border-b p-1">

                                {index + 1}

                            </td>
                            <td className="border-gray-800 border-r border-b p-1">

                                {payment?.details?.serial_number}

                            </td>
                            <td className="border-gray-800 border-r border-b p-1">

                                {payment?.date}

                            </td>
                            <td className="border-gray-800 border-r border-b p-1">

                                {capitalizeFirstLetter(payment?.details?.type)}

                            </td>


                            <td className="border-gray-800 border-r border-b p-1" colSpan={2}>

                                <i className='text-sm'>({payment.description})</i>

                            </td>
                            <td className="border-gray-800 border-r border-b p-1 text-right">

                                {payment.amount_paid}

                            </td>
                        </tr>))}
                    {paymentsData?.results?.data?.totals &&
                        <tr className='text-right font-bold bg-gray-300'>
                            <td className='border-gray-800 border-r border-b p-1' colSpan={6}>Total</td>

                            <td className='border-gray-800 border-r border-b p-1'>{paymentsData?.results?.data?.totals.amount_paid}</td>
                        </tr>
                    }

                </tbody>

            </table>
        </div>
    )
}

export default Payments
