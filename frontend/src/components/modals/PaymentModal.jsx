import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormInitialField from '../forms/FormInitialField';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import AccountsField from '../forms/AccountsField';

const PaymentModal = ({ openModal, setOpenModal, title, type, bill_id = null, invoice_id = null, onPaymentSuccess }) => {
    const scrollRef = useRef(null);
    const { orgId } = useParams();
    const { paymentAccounts, getSelectOptions } = useSelectOptions();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        date: null,
        description: '',
        bill: bill_id,
        invoice: invoice_id,
        journal_entries: [
            { account: null, debit_credit: type, amount: 0.0, type: 'payment' },
        ],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await postRequest(formData, `${orgId}/payments`);
        if (response.success) {
            setIsSubmitted(true);

            getSelectOptions();

            setFormData({
                date: null,
                description: '',
                bill: bill_id,
                invoice: invoice_id,
                journal_entries: [
                    { account: null, debit_credit: type, amount: 0.0, type: 'payment' },
                ],
            });
            onPaymentSuccess();
            toast.success('Recorded: Payment recorded successfully');
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
            } else {
                const updatedEntries = [...prev.journal_entries];
                updatedEntries[index] = { ...updatedEntries[index], [field]: value };
                updatedData.journal_entries = updatedEntries;
            }

            return updatedData;
        });
    };

    useEffect(() => {
        if (openModal) {
            setFormData({
                date: null,
                description: '',
                bill: bill_id,
                invoice: invoice_id,
                journal_entries: [
                    { account: null, debit_credit: type, amount: 0.0, type: 'payment' },
                ],
            });
        }
    }, [openModal, bill_id, invoice_id, type]);

    useEffect(() => {
        scrollBottom(scrollRef);
    }, [formData.journal_entries]);

    const handleCancel = () => {
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
                        {isLoading ? <Spin /> : 'Record'}
                    </Button>
                </form>
            </div>
        </Modal>
    );
};

export default PaymentModal;
