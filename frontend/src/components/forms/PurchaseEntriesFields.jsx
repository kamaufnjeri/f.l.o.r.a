import React from 'react';
import { Button } from 'antd';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import SearchableSelectField from './SearchableSelectField';
import { useAuth } from '../../context/AuthContext';

const PurchaseEntriesFields = ({ formData, handleChange, stocks, isSubmitted = false }) => {
    const { currentOrg } = useAuth();

    return (
            <table className='table-auto min-w-full border-collapse'>
                <thead> 
                    <tr className='text-left'>
                    <th className='p-1' colSpan={2}>Item</th>
                   <th className='p-1' colSpan={2}>Quantity</th>
                    <th className='p-1' colSpan={2}>Rate ({currentOrg.currency})</th>
                    <th className='p-1' >Remove</th>
                    </tr>
                   
                </thead>
                <tbody>
                    {formData?.purchase_entries?.map((entry, index) => (
                        <tr key={index}>
                            
                            <td className='p-1' colSpan={2}>
                                <SearchableSelectField item={true} isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={stocks} value={entry.stock} name={'stock'} />

                            </td>
                            <td className='p-1'colSpan={2} >
                                <InputNumberField
                                    value={entry.purchased_quantity}
                                    name={'purchased_quantity'}
                                    handleChange={handleChange}
                                    index={index}
                                    item={true}
                                />
                            </td>
                            <td className='p-1' colSpan={2} >
                                <InputNumberField
                                    value={entry.purchase_price}
                                    name={'purchase_price'}
                                    handleChange={handleChange}
                                    index={index}
                                    item={true}
                                />
                            </td>
                            <td className='p-1' >
                                {formData?.purchase_entries.length > 1 && (
                                    <Button
                                        type="danger"
                                        onClick={() => {
                                            const updatedEntries = formData.purchase_entries.filter((_, i) => i !== index);
                                            handleChange('purchase_entries', updatedEntries);
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
                            className='w-full'
                            onClick={() => {
                                const updatedEntries = [...formData.purchase_entries, { stock: '', purchased_quantity: 0, purchase_price: 0.0 }];
                                handleChange('purchase_entries', updatedEntries);
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

export default PurchaseEntriesFields
