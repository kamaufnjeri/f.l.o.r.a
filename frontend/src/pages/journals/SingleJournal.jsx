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
  const navigate = useNavigate();
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
    <div className='flex flex-col gap-4 overflow-y-auto relative overflow-x-hidden custom-scrollbar h-full'>
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
              {isLoading && <Loading/>}

      
      <div className='w-full flex flex-col gap-2 justify-between'>
        <div className='relative'>
          <InfoContainer header={'Journal#'} info={journal.serial_number} />
          <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
            
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[80%] p-1 rounded-sm' onClick={downloadJournalPDF}>
              Download
            </button>
            <Link to='edit' className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Edit
            </Link>
            <button onClick={deleteJournal} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Delete
            </button>


          </div>
        </div>

        <InfoContainer header={'Date:'} info={journal.date} />
      </div>
      
      
      <div className='p-1 flex flex-col'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-full border-gray-800 border-r-2 flex flex-col'>
            <div className='w-full flex flex-row flex-1'>
              <span className='w-[60%] p-1'>Description</span>
              <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit ({ currentOrg.currency })</span>
              <span className='w-[20%] border-gray-800 border-l-2 p-1'>Credit ({ currentOrg.currency })</span>
            </div>

          </span>

        </div>
        <div className='w-full flex flex-row font-bold border-b-2 border-gray-800 border-l-2'>
          <span className='w-full border-gray-800 border-r-2 flex flex-col'>
            {journal.journal_entries && journal.journal_entries.map((entry, index) =>
              <div className={`flex flex-row flex-1`} key={index}>
                <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
              </div>)}
            <div className={`flex flex-row flex-1`}>
              <i className='text-sm w-[60%] p-1'>({journal.description})</i>
              <span className='w-[20%] border-gray-800 border-l-2 underline p-1 text-right'>{journal?.journal_entries_total?.debit_total}</span>
              <span className='w-[20%] border-gray-800 border-l-2 underline p-1 text-right'>{journal?.journal_entries_total?.credit_total}</span>
            </div>
          </span>
        </div>
      </div>

    </div >
  )
}

const InfoContainer = ({ header, info }) => {
  return (
    <div className='w-full flex flex-row text-gray-900 gap-5 px-2'>
      <h5 className='w-[15%] text-lg font-bold'>
        {header}
      </h5>
      <span className='w-[85%] text-black font-semibold'>
        {info}
      </span>
    </div>
  )
}


export default SingleJournal

