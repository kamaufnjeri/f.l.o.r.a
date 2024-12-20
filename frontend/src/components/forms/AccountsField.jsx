// JournalEntries.jsx
import React from 'react';
import { Button } from 'antd';
import { FaPlus, FaTimes } from 'react-icons/fa';
import SearchableSelectField from './SearchableSelectField';
import InputNumberField from './InputNumberField';
import { findEntriesByType } from '../../lib/helpers';

const AccountsField = ({ header, values, formData, handleChange, accounts, type, isSubmitted = false }) => {
    const newValues = findEntriesByType(values, 'payment');

    return (
        <div className='flex flex-col gap-2 w-full'>
            <div className='flex flex-row w-full text-xl font-bold'>
                <span>{header}</span>
            </div>
            <div className='flex flex-row w-full gap-2'>
                <span className='w-[40%]'><span>Account</span></span>
                {newValues && (
                    <>
                        <span className='w-[40%]'><span>Amount</span></span>
                        <span className='w-[10%]'>Remove</span>
                    </>
                )}
            </div>
            {newValues.map(({entry, index}) => (
                <div key={index} className='flex flex-row w-full gap-2'>
                    <span className='w-[40%]'>
                        <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={accounts} value={entry.account} name={'account'} />
                    </span>
                    {newValues && (
                        <><span className='w-[40%]'>
                            <InputNumberField
                                value={entry.amount}
                                name={'amount'}
                                handleChange={handleChange}
                                index={index}
                            />

                        </span>
                            <span className='w-[10%]'>
                                <Button
                                    type="danger"
                                    onClick={() => {
                                        const updatedEntries = formData?.journal_entries.filter((_, i) => i !== index);
                                        handleChange('journal_entries', updatedEntries);
                                    }}
                                >
                                    <FaTimes className='text-red-500 text-xl' />
                                </Button>
                            </span>
                        </>)}

                </div>

            ))}
            <div className='flex flex-col gap-2 w-full'>

                <div className='flex flex-row w-full gap-2'>
                    <span className='w-[30%]'>
                        <Button
                            type="dashed"
                            className='w-[80%]'
                            onClick={() => {
                                const updatedEntries = [...formData?.journal_entries, { account: '', debit_credit: type, amount: 0.0, type: 'payment' }];
                                handleChange('journal_entries', updatedEntries);
                            }}
                        >
                            <FaPlus /> Add Entry
                        </Button></span>
                </div>
            </div>
        </div>
    )
}

export default AccountsField
