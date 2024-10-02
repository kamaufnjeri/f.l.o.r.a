
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter, getItems, replaceDash } from '../lib/helpers';
import PaymentModal from '../components/modals/PaymentModal';
import SalesReturnModal from '../components/modals/SalesReturnModal';

const SingleSale = () => {
  const { id } = useParams();
  const [sale, setSale] = useState({});
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openSaleReturnModal, setOpenSaleReturnModal] = useState();



 
  const showModal = (setOpenModal) => {
    setOpenModal(true);
  };
  const getData = async () => {
    const sale = await getItems(`sales/${id}`);
    setSale(sale)
  }

  const onPaymentSuccess = () => {
    getData()
  }
  useEffect(() => {
   
    getData()
  }, []);

  const hideJournalEntries = () => {
    setShowJournalEntries(!showJournalEntries)

    if (buttonName === 'Show Journal Entries') {
      SetButtonName('Hide Journal Entries')
    } else {
      SetButtonName('Show Journal Entries')
    }
  }
  return (
    <div className='flex flex-col gap-4 overflow-auto custom-scrollbar h-full'>
      <SalesReturnModal title={`Sales return of sale# ${sale?.serial_number}`}
      setOpenModal={setOpenSaleReturnModal}
       sale={sale} openModal={openSaleReturnModal}/>
      <PaymentModal 
      onPaymentSuccess={onPaymentSuccess}
      openModal={openPaymentModal} setOpenModal={setOpenPaymentModal} title={`Payment for invoice# ${sale?.invoice?.serial_number}`} type='debit' invoice_id={sale?.invoice?.id} />


      <div className='w-full flex flex-col gap-2 justify-between'>
        <InfoContainer header={'Sale#'} info={sale.serial_number} />
        <InfoContainer header={'Date:'} info={sale.date} />
        <InfoContainer header={'Type:'} info={sale?.items_data?.type} />
      </div>
      {sale?.items_data?.type === 'invoice' && 
      <div className='flex flex-col gap-2'>
        <div className='w-full flex flex-row'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Invoice #
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {sale?.invoice?.serial_number}
            </span>
          </div>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Customer Name:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {sale?.invoice?.customer_name}
            </span>
          </div>
        </div>
        
        {sale?.invoice?.amount_due > 0 && 
        <><div className='w-full flex flex-row'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Due Date:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {sale?.invoice?.due_date}
            </span>
          </div>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Amount Due:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {sale?.invoice?.amount_due}
              </span>
            </div>
          </div>
            <div className='w-full flex flex-row'>
              <div className='flex flex-row gap-5 w-[50%] px-2'>
                <h5 className='w-[40%] text-lg font-bold'>
                  Amount Paid:
                </h5>
                <span className='w-[60%] text-black font-semibold'>
                  {sale?.invoice?.amount_paid}
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
              {capitalizeFirstLetter(replaceDash(sale?.invoice?.status))}
            </span>
          </div>
        </div>
      </div>
      }
      <div className='p-1 flex flex-col'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>No#</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>Stock</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Sales Price</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Quantity</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Total Amount</span>


        </div>

        {sale.sales_entries && sale.sales_entries.map((entry, index) => (
          <div className='w-full flex flex-row text-xl font-bold border-b-2 border-gray-800 border-l-2' key={index}>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[30%] border-gray-800 border-r-2 p-1'>{entry.stock_name}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.sales_price}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.sold_quantity}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.sales_price * entry.sold_quantity}</span>
          </div>))}
        <div className='w-full flex flex-row text-xl font-bold border-b-2 border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 border-r-2 p-1 text-sm'><i>({sale.description})</i></span>
          <span className='w-[20%] border-gray-800 border-r-2 underline p-1'>Total</span>
          <span className='w-[20%] border-gray-800 border-r-2 underline p-1'>{sale?.items_data?.total_quantity}</span>
          <span className='w-[20%] border-gray-800 border-r-2 underline p-1'>{sale?.items_data?.total_amount}</span>
        </div>
        {sale?.discount_allowed &&
          <div className='flex flex-col gap-2'>
            <div className='w-full flex flex-row p-1'>
              <div className='flex flex-row gap-5 w-[50%]'>
                <h5 className='w-[50%] text-lg font-bold'>
                  Discount percentage
                </h5>
                <span className='w-[50%] text-black font-bold'>
                  {sale?.discount_allowed?.discount_percentage}%
                </span>
              </div>
              <div className='flex flex-row gap-5 w-[50%]'>
                <h5 className='w-[50%] text-lg font-bold'>
                  Discount Amount
                </h5>
                <span className='w-[50%] text-black font-bold'>
                  {sale?.discount_allowed?.discount_amount}
                </span>
              </div>
            </div>

          </div>}
        <div className='w-full flex flex-col p-1'>
          {showJournalEntries && <div className='p-1 flex flex-col w-full'>
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
                {sale.journal_entries && sale.journal_entries.map((entry, index) =>
                  <div className={`flex flex-row flex-1`} key={index}>
                    <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                  </div>)}
                <div className={`flex flex-row flex-1`}>
                  <i className='text-sm w-[60%] p-1'>({sale.description})</i>
                  <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{sale?.journal_entries_total?.debit_total}</span>
                  <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{sale?.journal_entries_total?.debit_total}</span>
                </div>
              </span>
            </div>
          </div>}
          <div className="w-full flex flex-row gap-4">

            <button onClick={hideJournalEntries} className={`w-[40%] bg-green-700 text-white rounded-md h-90px border-2 border-green-700 hover:bg-white hover:text-green-700`}>
              {buttonName}
            </button>
            <button onClick={() => showModal(setOpenSaleReturnModal)} className={`w-[40%] bg-purple-700 text-white rounded-md h-90px border-2 border-purple-700 hover:bg-white hover:text-purple-700`}>
              Sales Return
            </button>

          </div>

        </div>
        <div className='flex flex-row p-1 self-end w-[50%] gap-2 justify-between'>
          <button className={`w-full bg-purple-700 text-white rounded-md h-90px border-2 border-purple-700 hover:bg-white hover:text-purple-700`}>
            Download
          </button>
          <button className={`w-full bg-blue-700 text-white rounded-md h-90px border-2 border-blue-700 hover:bg-white hover:text-blue-700`}>
            Edit
          </button>
          <button className={`w-full bg-red-700 text-white rounded-md h-90px border-2 border-red-700 hover:bg-white hover:text-red-700`}>
            Delete
          </button>
        </div>
      </div >
    </div>
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

export default SingleSale

