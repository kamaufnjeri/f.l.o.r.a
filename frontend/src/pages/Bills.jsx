import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, invoiceBillQueryParam, replaceDash } from '../lib/helpers';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { Link, useParams } from 'react-router-dom';
import { dueDaysOptions, statusOptions } from '../lib/constants';
import TypesFilter from '../components/filters/TypesFilter';
import PrevNext from '../components/shared/PrevNext';
import { downloadListPDF } from '../lib/download/downloadList';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';

const Bills = () => {
    const [searchItem, setSearchItem] = useState({
        name: '',
        dueDays: '',
        status: '',
        search: ''
    })
    const [isVisible, setIsVisible] = useState(false);

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
        const newbillsData = await getItems(`${orgId}/bills`, `?paginate=true`);
        setBillsData(newbillsData);
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

        const newbills = await getItems(`${orgId}/bills`, queyParamsUrl);
        setBills(newbills)
    }

    const handleDueDaysChange = async (e) => {
        setSearchItem(prev => ({ ...prev, dueDays: e.target.value, search: '' }));
        const queyParamsUrl = invoiceBillQueryParam({
            search: '',
            dueDays: e.target.value,
            status: searchItem.status,
            paginate: true
        })

        const newbillsData = await getItems(`${orgId}/bills`, queyParamsUrl);
        setBillsData(newbillsData);
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
        const newbillsData = await getItems(`${orgId}/bills`, queyParamsUrl);
        setBillsData(newbillsData);
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
        const newbillsData = await getItems(`${orgId}/bills`, queyParamsUrl);
        setBillsData(newbillsData);
        setPageNo(1);
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
        <div className='flex-1 flex flex-col items-center relative justify-center maincontainer-height mr-2'>

            <FormHeader header='Bills' />
            <div className='flex flex-row w-full items-center justify-between'>
                <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-2'>
                    <div className='w-[90%] relative h-[90%] flex flex-row gap-2'>
                        <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter bill number or supplier' value={searchItem.name} onChange={e => handleChange(e)} />
                        <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <TypesFilter searchItem={searchItem} handleTypesChange={handleDueDaysChange} selectOptions={dueDaysOptions} type='dueDays' title='due days' />
                            </div>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <TypesFilter searchItem={searchItem} handleTypesChange={handleStatusChange} selectOptions={statusOptions} type='status' title='status' />

                            </div>

                        </div>
                        {bills.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {bills.map((bill) => (<Link to={`/dashboard/${orgId}/${bill?.bill_data?.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{bill.serial_number}</Link>))}
                        </div>}
                    </div>

                    <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
                </form>
                <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
                <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                    <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />

                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
                        Download
                    </button>
                </div>

            </div>


            <div className='overflow-auto custom-scrollbar flex flex-col h-[500px] flex-1 w-full m-2'>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Bill #</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Due Date</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Type</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Supplier</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>Status</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Amount Due</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Amount Paid</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Due Days</span>

                </div>
                {billsData?.results?.data && billsData.results.data.map((bill, index) => (
                    <Link to={`/dashboard/${orgId}/${bill?.bill_data?.url}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={bill.id}>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{bill.serial_number}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{bill.due_date}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{capitalizeFirstLetter(bill.bill_data.type)}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{bill.supplier_name}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{capitalizeFirstLetter(replaceDash(bill.status))}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{bill.amount_due}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{bill.amount_paid}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{bill.bill_data.due_days}</span>
                    </Link>
                ))}
            </div>
            <PrevNext pageNo={pageNo} data={billsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

        </div>
    )
}

export default Bills
