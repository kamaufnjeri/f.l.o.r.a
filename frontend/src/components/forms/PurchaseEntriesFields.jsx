import React from 'react';
import { Button } from 'antd';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import SearchableSelectField from './SearchableSelectField';

const PurchaseEntriesFields = ({ formData, handleChange, stocks, isSubmitted = false }) => {
    return (
        <div className='flex-1 flex flex-col gap-2'>
            <div className='flex flex-row w-[100%] justify-between items-start'>
                <span className='w-[10%]'><span>No. </span></span>
                <span className='w-[25%]'><span>Item</span></span>
                <span className='w-[25%]'><span>Quantity</span></span>
                <span className='w-[25%]'><span>Purchase price</span></span>
                <span className='w-[10%]'>Remove</span>
            </div>

            {formData?.purchase_entries?.map((entry, index) => (
                <div key={index} className='flex flex-row w-full gap-3'>
                    <span className='w-[10%]'><span>{index + 1}</span></span>
                    <span className='w-[25%]'>
                        <SearchableSelectField item={true} isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={stocks} value={entry.stock} name={'stock'} />

                    </span>
                    <span className='w-[25%]'>
                        <InputNumberField
                            value={entry.purchased_quantity}
                            name={'purchased_quantity'}
                            handleChange={handleChange}
                            index={index}
                            item={true}
                        />
                    </span>
                    <span className='w-[25%]'>
                        <InputNumberField
                        value={entry.purchase_price}
                        name={'purchase_price'}
                        handleChange={handleChange}
                        index={index}
                        item={true}
                    />
                    </span>
                    <span className='w-[10%]'>
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
                    </span>
                </div>

            ))}
            <div className='flex flex-row w-full gap-2'>
                <span className='w-[30%]'>
                    <Button
                        type="dashed"
                        className='w-[80%]'
                        onClick={() => {
                            const updatedEntries = [...formData.purchase_entries, { stock: '', purchased_quantity: 0, purchase_price: 0.0 }];
                            handleChange('purchase_entries', updatedEntries);
                        }}
                    >
                        <FaPlus /> Add Entry
                    </Button>
                </span>
            </div>
        </div>
    )
}

export default PurchaseEntriesFields
