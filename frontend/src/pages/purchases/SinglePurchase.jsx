import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, getItems, replaceDash } from '../../lib/helpers';
import PaymentModal from '../../components/modals/PaymentModal';
import PurchaseReturnModal from '../../components/modals/PurchaseReturnModal';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import downloadPDF from '../../lib/download/download';
import Loading from '../../components/shared/Loading'

const SinglePurchase = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState({});
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openPurchaseReturnModal, setOpenPurchaseReturnModal] = useState();
  const { orgId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }

  const getData = async () => {
    setIsLoading(true)
    const purchase = await getItems(`${orgId}/purchases/${id}`);
    setPurchase(purchase)
    setIsLoading(false)

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
    if (buttonName === 'Show Journal Entries') {
      SetButtonName('Hide Journal Entries')
    } else {
      SetButtonName('Show Journal Entries')
    }
  }

  const downloadPurchasePdf = () => {
    setIsLoading(true)
    let title = 'Purchase'


    if (purchase?.items_data?.type === 'bill') {
      title = title.concat(' bill')
    }
    downloadPDF(purchase, orgId, title)
    setIsLoading(false)
  }

  return (
    <div className='flex flex-col gap-4 relative overflow-y-auto overflow-x-hidden custom-scrollbar h-full'>
      {isLoading && <Loading/>}
      <PurchaseReturnModal title={`Purchase return of purchase# ${purchase?.serial_number}`}
        setOpenModal={setOpenPurchaseReturnModal}
        onPurchaseReturn={onPaymentSuccess}
        purchase={purchase} openModal={openPurchaseReturnModal} />
      <PaymentModal
        onPaymentSuccess={onPaymentSuccess}
        openModal={openPaymentModal} setOpenModal={setOpenPaymentModal} title={`Payment for bill# ${purchase?.bill?.serial_number}`} type='credit' bill_id={purchase?.bill?.id} />

      <div className='w-full flex flex-col gap-2 justify-between'>
        <div className='relative'>
          <InfoContainer header={'Purchase#'} info={purchase.serial_number} />
          <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
            {purchase?.items_data?.type === 'bill' &&
              purchase?.bill?.status &&
              purchase.bill.status !== 'unpaid' && (
                <Link to={`/dashboard/${orgId}/bills/${purchase.bill.id}/payments`} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                  Payments
                </Link>
              )}
            <button onClick={hideJournalEntries} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              {buttonName}
            </button>
            <button onClick={() => showModal(setOpenPurchaseReturnModal)} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Return purchase
            </button>
            {parseFloat(purchase?.returns_total) > 0 && (
              <Link to="purchase_returns" className="hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm">
                Purchase returns
              </Link>
            )}
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPurchasePdf}>
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

        <InfoContainer header={'Date:'} info={purchase.date} />
        <InfoContainer header={'Type:'} info={capitalizeFirstLetter(purchase?.items_data?.type)} />
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
          <div className='w-full flex flex-row text-xl font-bold border-b-2 border-gray-800 border-l-2' key={index}>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[30%] border-gray-800 border-r-2 p-1'>{entry.stock_name}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.purchase_price}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.quantity}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.cogs}</span>
          </div>))}
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'><i>({purchase.description})</i></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>Sub Total</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{purchase?.items_data?.total_quantity}</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{purchase?.items_data?.total_amount}</span>
          
        </div>
        {purchase?.discount_received && <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Discount {purchase?.discount_received?.discount_percentage}%</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{purchase?.discount_received?.discount_amount}</span>
          
        </div>}
        {purchase?.items_data?.type === 'bill' && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Amount Paid</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{purchase?.bill?.amount_paid}</span>
          
        </div>
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800 text-2xl underline p-1'>Amount Due</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 text-2xl underline border-r-2 p-1'>{purchase?.bill?.amount_due}</span>
        </div>
        </>}
        {parseFloat(purchase?.returns_total) > 0 && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Returns</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{purchase?.returns_total}</span>
          
        </div></>}
        {parseFloat(purchase?.items_data?.cash) > 0 && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Amount Paid</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{purchase?.items_data.cash}</span>
          
        </div></>}
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-t-2 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] underline p-1'>Total</span>
          <span className='w-[20%]'></span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{purchase?.items_data?.total_amount}</span>
          
        </div>

        
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
                  {purchase.purchase_entries && purchase.journal_entries.map((entry, index) =>
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


          </div>
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

export default SinglePurchase
