import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Spin } from 'antd';

import { postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormInitialField from '../forms/FormInitialField';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import SearchableSelectField from '../forms/SearchableSelectField';



const PurchaseReturnModal = ({ openModal, setOpenModal, title, purchase, onPurchaseReturn }) => {
    const { orgId } = useParams();
    const scrollRef = useRef(null);
    const { getSelectOptions } = useSelectOptions();
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        date: null,
        description: '',
        purchase: purchase?.id,
        return_entries: [
            { purchase_entry: '', return_quantity: 0 },
        ],
    });

    useEffect(() => {
        if (openModal) {
            const newStocks = purchase.purchase_entries.map(
                (entry) => ({ id: entry.id, name: entry.stock_name }))
            setStocks(newStocks);
            setFormData({
                date: null,
                description: '',
                purchase: purchase?.id,
                return_entries: [
                    { purchase_entry: '', return_quantity: 0 },
                ],
            });
        }
    }, [openModal, purchase]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await postRequest(formData, `${orgId}/purchase_returns`);
        console.log(formData, stocks)
        if (response.success) {
            setIsSubmitted(true);

            getSelectOptions();

            setFormData({
                date: null,
                description: '',
                purchase: purchase?.id,
                return_entries: [
                    { purchase_entry: '', return_quantity: 0 },
                ],
            });
            onPurchaseReturn();
            toast.success('Recorded: Purchase return recorded successfully');
            setTimeout(() => setIsSubmitted(false), 500);
        } else {
            toast.error(`${response.error}`);
        }
        setIsLoading(false);


    };

    const handleChange = (field, value, index = null, item = null) => {
        setFormData((prev) => {
            let updatedData = { ...prev };

            if (index === null) {
                updatedData[field] = value;
            } else if (item) {
                const updatedItems = [...formData.return_entries];
                updatedItems[index] = { ...updatedItems[index], [field]: value };
                updatedData.return_entries = updatedItems;
            }

            return updatedData;
        });
    };

    const handleCancel = () => {
        setOpenModal(false);
    };

    useEffect(() => {

        scrollBottom(scrollRef);
    }, [formData.return_entries]);

    return (
        <>

            <Modal
                title={title}
                open={openModal}
                onCancel={handleCancel}
                width={'50%'}
                className='overflow-auto custom-scrollbar max-h-[80%]'
                footer={
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>
                }
            >

                <div ref={scrollRef} className="flex-1 flex flex-col font-medium gap-4 w-full min-h-[50vh] overflow-y-auto custom-scrollbar">
                    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                        <FormInitialField formData={formData} handleChange={handleChange} />


                        <div className='flex flex-row w-full text-xl font-bold'><span className='w-full'><span>
                            Return Items
                        </span>
                        </span></div>
                        <div className='flex flex-row w-full'>
                            <span className='w-[10%]'><span>No#</span></span>
                            <span className='w-[35%]'><span>Return Item</span></span>
                            <span className='w-[35%]'><span>Return Quantity</span></span>
                            <span className='w-[20%]'>Remove</span>

                        </div>
                        {formData?.return_entries.map((entry, index) => (
                            <div key={index} style={{ marginBottom: '16px' }}>
                                <div className='flex flex-row items-start justify-between w-[100%]'>
                                    <span className='w-[4%]'>{index + 1}</span>
                                    <span className='w-[20%]'>
                                        <SearchableSelectField
                                            item={true}
                                            isSubmitted={isSubmitted}
                                            handleChange={handleChange}
                                            index={index} options={stocks}
                                            value={entry.purchase_entry} name={'purchase_entry'}
                                        />



                                    </span>

                                    <span className='w-[20%]'>
                                        <InputNumberField
                                            value={entry.return_quantity}
                                            name={'return_quantity'}
                                            handleChange={handleChange}
                                            index={index}
                                            item={true}
                                        />


                                    </span>
                                    <span className='w-[20%]'>

                                        <Button
                                            type="danger"
                                            onClick={() => {
                                                const updatedEntries = formData.return_entries.filter((_, i) => i !== index);
                                                handleChange('return_entries', updatedEntries);
                                            }}
                                        >
                                            <FaTimes className='text-red-500 text-xl' />
                                        </Button>

                                    </span>
                                </div></div>


                        ))}
                        <div className='flex flex-row w-full gap-5'>
                            <span className='w-[30%]'>
                                <Button
                                    type="dashed"
                                    className='w-[80%]'
                                    onClick={() => {
                                        if (formData.return_entries.length < purchase.purchase_entries.length) {
                                            const updatedEntries = [...formData.return_entries, { purchase_entry: '', return_quantity: 0 }];
                                            handleChange('return_entries', updatedEntries);
                                        }
                                    }}
                                >
                                    <FaPlus /> Add Entry
                                </Button>
                            </span></div>

                        <Button type="primary" className='w-[30%] self-center' htmlType="submit" disabled={isLoading}>
                            {isLoading ? <Spin /> : 'Record'}
                        </Button>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default PurchaseReturnModal;
