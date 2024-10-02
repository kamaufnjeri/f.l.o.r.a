import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter, getItems, replaceDash } from '../lib/helpers';
import PaymentModal from '../components/modals/PaymentModal';
import PurchaseReturnModal from '../components/modals/PurchaseReturnModal';

const SinglePurchase = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState({});
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openPurchaseReturnModal, setOpenPurchaseReturnModal] = useState();

  const getData = async () => {
    const purchase = await getItems(`purchases/${id}`);
    setPurchase(purchase)
  }

  useEffect(() => {
    
    getData()
  }, []);
  const showModal = (setOpenModal) => {
    setOpenModal(true);
  };

  const onPaymentSuccess = () => {
    getData()
  }
  const hideJournalEntries = () => {
    setShowJournalEntries(!showJournalEntries)

    console.log('clicked')
    if (buttonName === 'Show Journal Entries') {
      SetButtonName('Hide Journal Entries')
    } else {
      SetButtonName('Show Journal Entries')
    }
  }
  return (
    <div className='flex flex-col gap-4 overflow-auto custom-scrollbar h-full'>
      <PurchaseReturnModal title={`Purchase return of purchase# ${purchase?.serial_number}`}
      setOpenModal={setOpenPurchaseReturnModal}
       purchase={purchase} openModal={openPurchaseReturnModal}/>
      <PaymentModal 
      onPaymentSuccess={onPaymentSuccess}
      openModal={openPaymentModal} setOpenModal={setOpenPaymentModal} title={`Payment for bill# ${purchase?.bill?.serial_number}`} type='credit' bill_id={purchase?.bill?.id}/>

      <div className='w-full flex flex-col gap-2 justify-between'>
        <InfoContainer header={'Purchase#'} info={purchase.serial_number} />
        <InfoContainer header={'Date:'} info={purchase.date} />
        <InfoContainer header={'Type:'} info={purchase?.items_data?.type} />
      </div>
      {purchase?.items_data?.type === 'bill' && <div className='flex flex-col gap-2'>
        <div className='w-full flex flex-row'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Bill #
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {purchase?.bill?.serial_number}
            </span>
          </div>
          
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Supplier Name:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {purchase?.bill?.supplier_name}
            </span>
          </div>
        </div>
        {purchase.bill.amount_due > 0 && (
          <> <div className='w-full flex flex-row'>
            <div className='flex flex-row gap-5 w-[50%] px-2'>
              <h5 className='w-[40%] text-lg font-bold'>
                Due Date:
              </h5>
              <span className='w-[60%] text-black font-semibold'>
                {purchase?.bill?.due_date}
              </span>
            </div>
            <div className='flex flex-row gap-5 w-[50%] px-2'>
              <h5 className='w-[40%] text-lg font-bold'>
                Amount Due:
              </h5>
              <span className='w-[60%] text-black font-semibold'>
                {purchase?.bill?.amount_due}
              </span>
            </div>
          </div>
            <div className='w-full flex flex-row'>
              <div className='flex flex-row gap-5 w-[50%] px-2'>
                <h5 className='w-[40%] text-lg font-bold'>
                  Amount Paid:
                </h5>
                <span className='w-[60%] text-black font-semibold'>
                  {purchase?.bill?.amount_paid}
                </span>
              </div>
              <div className='flex flex-row gap-5 w-[50%] px-2'>
                <button onClick={() => showModal(setOpenPaymentModal)} className={`w-[40%] bg-green-700 text-white rounded-md h-90px border-2 border-green-700 hover:bg-white hover:text-green-700`}>
                  Pay
                </button>

              </div>
            </div>
          </>


        )
        }
        <div className="w-full flex flex-row">
        <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Status:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {capitalizeFirstLetter(replaceDash(purchase?.bill?.status))}
            </span>
          </div>
        </div>
      </div>
      }
      <div className='p-1 flex flex-col'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>No#</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>Stock</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Purchase Price</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Quantity</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Total Amount</span>


        </div>

        {purchase.purchase_entries && purchase.purchase_entries.map((entry, index) => (
          <div className='w-full flex flex-row text-xl font-bold border-b-2 border-gray-800 border-l-2'>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[30%] border-gray-800 border-r-2 p-1'>{entry.stock_name}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.purchase_price}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.purchased_quantity}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.cogs}</span>
          </div>))}
        <div className='w-full flex flex-row text-xl font-bold border-b-2 border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 border-r-2 p-1 text-sm'><i>({purchase.description})</i></span>
          <span className='w-[20%] border-gray-800 border-r-2 underline p-1'>Total</span>
          <span className='w-[20%] border-gray-800 border-r-2 underline p-1'>{purchase?.items_data?.total_quantity}</span>
          <span className='w-[20%] border-gray-800 border-r-2 underline p-1'>{purchase?.items_data?.total_amount}</span>
        </div>
        {purchase?.discount_received &&
          <div className='flex flex-col gap-2'>
            <div className='w-full flex flex-row p-1'>
              <div className='flex flex-row gap-5 w-[50%]'>
                <h5 className='w-[50%] text-lg font-bold'>
                  Discount percentage
                </h5>
                <span className='w-[50%] text-black font-bold'>
                  {purchase?.discount_received?.discount_percentage}%
                </span>
              </div>
              <div className='flex flex-row gap-5 w-[50%]'>
                <h5 className='w-[50%] text-lg font-bold'>
                  Discount Amount
                </h5>
                <span className='w-[50%] text-black font-bold'>
                  {purchase?.discount_received?.discount_amount}
                </span>
              </div>
            </div>

          </div>}
        <div className='w-full flex flex-col p-1'>
          {showJournalEntries &&
            <div className='p-1 flex flex-col w-full'>
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
                  {purchase.journal_entries && purchase.journal_entries.map((entry, index) =>
                    <div className={`flex flex-row flex-1`} key={index}>
                      <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                      <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                      <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                    </div>)}
                  <div className={`flex flex-row flex-1`}>
                    <i className='text-sm w-[60%] p-1'>({purchase.description})</i>
                    <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{purchase?.journal_entries_total?.debit_total}</span>
                    <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{purchase?.journal_entries_total?.debit_total}</span>
                  </div>
                </span>
              </div>
            </div>}
          <div className="w-full flex flex-row gap-4">

            <button onClick={hideJournalEntries} className={`w-[40%] bg-green-700 text-white rounded-md h-90px border-2 border-green-700 hover:bg-white hover:text-green-700`}>
              {buttonName}
            </button>
            <button onClick={() => showModal(setOpenPurchaseReturnModal)} className={`w-[40%] bg-purple-700 text-white rounded-md h-90px border-2 border-purple-700 hover:bg-white hover:text-purple-700`}>
              Purchase Return
            </button>
          </div>
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

export default SinglePurchase
