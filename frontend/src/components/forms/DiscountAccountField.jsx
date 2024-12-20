import React from 'react'
import SearchableSelectField from './SearchableSelectField'
import { findEntriesByType } from '../../lib/helpers';
import InputNumberField from './InputNumberField';
import { Button } from 'antd';
import { FaTimes } from 'react-icons/fa';

const DiscountAccountField = ({ header, formData, setShowDiscount, handleChange, accounts, isSubmitted = false }) => {
    const entries = findEntriesByType(formData?.journal_entries, 'discount');
  const entry = entries?.[0]?.entry || {};
  const index = entries?.[0]?.index || null;

    const removeDiscount = () => {
        const updatedEntries = formData?.journal_entries.filter((_, i) => i !== index);
        handleChange('journal_entries', updatedEntries);
        setShowDiscount(false);
    }

    return (
        <div className='flex flex-col gap-2 w-full'>
            <div className='flex flex-row w-full text-xl font-bold h-6'>
                <span className='w-[73%]'>{header}</span>
                <span className='w-[10%]'>
                    <Button
                        type="danger"
                        onClick={removeDiscount}
                    >
                        <FaTimes className='text-red-500 text-xl' />
                    </Button>
                </span>
            </div>

            <div className="flex flex-row gap-5 items-start w-full">
                <span className='w-[60%]'>
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

export default DiscountAccountField
