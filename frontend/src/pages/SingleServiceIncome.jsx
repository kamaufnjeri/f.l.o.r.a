
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, getItems, replaceDash } from '../lib/helpers';
import PaymentModal from '../components/modals/PaymentModal';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import Loading from '../components/shared/Loading';
import downloadPDF from '../lib/download/download';

const SingleServiceIncome = () => {
  const { id } = useParams();
  const [serviceIncome, setServiceIncome] = useState({});
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
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
    const serviceIncome = await getItems(`${orgId}/service_income/${id}`);
    setServiceIncome(serviceIncome)
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
    let title = 'Service income'


    if (serviceIncome?.items_data?.type === 'invoice') {
      title = title.concat(' invoice')
    }
    downloadPDF(serviceIncome, orgId, title)
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
     
      <PaymentModal
        onPaymentSuccess={onPaymentSuccess}
        openModal={openPaymentModal} setOpenModal={setOpenPaymentModal} title={`Payment for invoice# ${serviceIncome?.invoice?.serial_number}`} type='debit' invoice_id={serviceIncome?.invoice?.id} />


      <div className='w-full flex flex-col gap-2 justify-between'>
        <div className='relative'>
          <InfoContainer header={'Service Income #'} info={serviceIncome?.serial_number} />
          <FaEllipsisV onClick={() => openDropDown()} className='absolute right-0 top-0 cursor-pointer hover:text-purple-800' />
          <div className={`absolute right-1 top-5 rounded-md w-[12rem] p-1 z-10 bg-neutral-200
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>
            <FaTimes className='absolute right-1 top-2 cursor-pointer hover:text-purple-800' onClick={closeDropDown} />
            {serviceIncome?.items_data?.type === 'invoice' &&
              serviceIncome?.invoice?.status &&
              serviceIncome.invoice.status !== 'unpaid' && (
                <Link to={`/dashboard/${orgId}/invoices/${serviceIncome.invoice.id}/payments`} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                  Payments
                </Link>
              )}
            <button onClick={hideJournalEntries} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
              {buttonName}
            </button>
           
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


        <InfoContainer header={'Date:'} info={serviceIncome.date} />
        <InfoContainer header={'Type:'} info={capitalizeFirstLetter(serviceIncome?.items_data?.type)} />
      </div>
      {serviceIncome?.items_data?.type === 'invoice' &&
        <div className='flex flex-col gap-2'>
          <div className='w-full flex flex-row'>
            <div className='flex flex-row gap-5 w-[50%] px-2'>
              <h5 className='w-[40%] text-lg font-bold'>
                Invoice #
              </h5>
              <span className='w-[60%] text-black font-semibold'>
                {serviceIncome?.invoice?.serial_number}
              </span>
            </div>
            <div className='flex flex-row gap-5 w-[50%] px-2'>
              <h5 className='w-[40%] text-lg font-bold'>
                Customer Name:
              </h5>
              <span className='w-[60%] text-black font-semibold'>
                {serviceIncome?.invoice?.customer_name}
              </span>
            </div>
          </div>

          {serviceIncome?.invoice?.amount_due > 0 &&
            <><div className='w-full flex flex-row'>
              <div className='flex flex-row gap-5 w-[50%] px-2'>
                <h5 className='w-[40%] text-lg font-bold'>
                  Due Date:
                </h5>
                <span className='w-[60%] text-black font-semibold'>
                  {serviceIncome?.invoice?.due_date}
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
                {capitalizeFirstLetter(replaceDash(serviceIncome?.invoice?.status))}
              </span>
            </div>
          </div>
        </div>
      }
      <div className='p-1 flex flex-col'>
        <div className='w-full flex flex-row text-xl font-bold border-y-2 border-gray-800 border-l-2'>
          <span className='w-[10%] border-gray-800 border-r-2 p-1'>No#</span>
          <span className='w-[30%] border-gray-800 border-r-2 p-1'>Service</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Price</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Quantity</span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>Total Amount</span>


        </div>

        {serviceIncome.service_income_entries && serviceIncome.service_income_entries.map((entry, index) => (
          <div className='w-full flex flex-row text-xl font-bold border-b-2 border-gray-800 border-l-2' key={index}>
            <span className='w-[10%] border-gray-800 border-r-2 p-1'>{index + 1}</span>
            <span className='w-[30%] border-gray-800 border-r-2 p-1'>{entry.service_name}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.price}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.quantity}</span>
            <span className='w-[20%] border-gray-800 border-r-2 p-1'>{entry.price * entry.quantity}</span>
          </div>))}
          <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'><i>({serviceIncome.description})</i></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>Sub Total</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{serviceIncome?.items_data?.total_quantity}</span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{serviceIncome?.items_data?.total_amount}</span>
          
        </div>
        {serviceIncome?.discount_allowed && <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Discount {serviceIncome?.discount_allowed?.discount_percentage}%</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{serviceIncome?.discount_allowed?.discount_amount}</span>
          
        </div>}
        {serviceIncome?.items_data?.type === 'invoice' && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Amount Paid</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{serviceIncome?.invoice?.amount_paid}</span>
          
        </div>
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800 text-2xl underline p-1'>Amount Due</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 text-2xl underline border-r-2 p-1'>{serviceIncome?.invoice?.amount_due}</span>
        </div>
        </>}
        {parseFloat(serviceIncome?.returns_total) > 0 && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Returns</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{serviceIncome?.returns_total}</span>
          
        </div></>}
        {parseFloat(serviceIncome?.items_data?.cash) > 0 && <><div className='w-full flex flex-row text-xl font-bold border-gray-800 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] border-gray-800  p-1'>Amount Paid</span>
          <span className='w-[20%] '></span>
          <span className='w-[20%] border-gray-800 border-r-2 p-1'>{serviceIncome?.items_data.cash}</span>
          
        </div></>}
        <div className='w-full flex flex-row text-xl font-bold border-gray-800 border-b-2 border-t-2 border-l-2'>
          <span className='w-[40%] border-gray-800 p-1 text-sm'></span>
          <div>
          </div>
          <span className='w-[20%] underline p-1'>Total</span>
          <span className='w-[20%]'></span>
          <span className='w-[20%] border-gray-800 underline border-r-2 p-1'>{serviceIncome?.items_data?.total_amount}</span>
          
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
                {serviceIncome.journal_entries && serviceIncome.journal_entries.map((entry, index) =>
                  <div className={`flex flex-row flex-1`} key={index}>
                    <div className='w-[60%] p-1'><span className={`${entry.debit_credit == 'debit' ? '' : 'pl-8'}`}>{entry.account_name}</span></div>
                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'debit' ? entry.amount : '-'}</span>
                    <span className='w-[20%] border-gray-800 border-l-2 border-b-2 p-1'>{entry.debit_credit == 'credit' ? entry.amount : '-'}</span>
                  </div>)}
                <div className={`flex flex-row flex-1`}>
                  <i className='text-sm w-[60%] p-1'>({serviceIncome.description})</i>
                  <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{serviceIncome?.journal_entries_total?.debit_total}</span>
                  <span className='w-[20%] border-gray-800 border-l-2 underline p-1'>{serviceIncome?.journal_entries_total?.debit_total}</span>
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

export default SingleServiceIncome

