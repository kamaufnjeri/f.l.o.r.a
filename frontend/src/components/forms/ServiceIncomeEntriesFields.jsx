import React from 'react';
import { Button } from 'antd';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import SearchableSelectField from './SearchableSelectField';
import { useAuth } from '../../context/AuthContext';

const ServiceIncomeEntriesFields = ({ formData, handleChange, services, isSubmitted = false }) => {
    const { currentOrg } = useAuth();

    return (
        <table className='table-auto min-w-full border-collapse'>
        <thead>
            <tr className='text-left'>
                <th className='p-1' colSpan={2}>Sevice</th>
                <th className='p-1' colSpan={2}>Quantity</th>
                <th className='p-1' colSpan={2}>Rate ({currentOrg.currency})</th>
                <th className='p-1' >Remove</th>
            </tr>

        </thead>
        <tbody>
        {formData?.service_income_entries?.map((entry, index) => (
                <tr key={index}>

                    <td className='p-1' colSpan={2}>
                    <SearchableSelectField item={true} isSubmitted={isSubmitted} handleChange={handleChange} index={index} options={services} value={entry.service} name={'service'} />

                    </td>
                    <td className='p-1' colSpan={2} >
                    <InputNumberField
                            value={entry.quantity}
                            name={'quantity'}
                            handleChange={handleChange}
                            index={index}
                            item={true}
                        />
                    </td>
                    <td className='p-1' colSpan={2} >
                    <InputNumberField
                        value={entry.price}
                        name={'price'}
                        handleChange={handleChange}
                        index={index}
                        item={true}
                    />
                    </td>
                    <td className='p-1' >
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
                    </td>
                </tr>
            ))}
            <tr>
                <td className='p-1'>
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
                </td>

            </tr>
        </tbody>
    </table>
        
    )
}

export default ServiceIncomeEntriesFields
