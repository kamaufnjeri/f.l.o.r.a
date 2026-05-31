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
        <table className='min-w-full'>
            <tbody>
                <tr>
                    <td className='p-1' >
                        <h2 className='text-xl font-semibold'>{header}</h2>

                    </td>
                    <td className='p-1' >
                        <Button
                            type="danger"
                            onClick={removeDiscount}
                        >
                            <FaTimes className='text-red-500 text-xl' />
                        </Button>
                    </td>
                </tr>
                <tr>
                    <td className='p-1' >
                        <SearchableSelectField isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={accounts} value={entry?.account} name={'account'} />
                    </td>
                    <td className='p-1' >
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

export default DiscountAccountField
