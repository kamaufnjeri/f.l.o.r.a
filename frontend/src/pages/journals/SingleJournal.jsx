import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getItems } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import downloadPDF from '../../lib/download/download';
import Loading from '../../components/shared/Loading';
import { useAuth } from '../../context/AuthContext';
import DeleteModal from '../../components/modals/DeleteModal';


const SingleJournal = () => {
  const { id } = useParams();
  const [journal, setJournal] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { orgId } = useParams();
  const { currentOrg } = useAuth();
  const [openDeleteModal, setOpenDeleteModal] = useState('');
  const [deleteUrl, setDeleteUrl] = useState('');
  const [deleteModalTitle, setDeleteModalTitle] = useState('');

  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }




  const getData = async () => {
    setIsLoading(true)
    const journal = await getItems(`${orgId}/journals/${id}`);
    setJournal(journal)

    setIsLoading(false)

  }
  useEffect(() => {

    getData()
  }, []);


  const deleteJournal = () => {
    const deleteUrl = `${orgId}/journals/${journal.id}`
    setDeleteUrl(deleteUrl);
    setDeleteModalTitle(`journal ${journal.serial_number}`);
    setOpenDeleteModal(true);
  }

  const downloadJournalPDF = () => {
    setIsLoading(true)
    let title = 'Journal'

    downloadPDF(journal, orgId, title)
    setIsLoading(false)
  }
  return (
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <DeleteModal
        openModal={openDeleteModal}
        setOpenModal={setOpenDeleteModal}
        setDeleteUrl={setDeleteUrl}
        deleteUrl={deleteUrl}
        title={deleteModalTitle}
        setTitle={setDeleteModalTitle}
        getData={getData}
        navigateUrl={`/dashboard/${orgId}/journals`}
      />
      {isLoading && <Loading />}
      <div className='w-full flex flex-col gap-2 shadow-md rounded-md p-2'>
        <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2'>
          <div className='grid grid-cols-2 w-full lg:col-span-1 md:col-span-1 col-span-2'>
            <h5 className='text-lg font-bold'>
              Journal #:
            </h5>
            <span className='text-black font-semibold'>
              {journal?.serial_number}
            </span>
          </div>
          <div className=' absolute  top-5 right-2'>
            <div className={`rounded-md p-1 bg-neutral-200 absolute -top-3 right-5
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

              <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadJournalPDF}>
                Download
              </button>
              <Link to='edit' className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                Edit
              </Link>
              <button onClick={deleteJournal} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                Delete
              </button>

            </div>
            {!isVisible ?
              <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
              <FaTimes className='cursor-pointer hover:text-purple-800  text-lg' onClick={closeDropDown} />

            }
          </div>
          <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 min-w-full'>
            <div className='grid grid-cols-2 w-full'>
              <h5 className='text-lg font-bold'>
                Date:
              </h5>
              <span className='text-black font-semibold'>
                {journal?.date}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>

      <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>

            <th className='p-1 border-r border-b border-gray-800' colSpan={2}>Accounts</th>
            <th className='p-1 border-r border-b border-gray-800'>Debit ({currentOrg?.currency})</th>
            <th className='p-1 border-r border-b border-gray-800'>Credit ({currentOrg?.currency})</th>
          </tr>
        </thead>
        <tbody>
          {journal.journal_entries?.map((entry, entryIndex) => (
            <tr
              key={`${journal.id}-${entry.id}`}
              className="cursor-pointer"
              onClick={() => handleRowClick(journal.id)}
            >

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

            <td colSpan={4} className="border-r border-b border-gray-800 p-1 text-center space-x-2">
              <i className='text-sm'>({journal.description})</i>
            </td>
          </tr>
          <tr className='text-right font-bold bg-gray-300'>
            <td className='border-gray-800 border-r border-b p-1' colSpan={2}>Total</td>

            <td className='border-gray-800 border-r border-b p-1'>{journal?.journal_entries_total?.debit_total}</td>
            <td className='border-gray-800 border-r border-b p-1'>{journal?.journal_entries_total?.credit_total}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div >
  )
}



export default SingleJournal

