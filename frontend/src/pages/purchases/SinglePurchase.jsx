import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, deleteRequest, getItems, replaceDash } from '../../lib/helpers';
import PaymentModal from '../../components/modals/PaymentModal';
import PurchaseReturnModal from '../../components/modals/PurchaseReturnModal';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import downloadPDF from '../../lib/download/download';
import Loading from '../../components/shared/Loading'
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import DeleteModal from '../../components/modals/DeleteModal';

const SinglePurchase = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState({});
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openPurchaseReturnModal, setOpenPurchaseReturnModal] = useState();
  const { orgId } = useParams();
  const [isLoading, setIsLoading] = useState(false); 
  const { currentOrg } = useAuth();
  const [openDeleteModal, setOpenDeleteModal] = useState('');
  const [deleteUrl, setDeleteUrl] = useState('');
  const [deleteModalTitle, setDeleteModalTitle] = useState('');

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


    if (purchase?.details?.type === 'bill') {
      title = title.concat(' bill')
    }
    downloadPDF(purchase, orgId, title)
    setIsLoading(false)
  }

  
  const deletePurchase = () => {
    const deleteUrl = `${orgId}/purchases/${purchase.id}`
    setDeleteUrl(deleteUrl);
    setDeleteModalTitle(`purchase ${purchase.serial_number}`);
    setOpenDeleteModal(true);
  }

  return (
    <div className='flex flex-col gap-4 relative overflow-y-auto overflow-x-hidden custom-scrollbar h-full'>
      {isLoading && <Loading />}
      <DeleteModal
        openModal={openDeleteModal}
        setOpenModal={setOpenDeleteModal}
        setDeleteUrl={setDeleteUrl}
        deleteUrl={deleteUrl}
        title={deleteModalTitle}
        setTitle={setDeleteModalTitle}
        getData={getData}
        navigateUrl={`/dashboard/${orgId}/purchases`}
      />
      <PurchaseReturnModal title={`Purchase return of purchase# ${purchase?.serial_number}`}
        setOpenModal={setOpenPurchaseReturnModal}
        onPurchaseReturn={onPaymentSuccess}
        purchase={purchase} openModal={openPurchaseReturnModal} />
      <PaymentModal
        onPaymentSuccess={onPaymentSuccess}
        openModal={openPaymentModal} setOpenModal={setOpenPaymentModal} title={`Payment for purchase # ${purchase?.serial_number}`} type='credit' bill_id={purchase?.bill?.id} />

      <div className='w-full flex flex-col gap-2 justify-between'>
        <div className='relative'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Purchase #:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {purchase?.serial_number}
            </span>
          </div>
          <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
            <button onClick={hideJournalEntries} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[90%] p-1 rounded-sm'>
              {buttonName}
            </button>
            {purchase?.details?.type === 'bill' &&
              purchase?.bill?.status &&
              purchase.bill.status !== 'unpaid' && (
                <Link to={`/dashboard/${orgId}/bills/${purchase.bill.id}/payments`} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                  Payments
                </Link>
              )}

            <button onClick={() => showModal(setOpenPurchaseReturnModal)} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Return purchase
            </button>
            {purchase?.details?.has_returns && (
              <Link to="purchase_returns" className="hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm">
                Purchase returns
              </Link>
            )}
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPurchasePdf}>
              Download
            </button>
            <Link to='edit' className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Edit
            </Link>
            <button onClick={deletePurchase} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Delete
            </button>


          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='w-full flex flex-row'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Date:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {purchase?.date}
            </span>
          </div>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Type:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {capitalizeFirstLetter(purchase?.details?.type)}
            </span>
          </div>
        </div>
        {purchase?.details?.type === 'bill' && <><div className='w-full flex flex-row'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Supplier Name:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {purchase?.bill?.supplier_name}
            </span>
          </div>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Status:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {capitalizeFirstLetter(replaceDash(purchase?.bill?.status))}
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
          )}
        </>}

      </div>
      <div className='p-1 flex flex-col'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>No#</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>Stock</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Purchase Price ({currentOrg.currency})</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Quantity</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Total Amount ({currentOrg.currency})</span>


        </div>

        {purchase.purchase_entries && purchase.purchase_entries.map((entry, index) => (
          <div className='w-full flex flex-row text-xl font-bold border-b-2 border-gray-800 border-l-2' key={index}>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[30%] border-gray-800 border-r-2 p-1'>{entry.stock_name}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{entry.purchase_price}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{entry.quantity}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{entry.cogs}</span>
          </div>))}
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'><i>({purchase.description})</i></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>Sub Total</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1 text-right'>{purchase?.details?.total_quantity}</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1 text-right'>{purchase?.details?.total_amount}</span>

        </div>

        {purchase?.details?.footer_data && Object.entries(purchase?.details?.footer_data).map(([key, value]) => (
          <div
          key={key}
            className={`w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-l-2 ${key === 'Amount Due' ? 'text-red-500' : ''} ${key === 'Total' ? 'underline' : ''}`}
          >

            <span className='w-[80%] border-gray-800 border-r-2 p-1 text-right'>{key}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{value}</span>

          </div>
        ))}

        <div className='w-full flex flex-col p-1'>
          {showJournalEntries &&
            <div className='p-1 flex flex-col w-full'>
              <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
                <span className='w-full border-gray-800 border-r-2 flex flex-col'>
                  <div className='w-full flex flex-row flex-1'>
                    <span className='w-[60%] p-1'>Account</span>
                    <span className='w-[20%] border-gray-800 border-l-2 p-1'>Debit ({currentOrg.currency})</span>
                    <span className='w-[20%] border-gray-800 border-l-2 p-1 text-right'>Credit ({currentOrg.currency})</span>
                  </div>

                </span>

              </div>
              <div className='w-full flex flex-row font-bold border-b-2 border-gray-800 border-l-2'>
                <span className='w-full border-gray-800 border-r-2 flex flex-col'>
                  {purchase.journal_entries && purchase.journal_entries.map((entry, index) =>
                    <div className={`flex flex-row flex-1`} key={index}>
                      <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                      <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                      <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                    </div>)}
                  <div className={`flex flex-row flex-1`}>
                    <i className='text-sm w-[60%] p-1'>({purchase.description})</i>

                    <span className='w-[20%] border-gray-800 border-l-2 underline p-1 text-right'>{purchase?.journal_entries_total?.debit_total}</span>
                    <span className='w-[20%] border-gray-800 border-l-2 underline p-1 text-right'>{purchase?.journal_entries_total?.debit_total}</span>
                  </div>
                </span>
              </div>
            </div>}

        </div>


      </div>

    </div >
  )
}


export default SinglePurchase
