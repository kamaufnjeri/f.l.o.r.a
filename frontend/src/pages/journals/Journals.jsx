import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, getQueryParams } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useParams } from 'react-router-dom';
import FromToDateModal from '../../components/modals/FromToDateModal';
import TypesFilter from '../../components/filters/TypesFilter';
import DateFilter from '../../components/filters/DateFilter';
import SortFilter from '../../components/filters/SortFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';

const Journals = () => {
    const [openDateModal, setOpenDateModal] = useState(false);
    const [searchItem, setSearchItem] = useState({
        name: '',
        search: '',
        date: '',
        sortBy: '',
    })
    const { orgId } = useParams();
    const [journals, setJournals] = useState([]);
    const [journalsData, setJournalsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [header, setHeader] = useState('Journals')

    const openDropDown = () => {
        setIsVisible(true);
    }

    const closeDropDown = () => {
        setIsVisible(false);
    }

    const getData = async () => {
        const newJournalsData = await getItems(`${orgId}/journals`, `?paginate=true`);
        setJournalsData(newJournalsData);
        setHeader('Journals')
    }
    useEffect(() => {

        getData();
    }, [])
    const handleChange = async (e) => {
        setSearchItem(prev => ({ ...prev, name: e.target.value, search: '' }));
        const queyParamsUrl = getQueryParams({
            paginate: false,
            search: e.target.value,
            date: searchItem.date,
            sortBy: searchItem.sortBy,
        })
        const newJournals = await getItems(`${orgId}/journals`, queyParamsUrl);
        setJournals(newJournals)
    }
   
    const showModal = (setOpenModal) => {
        setOpenModal(true);
    };
    const handleDatesChange = async (e) => {
        if (e.target.value === '*') {
            showModal(setOpenDateModal);
        } else {

            setSearchItem(prev => ({ ...prev, date: e.target.value, search: '' }));
            const queyParamsUrl = getQueryParams({
                paginate: true,
                search: '',
                date: e.target.value,
                sortBy: searchItem.sortBy,
            })
            const newJournalsData = await getItems(`${orgId}/journals`, queyParamsUrl);
            setJournalsData(newJournalsData);
            setPageNo(1);
        }


    }
    const handleSortsChange = async (e) => {
        setSearchItem(prev => ({ ...prev, sortBy: e.target.value, search: '' }));
        const queyParamsUrl = getQueryParams({
            paginate: true,
            search: '',
            date: searchItem.date,
            sortBy: e.target.value,
        })
        const newJournalsData = await getItems(`${orgId}/journals`, queyParamsUrl);
        setJournalsData(newJournalsData);
        setPageNo(1);

    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const queyParamsUrl = getQueryParams({
            paginate: true,
            search: searchItem.name,
            date: searchItem.date,
            sortBy: searchItem.sortBy,
        })
        const newJournalsData = await getItems(`${orgId}/journals`, queyParamsUrl);
        setJournalsData(newJournalsData);
        setPageNo(1);
        setHeader(`Journals matching '${searchItem.name}'`)
        setSearchItem(prev => ({ ...prev, search: prev.name, name: '' }))
    }

    const nextPage = async () => {
        try {
            const response = await api.get(journalsData.next);
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
            const response = await api.get(journalsData.previous);
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

    const downloadPDF = () => {
        const querlParams = getQueryParams({
            paginate: false,
            search: searchItem.search,
            date: searchItem.date,
            sortBy: searchItem.sortBy,
        });
        const url = `/${orgId}/journals/download/${querlParams}`;
        downloadListPDF(url, 'Journals')
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
            <div className='flex flex-row w-full items-center justify-between'>
                <form onSubmit={handleSubmit} className='flex h-10 flex-row self-start w-full text-black items-center gap-1'>
                    <div className='w-[80%] relative h-[90%] flex flex-row gap-1'>
                        <input type='name' className='w-[35%] h-full border-2 border-gray-800 rounded-md outline-none p-2' placeholder='Enter journal number or description' value={searchItem.name} onChange={e => handleChange(e)} />
                        <div className='p-1 flex flex-row gap-1 w-[65%] h-full font-bold text-sm'>

                           
                            <div className='w-[50%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />

                            </div>
                            <div className='w-[50%] rounded-md border-2 border-gray-800  cursor-pointer'>
                                <SortFilter searchItem={searchItem} handleSortsChange={handleSortsChange} />
                            </div>
                        </div>
                        {journals.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {journals.map((journal) => (<Link to={`${journal.id}`} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{journal.serial_number}</Link>))}
                        </div>}
                    </div>

                    <button className='w-[10%] h-[90%] bg-gray-800 rounded-md text-4xl flex items-center text-white  justify-center p-2 hover:bg-purple-800'> <MdSearch /> </button>
                </form>
                <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800' />
                <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                    <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />

                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
                        Download
                    </button>
                </div>
            </div>
            <FormHeader header={header}/>

            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Journal #</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[70%] border-gray-800 border-r-2 flex flex-col'>
                        <div className='flex flex-row flex-1'>
                            <span className='w-[60%] p-1'>Description</span>
                            <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit</span>
                            <span className='w-[20%] border-gray-800 border-l-2 p-1'>Credit</span>
                        </div>

                    </span>


                </div>
                {journalsData?.results?.data?.journals && journalsData.results.data?.journals.map((journal, index) => (
                    <Link to={`${journal.id}`} className='w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer' key={journal.id}>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{journal.serial_number}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1'>{journal.date}</span>


                        <span className='w-[70%] border-gray-800 border-r-2 flex flex-col'>
                            {journal.journal_entries.map((entry, index) =>
                                <div className={`flex flex-row flex-1`} key={index}>
                                    <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                                </div>)}
                            <div className={`flex flex-row flex-1`}>
                                <i className='text-sm w-[60%] p-1'>({journal.description})</i>

                            </div>
                        </span>


                    </Link>

                ))}
                {journalsData?.results?.data?.totals && <span className='text-right text-xl font-bold w-full flex flex-row text-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer'>


                    <span className='w-[72%] border-gray-800 border-r-2 p-1 underline '>Total</span>

                    <span className='w-[14%] border-gray-800 border-r-2 p-1 underline'>{journalsData?.results?.data?.totals.credit_total}</span>
                    <span className='w-[14%] border-gray-800 border-r-2 p-1 underline'>{journalsData?.results?.data?.totals.debit_total}</span>


                </span>}
            </div>
            <PrevNext pageNo={pageNo} data={journalsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

        </div>
    )
}

export default Journals
