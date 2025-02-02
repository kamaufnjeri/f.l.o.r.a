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
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
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

      <div className='w-full flex flex-col gap-2'>
        <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2'>
          <div className='grid grid-cols-2 w-full lg:col-span-1 md:col-span-1 col-span-2'>
            <h5 className='text-lg font-bold'>
              Sales #:
            </h5>
            <span className='text-black font-semibold'>
              {sales?.serial_number}
            </span>
          </div>
          <div className=' absolute  top-5 right-2'>
            <div className={`rounded-md p-1 bg-neutral-200 absolute -top-3 right-5
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

              <button onClick={hideJournalEntries} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
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
            {!isVisible ?
              <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
              <FaTimes className='cursor-pointer hover:text-purple-800  text-lg' onClick={closeDropDown} />

            }

          </div>
        </div>
      </div>
      <div className='grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-2 min-w-full'>
        <div className='grid grid-cols-2 w-full'>
          <h5 className='text-lg font-bold'>
            Date:
          </h5>
          <span className='text-black font-semibold'>
            {sales?.date}
          </span>
        </div>
        <div className='grid grid-cols-2 w-full'>
          <h5 className='text-lg font-bold'>
            Type:
          </h5>
          <span className='text-black font-semibold'>
            {capitalizeFirstLetter(sales?.details?.type)}
          </span>
        </div>
        {sales?.details?.type === 'invoice' && <>
          <div className='grid grid-cols-2 w-full'>
            <h5 className='text-lg font-bold'>
              Customer Name:
            </h5>
            <span className='text-black font-semibold'>
              {sales?.invoice?.customer_name}
            </span>
          </div>
          <div className='grid grid-cols-2 w-full'>
            <h5 className='text-lg font-bold'>
              Status:
            </h5>
            <span className='text-black font-semibold'>
              {capitalizeFirstLetter(replaceDash(sales?.invoice?.status))}
            </span>
          </div>
          {sales.invoice.amount_due > 0 && (
            <>
              <div className='grid grid-cols-2 w-full'>
                <h5 className='text-lg font-bold'>
                  Due Date:
                </h5>
                <span className='text-black font-semibold'>
                  {sales?.invoice?.due_date}
                </span>
              </div>
              <div className='grid grid-cols-2 w-full'>
                <button onClick={() => showModal(setOpenPaymentModal)} className={`bg-green-700 text-white rounded-md h-90px border-2 border-green-700 hover:bg-white hover:text-green-700`}>
                  Record payment
                </button>

              </div>

            </>
          )}
        </>}
      </div>
      <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>
            <th className='p-1 border-r border-b border-gray-800'>No #</th>
            <th className='p-1 border-r border-b border-gray-800'>Item</th>
            <th className='p-1 border-r border-b border-gray-800'>Rate ({currentOrg.currency})</th>
            <th className='p-1 border-r border-b border-gray-800'>Quantity</th>
            <th className='p-1 border-r border-b border-gray-800'>Total ({currentOrg?.currency})</th>
          </tr>
        </thead>
        <tbody>
          {sales.sales_entries && sales.sales_entries.map((entry, index) => (

            <tr
              key={index}

            >
              <td className="border-gray-800 border-r border-b p-1">{index + 1}</td>
              <td className="border-gray-800 border-r border-b p-1">{entry.stock_name}</td>
              <td className="border-gray-800 border-r border-b p-1 text-right">{entry.sales_price}</td>
              <td className="border-gray-800 border-r border-b p-1 text-right">{entry.quantity}</td>
              <td className="border-gray-800 border-r border-b p-1 text-right">{entry.total_sales_price}</td>
            </tr>))}
          <tr className='font-bold'>
            <td className="border-gray-800 space-x-4 border-r border-b p-1 text-right" colSpan={3}>
              <i className='text-sm'>({sales.description})</i>

              <span className='underline'>Sub Total</span>
            </td>
            <td className="border-gray-800 border-r border-b p-1 text-right underline">{sales?.details?.total_quantity}</td>
            <td className="border-gray-800 border-r border-b p-1 text-right underline">{sales?.details?.total_amount}</td>

          </tr>
          {sales?.details?.footer_data && Object.entries(sales?.details?.footer_data).map(([key, value]) => (
            <tr
              key={`${value} - ${key}`}
              className={`${key === 'Amount Due' ? 'text-red-500' : ''} ${key === 'Total' ? 'bg-gray-300' : ''} font-bold`}
            >
              <td className='border-gray-800 border-r border-b p-1 text-right' colSpan={4}>{key}</td>
              <td className='border-gray-800 border-r border-b p-1 text-right'>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showJournalEntries && <table className='min-w-full border-collapse border border-gray-800'>
        <thead>
          <tr className='text-left bg-gray-400'>

            <th className='p-1 border-r border-b border-gray-800'>Account</th>
            <th className='p-1 border-r border-b border-gray-800'>Debit ({currentOrg.currency})</th>
            <th className='p-1 border-r border-b border-gray-800'>Credit ({currentOrg.currency})</th>
          </tr>
        </thead>
        <tbody>
          {sales.journal_entries && sales.journal_entries.map((entry, index) =>
            <tr
              key={index}

            >
              <td className={`border-gray-800 border-r border-b p-1 ${entry.debit_credit == 'debit' ? '' : 'pl-14'}`}>{entry.account_name}</td>
              <td className="border-gray-800 border-r border-b p-1 text-right">{entry.debit_credit == 'debit' ? entry.amount : '-'}</td>
              <td className="border-gray-800 border-r border-b p-1 text-right">{entry.debit_credit == 'credit' ? entry.amount : '-'}</td>

            </tr>)}
          <tr className='text-right font-bold bg-gray-300'>
            <td className="border-gray-800 space-x-4 border-r border-b p-1">
              <i className='text-sm'>({sales.description})</i>

              <span >Total</span>
            </td>
            <td className="border-gray-800 border-r border-b p-1">{sales?.journal_entries_total?.debit_total}</td>
            <td className="border-gray-800 border-r border-b p-1">{sales?.journal_entries_total?.debit_total}</td>
          </tr>
        </tbody>
      </table>}


    </div >
  )
}


export default SingleSales
