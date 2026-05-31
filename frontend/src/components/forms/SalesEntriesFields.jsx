import React from 'react';
import { Button } from 'antd';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import SearchableSelectField from './SearchableSelectField';
import { useAuth } from '../../context/AuthContext';

const SalesEntriesFields = ({ formData, handleChange, stocks, isSubmitted = false }) => {
    const { currentOrg } = useAuth();

    return (
        <table className='table-auto min-w-full border-collapse rounded-md shadow-md p-1'>
            <thead>
                <tr className='text-left'>
                    <th className='p-1' colSpan={2}>Item</th>
                    <th className='p-1' colSpan={2}>Quantity</th>
                    <th className='p-1' colSpan={2}>Rate ({currentOrg.currency})</th>
                    <th className='p-1' >Remove</th>
                </tr>

            </thead>
            <tbody>
                {formData?.sales_entries?.map((entry, index) => (
                    <tr key={index}>

                        <td className='p-1' colSpan={2}>
                            <SearchableSelectField item={true} isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={stocks} value={entry.stock} name={'stock'} />

                        </td>
                        <td className='p-1' colSpan={2} >
                            <InputNumberField
                                value={entry.sold_quantity}
                                name={'sold_quantity'}
                                handleChange={handleChange}
                                index={index}
                                item={true}
                            />
                        </td>
                        <td className='p-1' colSpan={2} >
                            <InputNumberField
                                value={entry.sales_price}
                                name={'sales_price'}
                                handleChange={handleChange}
                                index={index}
                                item={true}
                            />
                        </td>
                        <td className='p-1' >
                            {formData?.sales_entries.length > 1 && (
                                <Button
                                    type="danger"
                                    onClick={() => {
                                        const updatedEntries = formData.sales_entries.filter((_, i) => i !== index);
                                        handleChange('sales_entries', updatedEntries);
                                    }}
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
                            className='w-[80%]'
                            onClick={() => {
                                const updatedEntries = [...formData.sales_entries, { stock: '', sold_quantity: 0, sales_price: 0.0 }];
                                handleChange('sales_entries', updatedEntries);
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

export default SalesEntriesFields
