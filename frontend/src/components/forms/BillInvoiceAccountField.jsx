import React from 'react'
import SearchableSelectField from './SearchableSelectField'
import DateField from './DateField.Jsx';
import { findEntriesByType } from '../../lib/helpers';
import { Button } from 'antd';
import { FaTimes } from 'react-icons/fa';
import moment from 'moment';
import InputNumberField from './InputNumberField';

const maxDate = moment().add(1, 'year').endOf('year').format('YYYY-MM-DD');
const minDate = moment().format('YYYY-MM-DD');

const BillInvoiceAccountField = ({ header, setShowBill, formData, handleChange, accounts, isSubmitted = false, type = 'bill' }) => {
  const entries = findEntriesByType(formData?.journal_entries, type);
  const entry = entries?.[0]?.entry || {};
  const index = entries?.[0]?.index;

  const removeBill = () => {
    const updatedEntries = formData?.journal_entries.filter((_, i) => i !== index);
    handleChange('journal_entries', updatedEntries);
    handleChange('due_date', null);
    setShowBill(false);
  }

  const getMinDate = () => {
    const purchaseDate = formData.date;
    const today = moment().format('YYYY-MM-DD');
    if (purchaseDate && moment(purchaseDate).isValid()) {
      return moment(purchaseDate).format('YYYY-MM-DD');
    };
    return minDate;
  };

  return (
    <table className='min-w-full'>
      <tbody>
        <tr className='text-left'>
          <td className='p-1'>
            <h2 className='text-xl font-semibold'>{header}</h2>

          </td>
          <td className='p-1' >
            <label htmlFor="date" className="w-[20%]">Due Date</label>

          </td>
          <td className='p-1' >
            <DateField value={formData.due_date} handleChange={handleChange} name="due_date" maxDate={maxDate} minDate={getMinDate()} />

          </td>
          <td className='p-1' >
            <Button
              type="danger"
              onClick={removeBill}
            >
              <FaTimes className='text-red-500 text-xl' />
            </Button>
          </td>
        </tr>
        <tr >
          <td className='p-1'  colSpan={2}>
            <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={accounts} value={entry?.account} name={'account'} />

          </td>
          <td className='p-1'  colSpan={2}>
            <InputNumberField
              value={entry.amount}
              name={'amount'}
              handleChange={handleChange}
              index={index}
            />
          </td>
        </tr>
      </tbody>
    </table>

  )
}

export default BillInvoiceAccountField
