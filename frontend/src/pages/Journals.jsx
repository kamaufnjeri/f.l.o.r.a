import React, { useEffect, useState } from 'react'
import FormHeader from '../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, getQueryParams } from '../lib/helpers';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { dateOptions, sortOptions } from '../lib/constants';
import FromToDateModal from '../components/modals/FromToDateModal';

const Journals = () => {
    const [openDateModal, setOpenDateModal] = useState(false);
    const [searchItem, setSearchItem] = useState({
        name: '',
        journals: 'all',
        date: 'all',
        sortBy: 'reset',
    })

    const [selectOptions, setSelectOptions] = useState([
        { name: "All", value: "all" },
        { name: "Invoice Journals", value: "is_invoices" },
        { name: "Bill Journals", value: "is_bills" },
        { name: "Bill and Invoice Journals", value: "is_bills_or_invoices" },
        { name: "Regular Journals", value: "is_not_bills_or_invoices" },
    ])

    const [journals, setJournals] = useState([]);
    const [journalsData, setJournalsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const getData = async () => {
        const newJournalsData = await getItems('journals', `?paginate=true`);
        setJournalsData(newJournalsData);
    }
    useEffect(() => {

        getData();
    }, [])
    const handleChange = async (e) => {
        setSearchItem({ ...searchItem, name: e.target.value });
        const queyParamsUrl = getQueryParams({
            type: 'journals',
            paginate: false,
            search: e.target.value,
            date: searchItem.date,
            sortBy: searchItem.sortBy,
            typeValue: searchItem.journals
        })
        const newJournals = await getItems('journals', queyParamsUrl);
        setJournals(newJournals)
    }
    const handleJournalsChange = async (e) => {
        setSearchItem({ ...searchItem, journals: e.target.value });
        const queyParamsUrl = getQueryParams({
            type: 'journals',
            paginate: true,
            search: '',
            date: searchItem.date,
            sortBy: searchItem.sortBy,
            typeValue: e.target.value
        })
        const newJournalsData = await getItems('journals', queyParamsUrl);
        setJournalsData(newJournalsData);
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
            const queyParamsUrl = getQueryParams({
                type: 'journals',
                paginate: true,
                search: '',
                date: e.target.value,
                sortBy: searchItem.sortBy,
                typeValue: searchItem.journals
            })
            const newJournalsData = await getItems('journals', queyParamsUrl);
            setJournalsData(newJournalsData);
            setPageNo(1);
        }


    }
    const handleSortsChange = async (e) => {
        setSearchItem({ ...searchItem, sortBy: e.target.value });
        const queyParamsUrl = getQueryParams({
            type: 'journals',
            paginate: true,
            search: '',
            date: searchItem.date,
            sortBy: e.target.value,
            typeValue: searchItem.journals
        })
        const newJournalsData = await getItems('journals', queyParamsUrl);
        setJournalsData(newJournalsData);
        setPageNo(1);

    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const queyParamsUrl = getQueryParams({
            type: 'journals',
            paginate: true,
            search: searchItem.name,
            date: searchItem.date,
            sortBy: searchItem.sortBy,
            typeValue: searchItem.journals
        })
        const newJournalsData = await getItems('journals', queyParamsUrl);
        setJournalsData(newJournalsData);
        setPageNo(1);
        setSearchItem({ ...searchItem, name: '' })
    }

    const nextPage = async () => {
        try {
            const response = await axios.get(journalsData.next);
            if (response.status == 200) {
                setJournalsData(response.data)
                setPageNo(pageNo + 1);
            } else {
                throw new Error();
            }
        }
        catch (error) {
            toast.error(`Error': Error fetching journals`);
        }
    }

    const previousPage = async () => {

        try {
            const response = await axios.get(journalsData.previous);
            if (response.status == 200) {
                setJournalsData(response.data)
                setPageNo(pageNo - 1);
            } else {
                throw new Error();
            }
        }
        catch (error) {
            toast.error(`Error': Error fetching Journals`);
        }
    }


    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setJournalsData}
                setPageNo={setPageNo}
                type='journals'
            />
            <FormHeader header='Journals List' />
            <div className='flex flex-row w-full items-center justify-between'>
                <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-1'>
                    <div className='w-[90%] relative h-[90%] flex flex-row gap-1'>
                        <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter journal number or description' value={searchItem.name} onChange={e => handleChange(e)} />
                        <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <select className='border-none outline-none' value={searchItem.journals} onChange={(e) => handleJournalsChange(e)}>
                                    {selectOptions.map((option, index) => (
                                        <option key={index} value={option.value}>{option.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='w-[35%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <select className='border-none outline-none' value={searchItem.date} onChange={(e) => handleDatesChange(e)}>
                                    {dateOptions.map((option, index) => (
                                        <option key={index} value={option.value}>{option.name}</option>
                                    ))}
                                    {searchItem.date && searchItem.date.includes('to') && (
                                        <option value={searchItem.date}>{searchItem.date}</option>
                                    )}
                                </select>

                            </div>
                            <div className='w-[30%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <select className='border-none outline-none' value={searchItem.sortBy} onChange={(e) => handleSortsChange(e)}>
                                    {sortOptions.map((option, index) => (
                                        <option key={index} value={option.value}>{option.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {journals.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {journals.map((journal) => (<Link to={`/journals/${journal.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{journal.serial_number}</Link>))}
                        </div>}
                    </div>

                    <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
                </form>

            </div>


            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Journal #</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1 '>Type</span>
                    <span className='w-[60%] border-gray-800 border-r-2 flex flex-col'>
                        <div className='flex flex-row flex-1'>
                            <span className='w-[60%] p-1'>Account</span>
                            <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit</span>
                            <span className='w-[20%] border-gray-800 border-l-2 p-1'>Credit</span>
                        </div>

                    </span>


                </div>
                {journalsData?.results?.data && journalsData.results.data.map((journal, index) => (
                    <Link to={`/journals/${journal.id}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={journal.id}>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{journal.serial_number}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{journal.date}</span>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1 '>{capitalizeFirstLetter(journal.type)}</span>


                        <span className='w-[60%] border-gray-800 border-r-2 flex flex-col'>
                            {journal.journal_entries.map((entry, index) =>
                                <div className={`flex flex-row flex-1`} key={index}>
                                    <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                                </div>)}
                            <div className={`flex flex-row flex-1`}>
                                <i className='text-sm w-[60%] p-1'>({journal.description})</i>
                                <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{journal?.journal_entries_total?.debit_total}</span>
                                <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{journal?.journal_entries_total?.debit_total}</span>
                            </div>
                        </span>


                    </Link>
                ))}
            </div>
            <div className='absolute bottom-1 flex flex-row gap-4 justify-center items-center cursor-pointer z-10'>
                {journalsData.previous && <FaAngleDoubleLeft onClick={previousPage} className='text-2xl' />}
                <span className='rounded-lg bg-gray-800 text-white h-8 flex items-center justify-center text-xl w-8'>{pageNo}</span>
                {journalsData.next && <FaAngleDoubleRight onClick={nextPage} className='text-2xl' />}
            </div>
        </div>
    )
}

export default Journals
