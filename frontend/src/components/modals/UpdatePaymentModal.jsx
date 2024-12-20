import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { getItems, patchRequest, postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormInitialField from '../forms/FormInitialField';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import AccountsField from '../forms/AccountsField';

const UpdatePaymentModal = ({ openModal, setOpenModal, title, type, paymentId, setPaymentId, onPaymentSuccess }) => {
    const scrollRef = useRef(null);
    const { orgId } = useParams();
    const { paymentAccounts, getSelectOptions } = useSelectOptions();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({});

    const getData = async () => {
        setIsLoading(true);
        const payments = await getItems(`${orgId}/payments/${paymentId}`);
        if (!payments) {
            setIsLoading(false);
            return;
        }
        setFormData(payments);
        
        setIsLoading(false);
    }

    useEffect(() => {
        if (openModal && paymentId) {
            getData();
        }
    }, [orgId, paymentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await patchRequest(formData, `${orgId}/payments/${paymentId}`);
        if (response.success) {
            setIsSubmitted(true);

            getSelectOptions();

            setFormData(response.data);
            onPaymentSuccess();
            toast.success('Edited: Payment edited successfully');
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
            } else {
                const updatedEntries = [...prev.journal_entries];
                updatedEntries[index] = { ...updatedEntries[index], [field]: value };
                updatedData.journal_entries = updatedEntries;
            }

            const paymentsTotal = updatedData.journal_entries
            .filter(entry => entry.type === 'payment')
            .reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);

            

            updatedData.journal_entries = updatedData.journal_entries.map((entry) => {
                if (entry.type === 'bill' || entry.type == 'invoice') {
                    return { ...entry, amount: paymentsTotal >= 0 ? paymentsTotal : 0 };
                }
                
                return entry;
            });

            return updatedData;
        });

        

    };

   

    useEffect(() => {
        scrollBottom(scrollRef);
    }, [formData.journal_entries]);

    const handleCancel = () => {
        setPaymentId(null);
        setOpenModal(false);
    };

    return (
        <Modal
            title={title}
            open={openModal}
            onCancel={handleCancel}
            className="overflow-auto custom-scrollbar max-h-[80%]"
            width={'50%'}
            footer={
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>
            }
        >
            <div ref={scrollRef} className="flex-1 flex flex-col font-medium gap-4 w-full min-h-[50vh] overflow-y-auto custom-scrollbar">
                <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                    <FormInitialField formData={formData} handleChange={handleChange} />

                    <div className="w-full">
                        <AccountsField
                            formData={formData}
                            isSubmitted={isSubmitted}
                            type={type}
                            values={formData?.journal_entries}
                            handleChange={handleChange}
                            header="Payment Accounts"
                            accounts={paymentAccounts}
                        />
                    </div>

                    <Button type="primary" className="w-[30%] self-center" htmlType="submit" disabled={isLoading}>
                        {isLoading ? <Spin /> : 'Edit'}
                    </Button>
                </form>
            </div>
        </Modal>
    );
};

export default UpdatePaymentModal;
