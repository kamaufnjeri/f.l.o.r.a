import React, { memo, useState, useCallback, useMemo } from 'react';
import { Button } from 'antd';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { debitCredit } from '../../lib/constants';
import SearchableSelectField from './SearchableSelectField';
import { useAuth } from '../../context/AuthContext';


const JournalEntries = memo(({ formData, handleChange, accounts, minLength = 2, isSubmitted }) => {
  const { currentOrg } = useAuth();

  const debitCreditDiffMemo = useMemo(() => {
    return (formData.journal_entries || []).reduce((acc, entry) => {
      return entry.debit_credit === 'debit'
        ? acc + parseFloat(entry.amount || 0)
        : acc - parseFloat(entry.amount || 0);
    }, 0);
  }, [formData?.journal_entries]);

  const handleAddEntry = useCallback(() => {
    const updatedEntries = [...formData.journal_entries, { account: '', debit_credit: '', amount: 0.0, type: 'journal' }];
    handleChange('journal_entries', updatedEntries);
  }, [formData.journal_entries, handleChange]);

  const handleRemoveEntry = useCallback((index) => {
    const updatedEntries = formData.journal_entries.filter((_, i) => i !== index);
    handleChange('journal_entries', updatedEntries);
  }, [formData.journal_entries, handleChange]);



  return (
    <>
      <table className='table-auto min-w-full border-collapse'>
        <thead>
          <tr className='text-left'>
            <th className='p-1' colSpan={2}>Account</th>
            <th className='p-1' colSpan={2}>Debit/Credit</th>
            <th className='p-1' colSpan={2}>Amount ({currentOrg.currency})</th>
            <th className='p-1' >Remove</th>
          </tr>

        </thead>
        <tbody>
          {formData?.journal_entries?.map((entry, index) => (
            <tr key={index}>
              <td className='p-1' colSpan={2}>
                <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={accounts} value={entry.account} name={'account'} />

              </td>
              <td className='p-1' colSpan={2} >
                <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={debitCredit} value={entry.debit_credit} name={'debit_credit'} />

              </td>
              <td className='p-1' colSpan={2} >
              <InputNumberField
                value={entry.amount}
                name={'amount'}
                handleChange={handleChange}
                index={index}
              />
              </td>
              <td className='p-1' >
                {formData.journal_entries.length > minLength && (
                  <Button
                    type="danger"
                    onClick={() => handleRemoveEntry(index)}
                  >
                    <FaTimes className='text-red-500 text-xl' />
                  </Button>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td className='p-1'>
              <Button
                type="dashed"
                className='w-full'
                onClick={handleAddEntry}
              >
                <FaPlus /> Add Entry
              </Button>
            </td>

          </tr>
          <tr className='text-right'>
            <td className='p-1' colSpan={5}>Difference</td>
            <td className='p-1'>
            <span className={`${debitCreditDiffMemo !== 0 ? 'text-red-500' : ''}`}>
              Kshs {debitCreditDiffMemo.toFixed(2)}
            </span>
            </td>
          </tr>
        </tbody>
      </table>

    </>
  );
});

export default JournalEntries;
