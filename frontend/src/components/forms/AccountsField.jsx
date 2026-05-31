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
        <table className='min-w-full'>

            <thead className='text-left'>
                <tr>
                    <th className='p-1'  colSpan={3}>
                        <h2 className='text-xl font-semibold'>{header}</h2>

                    </th>
                </tr>
                <tr>
                    <th className='p-1' >
                        <h4>Account</h4>
                    </th>
                    {newValues && (
                        <>
                            <th className='p-1' >
                                <h4>Amount</h4>
                            </th>
                            <th className='p-1' >
                                <h4>Remove</h4>
                            </th>

                        </>
                    )}

                </tr>
            </thead>

            <tbody>
                {newValues.map(({ entry, index }) => (
                    <tr key={index}>
                        <td className='p-1'>
                            <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={accounts} value={entry.account} name={'account'} />

                        </td>
                        {newValues && (
                            <>
                                <td className='p-1'>
                                    <InputNumberField
                                        value={entry.amount}
                                        name={'amount'}
                                        handleChange={handleChange}
                                        index={index}
                                    />
                                </td>
                                <td className='p-1'>
                                    <Button
                                        type="danger"
                                        onClick={() => {
                                            const updatedEntries = formData?.journal_entries.filter((_, i) => i !== index);
                                            handleChange('journal_entries', updatedEntries);
                                        }}
                                    >
                                        <FaTimes className='text-red-500 text-xl' />
                                    </Button>
                                </td>
                            </>)}

                    </tr>

                ))}
                <tr>
                    <td className='p-1'>
                    <Button
                            type="dashed"
                            className=' min-w-full'
                            onClick={() => {
                                const updatedEntries = [...formData?.journal_entries, { account: '', debit_credit: type, amount: 0.0, type: 'payment' }];
                                handleChange('journal_entries', updatedEntries);
                            }}
                        >
                            <FaPlus /> Add Entry
                        </Button>
                    </td>
                </tr>
            </tbody>

           
            
        </table>
    )
}

export default AccountsField
