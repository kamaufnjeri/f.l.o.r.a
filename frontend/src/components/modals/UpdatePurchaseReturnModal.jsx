import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Spin } from 'antd';

import { getItems, patchRequest, postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormInitialField from '../forms/FormInitialField';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import SearchableSelectField from '../forms/SearchableSelectField';


const UpdatePurchaseReturnModal = ({ openModal, setOpenModal, title, purchaseReturnId, setPurchaseReturnId, onPurchaseReturnSuccess }) => {
    const { orgId } = useParams();
    const scrollRef = useRef(null);
    const { getSelectOptions } = useSelectOptions();
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({});

    const getData = async () => {
        setIsLoading(true);
        const purchaseReturn = await getItems(`${orgId}/purchase_returns/${purchaseReturnId}`);
        if (!purchaseReturn) {
            setIsLoading(false);
            return;
        }
        setFormData(purchaseReturn);
        setStocks(purchaseReturn?.details?.stocks)
        
        setIsLoading(false);
    }


    useEffect(() => {
        if (openModal) {
            getData();

        }
    }, [openModal, purchaseReturnId, ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await patchRequest(formData, `${orgId}/purchase_returns/${purchaseReturnId}`);
        if (response.success) {
            setIsSubmitted(true);

            getSelectOptions();

            setFormData(response.data);
            setStocks(response.data?.details?.stocks)
            onPurchaseReturnSuccess();
            toast.success('Edited: Purchase return edited successfully');
            setTimeout(() => setIsSubmitted(false), 500);
        } else {
            toast.error(`${response.error}`);
            getData();

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
        setPurchaseReturnId(null);
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
                        {formData?.return_entries?.map((entry, index) => (
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
                                                setFieldValue('return_entries', updatedEntries);
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
                                        if (values.return_entries.length < purchase.purchase_entries.length) {
                                            const updatedEntries = [...values.return_entries, { purchase_entry: '', return_quantity: 0 }];
                                            setFieldValue('return_entries', updatedEntries);
                                        }
                                    }}
                                >
                                    <FaPlus /> Add Entry
                                </Button>
                            </span></div>

                        <Button type="primary" className='w-[30%] self-center' htmlType="submit" disabled={isLoading}>
                            {isLoading ? <Spin /> : 'Edit'}
                        </Button>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default UpdatePurchaseReturnModal;
