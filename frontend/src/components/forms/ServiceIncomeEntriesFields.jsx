import React from 'react';
import { Button } from 'antd';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import SearchableSelectField from './SearchableSelectField';

const ServiceIncomeEntriesFields = ({ formData, handleChange, services, isSubmitted = false }) => {
    return (
        <div className='flex-1 flex flex-col gap-2'>
            <div className='flex flex-row w-[100%] justify-between items-start'>
                <span className='w-[10%]'><span>No. </span></span>
                <span className='w-[25%]'><span>Service</span></span>
                <span className='w-[25%]'><span>Quantity</span></span>
                <span className='w-[25%]'><span>Price</span></span>
                <span className='w-[10%]'>Remove</span>
            </div>

            {formData?.service_income_entries?.map((entry, index) => (
                <div key={index} className='flex flex-row w-full gap-3'>
                    <span className='w-[10%]'><span>{index + 1}</span></span>
                    <span className='w-[25%]'>
                        <SearchableSelectField item={true} isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={services} value={entry.service} name={'service'} />

                    </span>
                    <span className='w-[25%]'>
                        <InputNumberField
                            value={entry.quantity}
                            name={'quantity'}
                            handleChange={handleChange}
                            index={index}
                            item={true}
                        />
                    </span>
                    <span className='w-[25%]'>
                        <InputNumberField
                        value={entry.price}
                        name={'price'}
                        handleChange={handleChange}
                        index={index}
                        item={true}
                    />
                    </span>
                    <span className='w-[10%]'>
                        {formData?.service_income_entries.length > 1 && (
                            <Button
                                type="danger"
                                onClick={() => {
                                    const updatedEntries = formData.service_income_entries.filter((_, i) => i !== index);
                                    handleChange('service_income_entries', updatedEntries);
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
                            const updatedEntries = [...formData.service_income_entries, { service: '', quantity: 1, price: 0.0 }];
                            handleChange('service_income_entries', updatedEntries);
                        }}
                    >
                        <FaPlus /> Add Entry
                    </Button>
                </span>
            </div>
        </div>
    )
}

export default ServiceIncomeEntriesFields
