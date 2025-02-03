import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { MdSearch } from "react-icons/md";
import { capitalizeFirstLetter, getItems, getQueryParams } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FromToDateModal from '../../components/modals/FromToDateModal';
import TypesFilter from '../../components/filters/TypesFilter';
import DateFilter from '../../components/filters/DateFilter';
import SortFilter from '../../components/filters/SortFilter';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';

const Journals = () => {
    const [openDateModal, setOpenDateModal] = useState(false);
    const [searchItem, setSearchItem] = useState({
        name: '',
        search: '',
        date: '',
        sortBy: '',
    })
    const { currentOrg } = useAuth();
    const { orgId } = useParams();
    const [journals, setJournals] = useState([]);
    const [journalsData, setJournalsData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [header, setHeader] = useState('Journals');
    const navigate = useNavigate();

    const handleRowClick = (journalId) => {
        navigate(`/dashboard/${orgId}/journals/${journalId}`);
    };

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
        <div className='flex flex-col items-start justify-start h-full gap-2 w-full '>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setJournalsData}
                setPageNo={setPageNo}
                type='journals'
            />
            <div className='flex flex-row w-full'>
                <form onSubmit={handleSubmit} className='grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 self-start w-full text-black items-center gap-2 shadow-md rounded-md p-2'>
                    <div className='grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-2 relative col-span-2'>
                        <input type='name' className='h-10 border border-gray-800 rounded-md outline-none focus:border-none focus:ring-2 focus:ring-blue-500 p-2' placeholder='Enter journal number or description' value={searchItem.name} onChange={e => handleChange(e)} />

                        <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />


                        <SortFilter searchItem={searchItem} handleSortsChange={handleSortsChange} />

                        {journals.length > 0 && searchItem.name && <div className='max-h-36 overflow-auto  custom-scrollbar absolute left-0 top-10 flex flex-col bg-gray-800 p-2 rounded-md w-full z-10 text-white'>

                            {journals.map((journal) => (<Link to={`${journal.id}`} key={journal.id} className='hover:bg-white hover:text-gray-800 w-full cursor-pointer rounded-md p-1'>{journal.serial_number}</Link>))}
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
            <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

            <div className='flex flex-row items-center justify-between w-full'>
                <FormHeader header={header} />
                <PrevNext pageNo={pageNo} data={journalsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />
            </div>
            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-r border-b border-gray-800'>Journal #</th>
                        <th className='p-1 border-r border-b border-gray-800'>Date</th>
                        <th className='p-1 border-r border-b border-gray-800' colSpan={2}>Accounts</th>
                        <th className='p-1 border-r border-b border-gray-800'>Debit ({currentOrg?.currency})</th>
                        <th className='p-1 border-r border-b border-gray-800'>Credit ({currentOrg?.currency})</th>

                    </tr>


                </thead>
                <tbody>
                    {journalsData?.results?.data?.journals?.map((journal, journalIndex) => (
                        <>
                            {journal.journal_entries?.map((entry, entryIndex) => (
                                <tr
                                    key={`${journal.id}-${entry.id}`}
                                    className="cursor-pointer"
                                    onClick={() => handleRowClick(journal.id)}
                                >
                                    {entryIndex === 0 && (
                                        <>
                                            <td
                                                className="p-1 border-r border-b border-gray-800"
                                                rowSpan={journal.journal_entries.length + 1}
                                            >
                                                {journal.serial_number}
                                            </td>
                                            <td
                                                className="p-1 border-r border-b border-gray-800"
                                                rowSpan={journal.journal_entries.length + 1}
                                            >
                                                {journal.date}
                                            </td>
                                        </>
                                    )}
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
                                </tr>
                            ))}
                            <tr
                                onClick={() => handleRowClick(journal.id)}
                                className="cursor-pointer">

                                <td colSpan={5} className="border-r border-b border-gray-800 p-1 text-center space-x-2">
                                    <i className='text-sm'>({journal.description})</i>
                                </td>
                            </tr>

                        </>

                    ))}
                    {journalsData?.results?.data?.totals &&
                        <tr className='text-right font-bold bg-gray-300'>
                            <td className='border-gray-800 border-r border-b p-1' colSpan={4}>Total</td>

                            <td className='border-gray-800 border-r border-b p-1'>{journalsData?.results?.data?.totals?.debit_total}</td>
                            <td className='border-gray-800 border-r border-b p-1'>{journalsData?.results?.data?.totals?.credit_total}</td>
                        </tr>
                    }
                </tbody>

            </table>
            </div>
        </div>
    )
}

export default Journals
