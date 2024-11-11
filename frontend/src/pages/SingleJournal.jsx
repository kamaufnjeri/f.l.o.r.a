import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, getItems, replaceDash } from '../lib/helpers';
import PaymentModal from '../components/modals/PaymentModal';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import downloadPDF from '../lib/download/download';
import Loading from '../components/shared/Loading';

const SingleJournal = () => {
  const { id } = useParams();
  const [journal, setJournal] = useState({});
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [invoiceId, setInvoiceId] = useState(null);
  const [billId, setBillId] = useState(null);
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { orgId } = useParams();
  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }


  const showModal = (setOpenModal) => {
    setOpenModal(true);
  };

  const getData = async () => {
    setIsLoading(true)
    const journal = await getItems(`${orgId}/journals/${id}`);
    setJournal(journal)
    if (journal.type == 'invoice') {
      setModalTitle(`Payment for invoice# ${journal?.invoice?.serial_number}`)
      setInvoiceId(journal?.invoice?.id)
      setType('debit');

    } else if (journal.type == 'bill') {
      setModalTitle(`Payment for bill# ${journal?.bill?.serial_number}`)
      setBillId(journal?.bill?.id)
      setType('credit')
    }
    setIsLoading(false)

  }
  useEffect(() => {

    getData()
  }, []);

  const onPaymentSuccess = () => {
    getData()
  }

  const downloadJournalPDF = () => {
    setIsLoading(true)
    let title = 'Journal'

    if (journal.type == 'invoice') {
      title = title.concat(' invoice')

    } else if (journal.type == 'bill') {
      title = title.concat(' bill')

    }
    
    
    downloadPDF(journal, orgId, title)
    setIsLoading(false)
  }
  return (
    <div className='flex flex-col gap-4 overflow-y-auto relative overflow-x-hidden custom-scrollbar h-full'>
              {isLoading && <Loading/>}

      <PaymentModal
        openModal={openPaymentModal}
        setOpenModal={setOpenPaymentModal}
        type={type} title={modalTitle}
        invoice_id={invoiceId}
        bill_id={billId}
        onPaymentSuccess={onPaymentSuccess}
      />


      <div className='w-full flex flex-col gap-2 justify-between'>
        <div className='relative'>
          <InfoContainer header={'Journal#'} info={journal.serial_number} />
          <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
            {(journal.type !== 'regular' &&
              ((journal?.bill?.status && journal.bill.status !== "unpaid") ||
                (journal?.invoice?.status && journal.invoice.status !== "unpaid"))
            ) && <Link to={journal.type === 'bill' ? `/dashboard/${orgId}/bills/${journal?.bill?.id}/payments` : `/dashboard/${orgId}/invoices/${journal?.invoice?.id}/payments`} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                Paments
              </Link>}
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadJournalPDF}>
              Download
            </button>
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Edit
            </button>
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Delete
            </button>


          </div>
        </div>

        <InfoContainer header={'Date:'} info={journal.date} />
        <InfoContainer header={'Type:'} info={capitalizeFirstLetter(journal.type)} />
      </div>
      {(journal.type === 'bill' || journal.type === 'invoice') && <div className='flex flex-col gap-2'>
        <div className='w-full flex flex-row'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              {journal.type === 'invoice' ? 'Invoice' : 'Bill'} #
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {journal.type === 'bill' ? journal.bill.serial_number : journal.invoice.serial_number}
            </span>
          </div>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              {journal.type === 'bill' ? 'Supplier ' : 'Customer '}Name:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {journal.type === 'bill' ? journal.bill.supplier_name : journal.invoice.customer_name}
            </span>
          </div>
        </div>
        {(journal?.bill?.amount_due > 0 || journal?.invoice?.amount_due > 0) &&

          <><div className='w-full flex flex-row'>
            <div className='flex flex-row gap-5 w-[50%] px-2'>
              <h5 className='w-[40%] text-lg font-bold'>
                Due Date:
              </h5>
              <span className='w-[60%] text-black font-semibold'>
                {journal.type === 'bill' ? journal.bill.due_date : journal.invoice.due_date}
              </span>
            </div>
            <div className='flex flex-row gap-5 w-[50%] px-2'>
              <h5 className='w-[40%] text-lg font-bold'>
                Amount Due:
              </h5>
              <span className='w-[60%] text-black font-semibold'>
                {journal.type === 'bill' ? journal.bill.amount_due : journal.invoice.amount_due}
              </span>
            </div>
          </div>
            <div className='w-full flex flex-row'>
              <div className='flex flex-row gap-5 w-[50%] px-2'>
                <h5 className='w-[40%] text-lg font-bold'>
                  Amount Paid:
                </h5>
                <span className='w-[60%] text-black font-semibold'>
                  {journal.type === 'bill' ? journal.bill.amount_paid : journal.invoice.amount_paid}
                </span>
              </div>
              <div className='flex flex-row gap-5 w-[50%] px-2'>
                <button onClick={() => showModal(setOpenPaymentModal)} className={`w-[40%] bg-green-700 text-white rounded-md h-90px border-2 border-green-700 hover:bg-white hover:text-green-700`}>
                  Pay
                </button>

              </div>
            </div>
          </>}
        <div className="w-full flex flex-row">
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Status:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {journal.type === 'bill' ? capitalizeFirstLetter(replaceDash(journal?.bill?.status)) : capitalizeFirstLetter(replaceDash(journal?.invoice?.status))}
            </span>
          </div>
        </div>
      </div>
      }
      <div className='p-1 flex flex-col'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-full border-gray-800 border-r-2 flex flex-col'>
            <div className='w-full flex flex-row flex-1'>
              <span className='w-[60%] p-1'>Description</span>
              <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit</span>
              <span className='w-[20%] border-gray-800 border-l-2 p-1'>Credit</span>
            </div>

          </span>

        </div>
        <div className='w-full flex flex-row font-bold border-b-2 border-gray-800 border-l-2'>
          <span className='w-full border-gray-800 border-r-2 flex flex-col'>
            {journal.journal_entries && journal.journal_entries.map((entry, index) =>
              <div className={`flex flex-row flex-1`} key={index}>
                <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
              </div>)}
            <div className={`flex flex-row flex-1`}>
              <i className='text-sm w-[60%] p-1'>({journal.description})</i>
              <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{journal?.journal_entries_total?.debit_total}</span>
              <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{journal?.journal_entries_total?.credit_total}</span>
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

