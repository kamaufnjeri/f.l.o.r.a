import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter, getItems, replaceDash } from '../lib/helpers';
import PaymentModal from '../components/modals/PaymentModal';

const SingleJournal = () => {
  const { id } = useParams();
  const [journal, setJournal] = useState({});
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [invoiceId, setInvoiceId] = useState(null);
  const [billId, setBillId] = useState(null);
  const [type, setType] = useState('');


  const showModal = (setOpenModal) => {
    setOpenModal(true);
  };

  const getData = async () => {
    const journal = await getItems(`journals/${id}`);
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
    

  }
  useEffect(() => {
   
    getData()
  }, []);

  const onPaymentSuccess = () => {
    getData()
  }

  return (
    <div className='flex flex-col gap-4 overflow-auto custom-scrollbar h-full'>
      <PaymentModal
        openModal={openPaymentModal}
       setOpenModal={setOpenPaymentModal}
       type={type} title={modalTitle}
       invoice_id={invoiceId}
       bill_id={billId}
       onPaymentSuccess={onPaymentSuccess}
      />


      <div className='w-full flex flex-col gap-2 justify-between'>
        <InfoContainer header={'Journal#'} info={journal.serial_number} />
        <InfoContainer header={'Date:'} info={journal.date} />
        <InfoContainer header={'Type:'} info={journal.type} />
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
              <span className='w-[60%] p-1'>Account</span>
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
              <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{journal?.journal_entries_total?.debit_total}</span>
            </div>
          </span>
        </div>
      </div>
      <div className='flex flex-row p-1 self-end w-[50%] gap-2 justify-between'>
        <Button className='w-[20%]' name='Download' color='purple' />
        <Button className='w-[20%]' name='Edit' color='blue' />
        <Button className='w-[20%]' name='Delete' color='red' />
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

const Button = ({ color, name }) => {
  return (
    <button className={`w-full bg-${color}-700 text-white rounded-md h-90px border-2 border-${color}-700 hover:bg-white hover:text-${color}-700`}>
      {name}
    </button>)
}
export default SingleJournal

