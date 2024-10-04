import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, invoiceBillQueryParam, replaceDash } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { dueDaysOptions, statusOptions } from '../lib/constants';
import TypesFilter from '../components/filters/TypesFilter';

const Bills = () => {
    const [searchItem, setSearchItem] = useState({
        name: '',
        dueDays: '',
        status: '',
    })
    const [bills, setBills] = useState([]);
    const [billsData, setBillsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const getData = async () => {
        const newbillsData = await getItems('bills', `?paginate=true`);
        setBillsData(newbillsData);
    }
    useEffect(() => {

        getData();
    }, [])
    const handleChange = async (e) => {
        setSearchItem({ ...searchItem, name: e.target.value });
        const queyParamsUrl = invoiceBillQueryParam({
            search: e.target.value,
            dueDays: searchItem.dueDays,
            status: searchItem.status,
            paginate: false
        })

        const newbills = await getItems('bills', queyParamsUrl);
        setBills(newbills)
    }

    const handleDueDaysChange = async (e) => {
        setSearchItem({ ...searchItem, dueDays: e.target.value });
        const queyParamsUrl = invoiceBillQueryParam({
            search: '',
            dueDays: e.target.value,
            status: searchItem.status,
            paginate: true
        })

        const newbillsData = await getItems('bills', queyParamsUrl);
        setBillsData(newbillsData);
        setPageNo(1);

    }

    const handleStatusChange = async (e) => {

        setSearchItem({ ...searchItem, date: e.target.value });
        const queyParamsUrl = invoiceBillQueryParam({
            search: '',
            dueDays: searchItem.dueDays,
            status: e.target.value,
            paginate: true
        })
        const newbillsData = await getItems('bills', queyParamsUrl);
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
        const newbillsData = await getItems('bills', queyParamsUrl);
        setBillsData(newbillsData);
        setPageNo(1);
        setSearchItem({ ...searchItem, name: '' })
    }

    const nextPage = async () => {
        try {
            const response = await axios.get(billsData.next);
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
            const response = await axios.get(billsData.previous);
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

    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>

            <FormHeader header='Bills List' />
            <div className='flex flex-row w-full items-center justify-between'>
                <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-2'>
                    <div className='w-[90%] relative h-[90%] flex flex-row gap-2'>
                        <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter bill number or supplier' value={searchItem.name} onChange={e => handleChange(e)} />
                        <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                               <TypesFilter searchItem={searchItem} handleTypesChange={handleDueDaysChange} selectOptions={dueDaysOptions} type='dueDays' title='due days'/>
                            </div>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                            <TypesFilter searchItem={searchItem} handleTypesChange={handleStatusChange} selectOptions={statusOptions} type='status' title='status'/>

                            </div>

                        </div>
                        {bills.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {bills.map((bill) => (<Link to={`/${bill?.bill_data?.url}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{bill.serial_number}</Link>))}
                        </div>}
                    </div>

                    <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
                </form>

            </div>


            <div className='overflow-auto custom-scrollbar flex flex-col max-h-[75%] flex-1 w-full m-2'>
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
                    <Link to={`/${bill?.bill_data?.url}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={bill.id}>
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
            <div className='absolute bottom-1 flex flex-row gap-4 justify-center items-center cursor-pointer z-10'>
                {billsData.previous && <FaAngleDoubleLeft onClick={previousPage} className='text-2xl' />}
                <span className='rounded-lg bg-gray-800 text-white h-8 flex items-center justify-center text-xl w-8'>{pageNo}</span>
                {billsData.next && <FaAngleDoubleRight onClick={nextPage} className='text-2xl' />}
            </div>
        </div>
    )
}

export default Bills
