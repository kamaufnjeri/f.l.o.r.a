import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRequest, getItems } from '../../lib/helpers';
import FromToDateModal from '../../components/modals/FromToDateModal';
import FormHeader from '../../components/forms/FormHeader';
import DateFilter from '../../components/filters/DateFilter';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import UpdateAccountModal from '../../components/modals/UpdateAccountModal';
import DeleteModal from '../../components/modals/DeleteModal';


const SingleAccount = () => {
    const { orgId, id } = useParams();
    const [accountData, setAccountData] = useState({})
    const [searchItem, setSearchItem] = useState({
        date: ''
    })
    const { currentOrg } = useAuth();
    const [openDeleteModal, setOpenDeleteModal] = useState('');
    const [deleteUrl, setDeleteUrl] = useState('');
    const [deleteModalTitle, setDeleteModalTitle] = useState('');
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDateModal, setOpenDateModal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
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


    const getData = async () => {
        const newAccountData = await getItems(`${orgId}/accounts/${id}`);
        setAccountData(newAccountData)
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


    const deleteAccount = () => {
        const deleteUrl = `${orgId}/accounts/${accountData.id}`
        setDeleteUrl(deleteUrl);
        setDeleteModalTitle(`account ${accountData.name}`);
        setOpenDeleteModal(true);
    }

    const downloadPDF = () => {
        const querlParams = `?date=${searchItem.date}`
        const url = `/${orgId}/accounts/${id}/download/${querlParams}`;
        downloadListPDF(url, `${accountData.name} Account`)
    }
    return (
        <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
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
            <DeleteModal
                openModal={openDeleteModal}
                setOpenModal={setOpenDeleteModal}
                setDeleteUrl={setDeleteUrl}
                deleteUrl={deleteUrl}
                title={deleteModalTitle}
                setTitle={setDeleteModalTitle}
                getData={getData}
                navigateUrl={`/dashboard/${orgId}/accounts`}
            />
            <div className='grid grid-cols-2 w-full gap-4 items-start shadow-md rounded-md p-2'>
                <DateFilter searchItem={searchItem} handleDatesChange={handleDatesChange} />
                <div className='absolute  top-5 right-2'>
                    <div className={`rounded-md p-1 bg-neutral-200 absolute -top-3 right-5
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                            Download
                        </button>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={() => setOpenEditModal(true)}>
                            Edit
                        </button>
                        <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={deleteAccount}>
                            Delete
                        </button>
                    </div>
                    {!isVisible ?
                        <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
                        <FaTimes className='cursor-pointer hover:text-purple-800 text-lg' onClick={closeDropDown} />

                    }
                </div>

            </div>
            <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

            <div className='flex flex-col items-start justify-between w-full gap-2'>
                <FormHeader header={`${accountData.name} Account`} />
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-2 w-full'>
                    <span><strong>Name: </strong>{accountData.name}</span>
                    <span><strong>Group: </strong>{accountData.group}</span>
                    <span><strong>Category: </strong>{accountData.category}</span>
                    <span><strong>Sub Category: </strong>{accountData.sub_category}</span>
                </div>
            </div>
            <table className='min-w-full border-collapse border border-gray-800'>
                <thead>
                    <tr className='text-left bg-gray-400'>
                        <th className='p-1 border-b border-r border-gray-800'>No.</th>
                        <th className='p-1 border-b border-r border-gray-800'>Date</th>
                        <th className='p-1 border-b border-r border-gray-800'>Type</th>

                        <th className='p-1 border-b border-r border-gray-800' colSpan={2}>Details</th>

                        <th className='p-1 border-b border-r border-gray-800'>Debit ({currentOrg.currency})</th>
                        <th className='p-1 border-b border-r border-gray-800'>Credit ({currentOrg.currency})</th>
                    </tr>
                </thead>
                <tbody>
                    {accountData?.account_data && accountData.account_data.entries.map((entry, index) => (
                        <tr key={index} className='hover:bg-gray-200 cursor-pointer'
                            onClick={() => handleRowClick(entry.details.url)}
                        >
                            <td className='p-1 border-b border-r border-gray-800'>
                                {index + 1}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {entry.details.date}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800'>
                                {entry.details.type}
                            </td>
                            <td className='p-1 border-b border-r border-gray-800' colSpan={2}>
                                {entry.details.description}
                            </td>

                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {entry.debit_credit === "debit" ? entry.amount : "-"}
                            </td>
                            <td className="border-gray-800 border-r border-b p-1 text-right">
                                {entry.debit_credit === "credit" ? entry.amount : "-"}
                            </td>
                        </tr>
                    ))}
{accountData.account_data?.totals &&
                   <> <tr className='text-right font-bold bg-gray-300 '>
                        <td className='p-1 border-b border-r border-gray-800' colSpan={5}>Total</td>
                        <td className='p-1 border-b border-r border-gray-800'>{accountData.account_data.totals.debit}</td>
                        <td className='p-1 border-b border-r border-gray-800'>{accountData.account_data.totals.credit}</td>

                    </tr>
                    <tr className='text-right font-bold bg-blue-400 ' >
                        <td className='p-1 border-b border-r border-gray-800' colSpan={5}>Balance</td>

                        {accountData?.account_data?.totals.closing.debit_credit === 'debit' ? <>
                            <td className='p-1 border-b border-r border-gray-800'>{accountData?.account_data?.totals.closing.amount}</td>
                            <td className='p-1 border-b border-r border-gray-800'>-</td>
                        </> :
                            <>
                                <td className='p-1 border-b border-r border-gray-800'>-</td>

                                <td className='p-1 border-b border-r border-gray-800'>{accountData?.account_data?.totals.closing.amount}</td>
                            </>
                        }
                    </tr> </>}
                </tbody>
            </table>
            </div>
        </div>
    )
}

export default SingleAccount
