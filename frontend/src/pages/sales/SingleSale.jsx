
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, getItems, replaceDash } from '../../lib/helpers';
import PaymentModal from '../../components/modals/PaymentModal';
import SalesReturnModal from '../../components/modals/SalesReturnModal';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import downloadPDF from '../../lib/download/download';
import Loading from '../../components/shared/Loading';

const SingleSale = () => {
  const { id } = useParams();
  const [sale, setSale] = useState({});
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openSaleReturnModal, setOpenSaleReturnModal] = useState();
  const { orgId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
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
    const sale = await getItems(`${orgId}/sales/${id}`);
    setSale(sale)
    setIsLoading(false)
  }

  const onPaymentSuccess = () => {
    getData()
  }
 
  useEffect(() => {

    getData()
  }, []);

  const downloadSalesPdf = () => {
    setIsLoading(true)
    let title = 'Sales'


    if (sale?.items_data?.type === 'invoice') {
      title = title.concat(' invoice')
    }
    downloadPDF(sale, orgId, title)
    setIsLoading(false)
  }
  const hideJournalEntries = () => {
    setShowJournalEntries(!showJournalEntries)

    if (buttonName === 'Show Journal Entries') {
      SetButtonName('Hide Journal Entries')
    } else {
      SetButtonName('Show Journal Entries')
    }
  }
  return (
    <div className='flex flex-col gap-4 overflow-y-auto relative overflow-x-hidden custom-scrollbar h-full'>
      {isLoading && <Loading/>}
      <SalesReturnModal title={`Sales return of sale# ${sale?.serial_number}`}
        setOpenModal={setOpenSaleReturnModal}
        onSalesReturn={onPaymentSuccess}
        sale={sale} openModal={openSaleReturnModal} />
      <PaymentModal
        onPaymentSuccess={onPaymentSuccess}
        openModal={openPaymentModal} setOpenModal={setOpenPaymentModal} title={`Payment for invoice# ${sale?.invoice?.serial_number}`} type='debit' invoice_id={sale?.invoice?.id} />


      <div className='w-full flex flex-col gap-2 justify-between'>
        <div className='relative'>
          <InfoContainer header={'Sale#'} info={sale.serial_number} />
          <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
            {sale?.items_data?.type === 'invoice' &&
              sale?.invoice?.status &&
              sale.invoice.status !== 'unpaid' && (
                <Link to={`/dashboard/${orgId}/invoices/${sale.invoice.id}/payments`} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                  Payments
                </Link>
              )}
            <button onClick={hideJournalEntries} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              {buttonName}
            </button>
            <button onClick={() => showModal(setOpenSaleReturnModal)} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              Return sale
            </button>
            {parseFloat(sale?.returns_total) > 0 && (
              <Link to="sales_returns" className="hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm">
                Sales returns
              </Link>
            )}
            <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadSalesPdf}>
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


        <InfoContainer header={'Date:'} info={sale.date} />
        <InfoContainer header={'Type:'} info={capitalizeFirstLetter(sale?.items_data?.type)} />
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
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.quantity}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.sales_price * entry.sold_quantity}</span>
          </div>))}
          <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'><i>({sale.description})</i></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>Sub Total</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{sale?.items_data?.total_quantity}</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{sale?.items_data?.total_amount}</span>
          
        </div>
        {sale?.discount_allowed && <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Discount {sale?.discount_allowed?.discount_percentage}%</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{sale?.discount_allowed?.discount_amount}</span>
          
        </div>}
        {sale?.items_data?.type === 'invoice' && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Amount Paid</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{sale?.invoice?.amount_paid}</span>
          
        </div>
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800 text-2xl underline p-1'>Amount Due</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 text-2xl underline border-r-2 p-1'>{sale?.invoice?.amount_due}</span>
        </div>
        </>}
        {parseFloat(sale?.returns_total) > 0 && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Returns</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{sale?.returns_total}</span>
          
        </div></>}
        {parseFloat(sale?.items_data?.cash) > 0 && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Amount Paid</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{sale?.items_data.cash}</span>
          
        </div></>}
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-t-2 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] underline p-1'>Total</span>
          <span className='w-[20%]'></span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{sale?.items_data?.total_amount}</span>
          
        </div>

        
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

        

          </div>

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

