import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, invoiceBillQueryParam, replaceDash } from '../../lib/helpers';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dueDaysOptions, statusOptions } from '../../lib/constants';
import TypesFilter from '../../components/filters/TypesFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Bills = () => {
    const [searchItem, setSearchItem] = useState({
        name: '',
        dueDays: '',
        status: '',
        search: ''
    })
    const [isVisible, setIsVisible] = useState(false);
    const { currentOrg } = useAuth();
    const [header, setHeader] = useState('Bills');
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

    const { orgId } = useParams();
    const [bills, setBills] = useState([]);
    const [billsData, setBillsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const getData = async () => {
        const newBillsData = await getItems(`${orgId}/bills`, `?paginate=true`);
        setBillsData(newBillsData);
        setHeader('Bills');
    }
    useEffect(() => {

        getData();
    }, [])
    const handleChange = async (e) => {
        setSearchItem(prev => ({ ...prev, name: e.target.value, search: '' }));
        const queyParamsUrl = invoiceBillQueryParam({
            search: e.target.value,
            dueDays: searchItem.dueDays,
            status: searchItem.status,
            paginate: false
        })

        const newBills = await getItems(`${orgId}/bills`, queyParamsUrl);
        setBills(newBills)
    }

    const handleDueDaysChange = async (e) => {
        setSearchItem(prev => ({ ...prev, dueDays: e.target.value, search: '' }));
        const queyParamsUrl = invoiceBillQueryParam({
            search: '',
            dueDays: e.target.value,
            status: searchItem.status,
            paginate: true
        })

        const newBillsData = await getItems(`${orgId}/bills`, queyParamsUrl);
        setBillsData(newBillsData);
        setPageNo(1);

    }

    const handleStatusChange = async (e) => {

        setSearchItem(prev => ({ ...prev, status: e.target.value, search: '' }));
        const queyParamsUrl = invoiceBillQueryParam({
            search: '',
            dueDays: searchItem.dueDays,
            status: e.target.value,
            paginate: true
        })
        const newBillsData = await getItems(`${orgId}/bills`, queyParamsUrl);
        setBillsData(newBillsData);
        setPageNo(1);
    }




    const handleSubmit = async (e) => {
        e.preventDefault();
        const queyParamsUrl = invoiceBillQueryParam({
            search: searchItem.name,
            dueDays: searchItem.dueDays,
            status: searchItem.status,
            paginate: true
        })
        const newBillsData = await getItems(`${orgId}/bills`, queyParamsUrl);
        setBillsData(newBillsData);
        setPageNo(1);
        setHeader(`Bills matching '${searchItem.name}'`)
        setSearchItem(prev => ({ ...prev, name: '', search: prev.name }))
    }

    const nextPage = async () => {
        try {
            const response = await api.get(billsData.next);
            if (response.status == 200) {
                setBillsData(response.data)
                setPageNo(pageNo + 1);
            } else {
                throw new Error();
            }
        }
        catch (error) {
            toast.error(`Error': Error fetching bills`);
        }
    }

    const previousPage = async () => {

        try {
            const response = await api.get(billsData.previous);
            if (response.status == 200) {
                setBillsData(response.data)
                setPageNo(pageNo - 1);
            } else {
                throw new Error();
            }
        }
        catch (error) {
            toast.error(`Error': Error fetching bills`);
        }
    }

    const downloadPDF = () => {
        const querlParams = invoiceBillQueryParam({
            paginate: false,
            search: searchItem.search,
            dueDays: searchItem.dueDays,
            status: searchItem.status,
        });
        const url = `/${orgId}/bills/download/${querlParams}`;
        downloadListPDF(url, 'Bills')
    }
    return (
        <div className='flex flex-col items-start justify-start h-full gap-2 w-full '>

            <div className='flex flex-row w-full'>
                <form onSubmit={handleSubmit} className='grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 self-start w-full text-black items-center gap-2'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-2 relative col-span-2'>
                        <input type='name' className='h-10 border border-gray-800 rounded-md outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter purchase number or supplier' value={searchItem.name} onChange={e => handleChange(e)} />

                        <TypesFilter searchItem={searchItem} handleTypesChange={handleDueDaysChange} selectOptions={dueDaysOptions} type='dueDays' title='due days' />

                        <TypesFilter searchItem={searchItem} handleTypesChange={handleStatusChange} selectOptions={statusOptions} type='status' title='status' />

                        {bills?.bills?.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {bills?.bills?.map((bill) => (<Link to={`/dashboard/${orgId}${bill?.details?.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{bill.details.serial_number}</Link>))}
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
                <PrevNext pageNo={pageNo} data={billsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

            </div>

            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-b border-r border-gray-800'>Purchase #</th>
                        <th className='p-1 border-b border-r border-gray-800'>Date</th>
                        <th className='p-1 border-b border-r border-gray-800'>Due date</th>
                        <th className='p-1 border-b border-r border-gray-800'>Supplier</th>
                        <th className='p-1 border-b border-r border-gray-800'>Status</th>
                        <th className='p-1 border-b border-r border-gray-800'>Due days</th>
                        <th className='p-1 border-b border-r border-gray-800'>Type</th>
                        <th className='p-1 border-b border-r border-gray-800'>Amout paid ({currentOrg.currency})</th>
                        <th className='p-1 border-b border-r border-gray-800'>Amount due ({currentOrg.currency})</th>
                    </tr>
                </thead>
                <tbody>
                    {billsData?.results?.data?.bills && billsData?.results?.data?.bills.map((bill, index) => (
                        <tr key={index} className='hover:bg-gray-200 cursor-pointer'
                            onClick={() => handleRowClick(bill.details.url)}
                        >
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.details.serial_number}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.details.date}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.due_date}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.supplier_name}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {capitalizeFirstLetter(replaceDash(bill.status))}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {bill.details.due_days}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {capitalizeFirstLetter(bill.details.type)}
                            </td>


                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {bill.amount_paid}
                            </td>
                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {bill.amount_due}
                            </td>
                        </tr>
                    ))}
                    {billsData?.results?.data?.totals && (
                        <tr className='text-right font-bold bg-gray-300 '>
                            <td className='p-1 border-b border-r border-gray-800' colSpan={7}>Total</td>
                            <td className='p-1 border-b border-r border-gray-800'>{billsData?.results?.data?.totals.amount_paid}</td>
                            <td className='p-1 border-b border-r border-gray-800'>{billsData?.results?.data?.totals.amount_due}</td>

                        </tr>
                    )}
                </tbody>
            </table>


        </div>
    )
}

export default Bills
