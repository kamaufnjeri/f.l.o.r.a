import React from 'react'
import SearchableSelectField from './SearchableSelectField'
import DateField from './DateField.Jsx';
import { findEntriesByType } from '../../lib/helpers';
import { Button } from 'antd';
import { FaTimes } from 'react-icons/fa';
import moment from 'moment';
import InputNumberField from './InputNumberField';

const maxDate = moment().add(1, 'year').endOf('year').format('YYYY-MM-DD');
const minDate =moment().format('YYYY-MM-DD');

const BillInvoiceAccountField = ({ header, setShowBill, formData, handleChange, accounts, isSubmitted = false, type='bill' }) => {
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
    <div className='flex flex-col gap-2 w-full'>
      <div className='flex flex-row gap-5 items-start w-full'>
        <span className='w-[20%]  text-xl font-bold'>{header}</span>
        <label htmlFor="date" className="w-[20%]">Due Date</label>
        <span className="w-[40%]">
          <DateField value={formData.due_date} handleChange={handleChange} name="due_date" maxDate={maxDate} minDate={getMinDate()}/>
        </span>
        <span className='w-[20%]'>
          <Button
            type="danger"
            onClick={removeBill}
          >
            <FaTimes className='text-red-500 text-xl' />
          </Button>
        </span>
      </div>
      <div className="flex flex-row gap-5 items-start w-full">

        <span className='w-[40%]'>
          <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={accounts} value={entry?.account} name={'account'} />
        </span>
        <span className='w-[40%]'>
                    <InputNumberField
                        value={entry.amount}
                        name={'amount'}
                        handleChange={handleChange}
                        index={index}
                    />
                </span>
        
      </div>
      

    </div>
  )
}

export default BillInvoiceAccountField
