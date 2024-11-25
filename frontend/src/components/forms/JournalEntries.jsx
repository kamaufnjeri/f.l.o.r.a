import React, { memo, useState, useCallback, useMemo } from 'react';
import { Button } from 'antd';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { debitCredit } from '../../lib/constants';
import SearchableSelectField from './SearchableSelectField';


const JournalEntries = memo(({ values, handleChange, accounts, minLength = 2, isSubmitted }) => {


  const debitCreditDiffMemo = useMemo(() => {
    return (values.journal_entries || []).reduce((acc, entry) => {
      return entry.debit_credit === 'debit'
        ? acc + parseFloat(entry.amount || 0)
        : acc - parseFloat(entry.amount || 0);
    }, 0);
  }, [values.journal_entries]);

  const handleAddEntry = useCallback(() => {
    const updatedEntries = [...values.journal_entries, { account: '', debit_credit: '', amount: 0.0 }];
    handleChange('journal_entries', updatedEntries);
  }, [values.journal_entries, handleChange]);

  const handleRemoveEntry = useCallback((index) => {
    const updatedEntries = values.journal_entries.filter((_, i) => i !== index);
    handleChange('journal_entries', updatedEntries);
  }, [values.journal_entries, handleChange]);

  

  return (
    <>
      <div className='flex flex-row items-start w-[100%] justify-between border-gray-300 border-b-2'>
        <span className='w-[4%]'>No.</span>
        <span className='w-[25%]'>Account</span>
        <span className='w-[20%]'>Debit/Credit</span>
        <span className='w-[20%]'>Amount</span>
        <span className='w-[20%]'>Remove</span>
      </div>
      {values?.journal_entries?.map((entry, index) => (
        <div key={index}>
          <div className='flex flex-row items-start justify-between w-[100%] border-gray-300 border-b-2 h-15 p-2'>
            <span className='w-[4%]'>{index + 1}</span>
            <span className='w-[25%]'>
              <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={accounts} value={entry.account} name={'account'}/>

             
            </span>
            <span className='w-[20%]'>
            <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={debitCredit} value={entry.debit_credit} name={'debit_credit'}/>
             
            </span>
            <span className='w-[20%]'>
              <InputNumberField
                value={entry.amount}
                name={'amount'}
                handleChange={handleChange}
                index={index}
              />
            </span>
            <span className='w-[20%]'>
              {values.journal_entries.length > minLength && (
                <Button
                  type="danger"
                  onClick={() => handleRemoveEntry(index)}
                >
                  <FaTimes className='text-red-500 text-xl' />
                </Button>
              )}
            </span>
          </div>
        </div>
      ))}
      <div className='flex flex-row w-full gap-5'>
        <span className='w-[30%]'>
          <Button
            type="dashed"
            className='w-[80%]'
            onClick={handleAddEntry}
          >
            <FaPlus /> Add Entry
          </Button>
        </span>
        <span className='w-[20%]'>Difference</span>
        <span className='w-[20%]'>
          <div className='flex justify-end'>
            <span className={`${debitCreditDiffMemo !== 0 ? 'text-red-500' : ''}`}>
              Kshs {debitCreditDiffMemo.toFixed(2)}
            </span>
          </div>
        </span>
      </div>
    </>
  );
});

export default JournalEntries;
