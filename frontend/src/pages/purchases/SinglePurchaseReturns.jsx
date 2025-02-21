import React, { useEffect, useState } from 'react'
import FormHeader from '../../components/forms/FormHeader'
import { getItems, getNumber } from '../../lib/helpers';
import { FaEllipsisV, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PrevNext from '../../components/shared/PrevNext';
import { downloadListPDF } from '../../lib/download/downloadList';
import { useAuth } from '../../context/AuthContext';
import { Button } from 'antd';
import DeleteModal from '../../components/modals/DeleteModal';
import UpdatePurchaseReturnModal from '../../components/modals/UpdatePurchaseReturnModal';


const SinglePurchaseReturns = () => {
  const { id, orgId } = useParams();
  const { currentOrg } = useAuth()
  const [purchaseReturnsData, setPurchaseReturnsData] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [buttonName, SetButtonName] = useState('Show Journal Entries')
  const [title, setTitle] = useState('')
  const [isVisible, setIsVisible] = useState(false);
  const [openUpdatePurchaseReturnModal, setOpenUpdatePurchaseReturnModal] = useState(false);
  const [purchaseReturnModalTitle, setPurchaseReturnModalTitle] = useState('')
  const [openDeleteModal, setOpenDeleteModal] = useState('');
  const [deleteUrl, setDeleteUrl] = useState('');
  const [deleteModalTitle, setDeleteModalTitle] = useState('');
  const [purchaseReturnId, setPurchaseReturnId] = useState(null);
  const navigate = useNavigate();

  const handleRowClick = (url) => {
    navigate(`/dashboard/${orgId}/${url}`);
  };

  const openDropDown = () => {
    setIsVisible(true);
  }

  const closeDropDown = () => {
    setIsVisible(false);
  }


  const getData = async () => {
    const newPurchaseReturnsData = await getItems(`${orgId}/purchases/${id}/purchase_returns`, `?paginate=true`);
    setPurchaseReturnsData(newPurchaseReturnsData);
    setTitle(newPurchaseReturnsData?.results?.data?.title)
  }
  useEffect(() => {

    getData();
  }, [])


  const nextPage = async () => {
    try {
      const response = await api.get(purchaseReturnsData.next);
      if (response.status == 200) {
        setPurchaseReturnsData(response.data)
        setPageNo(pageNo + 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching purchaseReturns`);
    }
  }

  const previousPage = async () => {

    try {
      const response = await api.get(purchaseReturnsData.previous);
      if (response.status == 200) {
        setPurchaseReturnsData(response.data)
        setPageNo(pageNo - 1);
      } else {
        throw new Error();
      }
    }
    catch (error) {
      toast.error(`Error': Error fetching PurchaseReturns`);
    }
  }

  const downloadPDF = () => {
    const url = `${orgId}/purchases/${id}/purchase_returns/download/`
    downloadListPDF(url, title)
  }


  const hideJournalEntries = () => {
    setShowJournalEntries(!showJournalEntries)
    if (buttonName === 'Show Journal Entries') {
      SetButtonName('Hide Journal Entries')
    } else {
      SetButtonName('Show Journal Entries')
    }
  }

  const openUpdatePurchaseReturnModalFunc = (purchaseReturnId) => {
    setPurchaseReturnId(purchaseReturnId);
    setPurchaseReturnModalTitle(`Edit purchase return ${purchaseReturnId}`);
    setOpenUpdatePurchaseReturnModal(true);

  }
  const onPurchaseReturnSuccess = () => {
    getData();
  }

  const deletePurchaseReturn = (PurchaseReturnId) => {
    const deleteUrl = `${orgId}/purchase_returns/${PurchaseReturnId}`
    setDeleteUrl(deleteUrl);
    setDeleteModalTitle(`Purchase Return ${PurchaseReturnId}`);
    setOpenDeleteModal(true);
  }
  return (
    <div className='flex flex-col items-start justify-start h-full gap-2 w-full'>
      <UpdatePurchaseReturnModal
        setOpenModal={setOpenUpdatePurchaseReturnModal}
        openModal={openUpdatePurchaseReturnModal}
        purchaseReturnId={purchaseReturnId}
        onPurchaseReturnSuccess={onPurchaseReturnSuccess}
        setPurchaseReturnId={setPurchaseReturnId}
        title={purchaseReturnModalTitle}
      />
      <DeleteModal
        openModal={openDeleteModal}
        setOpenModal={setOpenDeleteModal}
        setDeleteUrl={setDeleteUrl}
        deleteUrl={deleteUrl}
        title={deleteModalTitle}
        setTitle={setDeleteModalTitle}
        getData={getData}
      />
      <div className='w-full flex flex-col gap-2 items-start justify-between shadow-md rounded-md p-2'>

        <div className='flex flex-row items-start justify-between w-[90%] '>
          <FormHeader header={title} />
          <PrevNext pageNo={pageNo} data={purchaseReturnsData} previousPage={previousPage} nextPage={nextPage} className='w-full' />

          <div className='absolute  top-7 right-9'>
            <div className={`rounded-md p-1 bg-neutral-200 absolute -top-3 right-5
             border-2 border-gray-300 shadow-sm flex flex-col items-start font-normal ${isVisible ? 'show-header-dropdown' : 'hide-header-dropdown'}`}>

              <button onClick={hideJournalEntries} className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm'>
                {buttonName}
              </button>

              <button className='hover:bg-neutral-100 flex flex-row gap-2 items-center w-full p-1 rounded-sm' onClick={downloadPDF}>
                Download
              </button>

            </div>
            {!isVisible ?
              <FaEllipsisV onClick={() => openDropDown()} className='cursor-pointer hover:text-purple-800 text-lg' /> :
              <FaTimes className='cursor-pointer hover:text-purple-800  text-lg' onClick={closeDropDown} />

            }
          </div>
        </div>
      </div>
      <div className='min-h-[400px] w-full p-2 shadow-md rounded-md custom-scrollbar overflow-x-auto'>
      <table className="min-w-full border-collapse border border-gray-800">
        <thead>
          <tr className="bg-gray-400 text-left">
            <th className=" p-1 border-r border-b border-gray-800">Return #</th>
            <th className=" p-1 border-r border-b border-gray-800">Date</th>
            <th className="p-1 border-r border-b border-gray-800">Item</th>
            <th className="p-1 border-r border-b border-gray-800">Rate ({currentOrg.currency})</th>
            <th className="p-1 border-r border-b border-gray-800">Quantity</th>
            <th className="p-1 border-r border-b border-gray-800">Total ({currentOrg.currency})</th>
            <th className="p-1 border-r border-b border-gray-800"></th>

          </tr>
        </thead>
        <tbody>
          {purchaseReturnsData?.results?.data?.purchase_returns &&
            purchaseReturnsData.results.data.purchase_returns.map((purchase_return) => {
              return (
                <>
                  {purchase_return.return_entries.map((entry, index) => (
                    <tr
                      key={`${purchase_return.id}-${index}`}
                      onClick={() => handleRowClick(purchase_return.details.url)}

                      className="cursor-pointer text-left"
                    >
                      {index === 0 && (
                        <>
                          <td
                            className="border-r border-b border-gray-800 p-1"
                            rowSpan={purchase_return.return_entries.length + 1}
                          >

                            {getNumber(pageNo, index)}

                          </td>
                          <td
                            className="border-r border-b border-gray-800 p-1"
                            rowSpan={purchase_return.return_entries.length + 1}
                          >

                            {purchase_return.date}

                          </td>
                        </>
                      )}
                      <td className="border-r border-b border-gray-800 p-1">
                        {entry.stock_name}
                      </td>
                      <td className="border-r border-b border-gray-800 p-1 text-right">
                        {entry.return_price}
                      </td>
                      <td className="border-r border-b border-gray-800 p-1 text-right">
                        {entry.quantity}
                      </td>
                      <td className="border-r border-b border-gray-800 p-1 text-right">

                        {entry.return_quantity * entry.return_price}

                      </td>
                      {index === 0 && (
                        <>
                          <td className='border-b border-r border-gray-800 p-1 space-y-2'

                            rowSpan={purchase_return.return_entries.length + 1}
                          >
                            <Button type="primary" className='w-full self-center p-1' onClick={(e) => {
                              e.stopPropagation();
                              openUpdatePurchaseReturnModalFunc(purchase_return.id);
                            }}>
                              Edit
                            </Button>
                            <Button type="primary" danger className='w-full self-center p-1' onClick={(e) => {
                              e.stopPropagation();

                              deletePurchaseReturn(purchase_return.id);
                            }}>
                              Delete
                            </Button>
                          </td>
                        </>)}
                    </tr>
                  ))}

                  <tr
                    onClick={() => handleRowClick(purchase_return.details.url)}
                    className="cursor-pointer">
                    <td colSpan={2} className="border-r border-b border-gray-800 p-1 text-right space-y-2">
                      <i className='text-sm'>({purchase_return.description})</i>
                      <span className='underline'>Total</span>
                    </td>
                    <td className="border-r border-b border-gray-800 p-1 underline text-right">
                      {purchase_return.details?.total_quantity}
                    </td>
                    <td className="border-b border-r border-gray-800 p-1 underline text-right">
                      {purchase_return.details?.total_amount}
                    </td>
                  </tr>
                  {showJournalEntries && <tr>
                    <td className="border-b border-r border-gray-800 p-1"></td>
                    <td className="border-b border-r border-gray-800 p-1"></td>
                    <td className="border-b border-r border-gray-800 p-1" colSpan={4}>

                      <table className='min-w-full border-collapse border border-gray-800'>
                        <thead>
                          <tr className='text-left bg-gray-400'>

                            <th className='p-1 border-r border-b border-gray-800'>Account</th>
                            <th className='p-1 border-r border-b border-gray-800'>Debit ({currentOrg.currency})</th>
                            <th className='p-1 border-r border-b border-gray-800'>Credit ({currentOrg.currency})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchase_return.journal_entries && purchase_return.journal_entries.map((entry, index) =>
                            <tr
                              key={index}

                            >
                              <td className={`border-gray-800 border-r border-b p-1 ${entry.debit_credit == 'debit' ? '' : 'pl-14'}`}>{entry.account_name}</td>
                              <td className="border-gray-800 border-r border-b p-1 text-right">{entry.debit_credit == 'debit' ? entry.amount : '-'}</td>
                              <td className="border-gray-800 border-r border-b p-1 text-right">{entry.debit_credit == 'credit' ? entry.amount : '-'}</td>

                            </tr>)}
                          <tr className='text-right font-bold bg-gray-300'>
                            <td className="border-gray-800 space-x-4 border-r border-b p-1">
                              <i className='text-sm'>({purchase_return.description})</i>

                              <span >Total</span>
                            </td>
                            <td className="border-gray-800 border-r border-b p-1">{purchase_return?.journal_entries_total?.debit_total}</td>
                            <td className="border-gray-800 border-r border-b p-1">{purchase_return?.journal_entries_total?.debit_total}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className="border-b border-r border-gray-800 p-1"></td>

                  </tr>}
                </>
              );
            })}
          {purchaseReturnsData?.results?.data?.totals && (
            <tr className="bg-gray-300 font-bold text-right">
              <td colSpan={4} className="border-r border-b border-gray-800 p-1">
                Grand Total:
              </td>
              <td className="border-r border-b border-gray-800 p-1">
                {purchaseReturnsData.results.data.totals.quantity}
              </td>
              <td className="border-b border-r border-gray-800 p-1">
                {purchaseReturnsData.results.data.totals.amount}
              </td>
              <td className="border-b border-r border-gray-800 p-1"></td>

            </tr>
          )}
        </tbody>
      </table>

</div>

    </div>
  )
}

export default SinglePurchaseReturns
