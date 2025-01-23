import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, deleteRequest, getItems, replaceDash } from '../../lib/helpers';
import PaymentModal from '../../components/modals/PaymentModal';
import SalesReturnModal from '../../components/modals/SalesReturnModal';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import downloadPDF from '../../lib/download/download';
import Loading from '../../components/shared/Loading'
import { useAuth } from '../../context/AuthContext';
import DeleteModal from '../../components/modals/DeleteModal';

const SingleSales = () => {
  const { id } = useParams();
  const [sales, setSales] = useState({});
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openSalesReturnModal, setOpenSalesReturnModal] = useState();
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
    const sales = await getItems(`${orgId}/sales/${id}`);
    setSales(sales)
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

  const downloadSalesPdf = () => {
    setIsLoading(true)
    let title = 'Sales'


    if (sales?.details?.type === 'sales') {
      title = title.concat(' sales')
    }
    downloadPDF(sales, orgId, title)
    setIsLoading(false)
  }

  const deleteSales = () => {
    const deleteUrl = `${orgId}/sales/${sales.id}`
    setDeleteUrl(deleteUrl);
    setDeleteModalTitle(`sales ${sales.serial_number}`);
    setOpenDeleteModal(true);
  }

  return (
    <div className='flex flex-col gap-4 relative overflow-y-auto overflow-x-hidden custom-scrollbar h-full'>
      {isLoading && <Loading />}
      <SalesReturnModal title={`Sales return of sales# ${sales?.serial_number}`}
        setOpenModal={setOpenSalesReturnModal}
        onSalesReturn={onPaymentSuccess}
        sales={sales} openModal={openSalesReturnModal} />
      <DeleteModal
        openModal={openDeleteModal}
        setOpenModal={setOpenDeleteModal}
        setDeleteUrl={setDeleteUrl}
        deleteUrl={deleteUrl}
        title={deleteModalTitle}
        setTitle={setDeleteModalTitle}
        getData={getData}
        navigateUrl={`/dashboard/${orgId}/sales`}
      />
      <PaymentModal
        onPaymentSuccess={onPaymentSuccess}
        openModal={openPaymentModal} setOpenModal={setOpenPaymentModal} title={`Payment for sales # ${sales?.serial_number}`} type='debit' invoice_id={sales?.invoice?.id} />

      <div className='w-full flex flex-col gap-2 justify-between'>
        <div className='relative'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Sales #:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {sales?.serial_number}
            </span>
          </div>
          <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
            <button onClick={hideJournalEntries} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-[90%] p-1 rounded-sm'>
              {buttonName}
            </button>
            {sales?.details?.type === 'invoice' &&
              sales?.invoice?.status &&
              sales.invoice.status !== 'unpaid' && (
                <Link to={`/dashboard/${orgId}/invoices/${sales.invoice.id}/payments`} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                  Payments
                </Link>
              )}

            <button onClick={() => showModal(setOpenSalesReturnModal)} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Return sales
            </button>
            {sales?.details?.has_returns && (
              <Link to="sales_returns" className="hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm">
                Sales returns
              </Link>
            )}
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadSalesPdf}>
              Download
            </button>
            <Link to='edit' className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Edit
            </Link>
            <button onClick={deleteSales} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
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
              {sales?.date}
            </span>
          </div>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Type:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {capitalizeFirstLetter(sales?.details?.type)}
            </span>
          </div>
        </div>
        {sales?.details?.type === 'invoice' && <><div className='w-full flex flex-row'>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Customer Name:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {sales?.invoice?.customer_name}
            </span>
          </div>
          <div className='flex flex-row gap-5 w-[50%] px-2'>
            <h5 className='w-[40%] text-lg font-bold'>
              Status:
            </h5>
            <span className='w-[60%] text-black font-semibold'>
              {capitalizeFirstLetter(replaceDash(sales?.invoice?.status))}
            </span>
          </div>
        </div>
          {sales.invoice.amount_due > 0 && (
            <> <div className='w-full flex flex-row'>
              <div className='flex flex-row gap-5 w-[50%] px-2'>
                <h5 className='w-[40%] text-lg font-bold'>
                  Due Date:
                </h5>
                <span className='w-[60%] text-black font-semibold'>
                  {sales?.invoice?.due_date}
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
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Sales Price ({currentOrg.currency})</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Quantity</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Total Amount ({currentOrg.currency})</span>


        </div>

        {sales.sales_entries && sales.sales_entries.map((entry, index) => (
          <div className='w-full flex flex-row text-xl font-bold border-b-2 border-gray-800 border-l-2' key={index}>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[30%] border-gray-800 border-r-2 p-1'>{entry.stock_name}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{entry.sales_price}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{entry.quantity}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1 text-right'>{entry.total_sales_price}</span>
          </div>))}
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'><i>({sales.description})</i></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>Sub Total</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1 text-right'>{sales?.details?.total_quantity}</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1 text-right'>{sales?.details?.total_amount}</span>

        </div>

        {sales?.details?.footer_data && Object.entries(sales?.details?.footer_data).map(([key, value]) => (
          <div
            key={key}
            className={`w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 text-right border-l-2 ${key === 'Amount Due' ? 'text-red-500' : ''} ${key === 'Total' ? 'underline' : ''}`}
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
                  {sales.journal_entries && sales.journal_entries.map((entry, index) =>
                    <div className={`flex flex-row flex-1`} key={index}>
                      <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                      <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                      <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1 text-right'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                    </div>)}
                  <div className={`flex flex-row flex-1`}>
                    <i className='text-sm w-[60%] p-1'>({sales.description})</i>

                    <span className='w-[20%] border-gray-800 border-l-2 underline p-1 text-right'>{sales?.journal_entries_total?.debit_total}</span>
                    <span className='w-[20%] border-gray-800 border-l-2 underline p-1 text-right'>{sales?.journal_entries_total?.debit_total}</span>
                  </div>
                </span>
              </div>
            </div>}

        </div>


      </div>

    </div >
  )
}


export default SingleSales
