import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRequest, getItems } from '../lib/helpers';
import FromToDateModal from '../components/modals/FromToDateModal';
import FormHeader from '../components/forms/FormHeader';
import DateFilter from '../components/filters/DateFilter';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../lib/download/downloadList';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useSelectOptions } from '../context/SelectOptionsContext';
import UpdateAccountModal from '../components/modals/UpdateAccountModal';


const SingleAccount = () => {
    const { orgId, id } = useParams();
    const [accountData, setAccountData] = useState({})
    const [searchItem, setSearchItem] = useState({
        date: ''
    })
    const { currentOrg } = useAuth();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDateModal, setOpenDateModal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const { getSelectOptions } = useSelectOptions();

    const openDropDown = () => {
        setIsVisible(true);
    }

    const closeDropDown = () => {
        setIsVisible(false);
    }


    const getData = async () => {
        const newAccountData = await getItems(`${orgId}/accounts/${id}`);
        setAccountData(newAccountData)
        console.log(newAccountData.account_data)
    }

    useEffect(() => {
        getData();
    }, [])

    const showModal = (setOpenModal) => {
        setOpenModal(true);
    };
    const handleDatesChange = async (e) => {
        if (e.target.value === '*') {
            showModal(setOpenDateModal);
        } else {

            setSearchItem(prev => ({ ...prev, date: e.target.value }));
            const queyParamsUrl = `?date=${e.target.value}`
            const newAccountData = await getItems(`${orgId}/accounts/${id}`, queyParamsUrl);
            setAccountData(newAccountData);
        }


    }

    const deleteAccount = async () => {
        const response = await deleteRequest(`${orgId}/accounts/${accountData.id}`);
        if (response.success) {
            toast.success('Account deleted successfully');
            getSelectOptions();
            navigate(`/dashboard/${orgId}/accounts`)
        } else {
            toast.error(`${response.error}`)

        }
    }
    const downloadPDF = () => {
        const querlParams = `?date=${searchItem.date}`
        const url = `/${orgId}/accounts/${id}/download/${querlParams}`;
        downloadListPDF(url, `${accountData.name} Account`)
    }
    return (
        <div className='flex-1 flex flex-col items-center relative h-full mr-2'>
            <FromToDateModal
                openModal={openDateModal}
                setOpenModal={setOpenDateModal}
                setSearchItem={setSearchItem}
                searchItem={searchItem}
                setData={setAccountData}
                type={`accounts/${id}`}
            />
            <UpdateAccountModal

                setOpenModal={setOpenEditModal}
                openModal={openEditModal}
                setAccountData={setAccountData}
                accountData={accountData}
            />
            <div className='flex flex-row w-full items-center justify-between'>
                <form className='flex h-10 flex-row self-start w-[70%] text-black items-center gap-2'>

                    <div className='w-[40%] rounded-md border-2 border-gray-800  cursor-pointer'>
                        <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />

                    </div>

                </form>
                <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800' />
                <div className={`absolute right-1 top-8 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
           border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                    <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />

                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadPDF}>
                        Download
                    </button>
                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={() => setOpenEditModal(true)}>
                        Edit
                    </button>
                    <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={deleteAccount}>
                        Delete
                    </button>
                </div>

            </div>

            <FormHeader header={`${accountData.name} Account`} />

            <div className='overflow-auto custom-scrollbar flex flex-col flex-1 max-h-[75%] w-full m-2'>
                <div className='w-full flex flex-row justify-between mb-2'>
                    <span><strong>Name: </strong>{accountData.name}</span>
                    <span><strong>Group: </strong>{accountData.group}</span>
                    <span><strong>Category: </strong>{accountData.category}</span>
                    <span><strong>Sub Category: </strong>{accountData.sub_category}</span>

                </div>
                <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                    <span className='w-[10%] border-gray-800 border-r-2 p-1'>No #</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Date</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1 '>Type</span>
                    <span className='w-[30%] border-gray-800 border-r-2 p-1'>Details</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Debit ({currentOrg.currency})</span>
                    <span className='w-[15%] border-gray-800 border-r-2 p-1'>Credit ({currentOrg.currency})</span>

                </div>
                {accountData?.account_data && accountData.account_data.entries.map((entry, index) => (
                    <Link to={entry.details.url ? `/dashboard/${orgId}${entry.details.url}` : ''} className={`w-full flex flex-row font-bold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer`} key={entry.id}>
                        <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{entry.details.date}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 '>{entry.details.type}</span>
                        <span className='w-[30%] border-gray-800 border-r-2 p-1'>{entry.details.description}</span>
                        {entry.debit_credit === 'debit' ? <>
                            <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{entry.amount}</span>
                            <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>-</span>
                        </> :
                            <>
                                <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>-</span>
                                <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{entry.amount}</span>
                            </>
                        }


                    </Link>
                ))}
                {accountData?.account_data?.totals && (
                    <><div className={`w-full flex flex-row font-extrabold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer underline`}>
                       
                        <span className='w-[70%] border-gray-800 border-r-2 p-1 text-right'>Total</span>

                        <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{accountData.account_data.totals.debit}</span>
                        <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{accountData.account_data.totals.credit}</span>
                    </div>
                    <div className={`w-full flex flex-row font-extrabold border-b-2 border-gray-800 border-l-2 hover:bg-gray-300 hover:cursor-pointer underline`}>
                       
                        <span className='w-[70%] border-gray-800 border-r-2 p-1 text-right'>Balance</span>

                        {accountData?.account_data?.totals.closing.debit_credit === 'debit' ? <>
                            <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{accountData?.account_data?.totals.closing.amount}</span>
                            <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'></span>
                        </> :
                            <>
                                <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'></span>
                                <span className='w-[15%] border-gray-800 border-r-2 p-1 text-right'>{accountData?.account_data?.totals.closing.amount}</span>
                            </>
                        }
                    </div>
                    </>
                    
                )}

            </div>
        </div>


    )
}

export default SingleAccount
