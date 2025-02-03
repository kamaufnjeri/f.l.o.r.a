import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spin } from 'antd';
import { findEntriesByType, postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../../components/forms/FormHeader';
import FormInitialField from '../../components/forms/FormInitialField';
import PurchaseSalesAccountField from '../../components/forms/PurchaseSalesAccountField';
import PurchaseEntriesFields from '../../components/forms/PurchaseEntriesFields';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import { FaPlus } from 'react-icons/fa';
import AccountsField from '../../components/forms/AccountsField';
import BillInvoiceAccountField from '../../components/forms/BillInvoiceAccountField';
import DiscountAccountField from '../../components/forms/DiscountAccountField';
import SubHeader from '../../components/shared/SubHeader';


const RecordPurchase = () => {
    const scrollRef = useRef(null);
    const { orgId } = useParams();
    const { stocks, serialNumbers, paymentAccounts, purchaseAccounts, getSelectOptions, suppliersAccounts, incomeDiscountAccounts } = useSelectOptions();
    const [showBill, setShowBill] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [formData, setFormData] = useState({
        date: null,
        description: '',
        due_date: null,
        serial_number: '',
        purchase_entries: [{ stock: null, purchased_quantity: 0, purchase_price: 0.0 }],
        journal_entries: [
            { account: null, debit_credit: 'debit', amount: 0.0, type: 'purchase' },
        ],
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await postRequest(formData, `${orgId}/purchases`);
        if (response.success) {
            setIsSubmitted(true);

            getSelectOptions();

            setFormData({
                date: null,
                description: '',
                due_date: null,
                serial_number: serialNumbers?.purchase || '',
                purchase_entries: [{ stock: null, purchased_quantity: 0, purchase_price: 0.0 }],
                journal_entries: [
                    { account: null, debit_credit: 'debit', amount: 0.0, type: 'purchase' },
                ],
            });
            setShowDiscount(false);
            setShowBill(false);
            toast.success('Recorded: Purchase recorded successfully');
            setTimeout(() => setIsSubmitted(false), 500);
        } else {
            toast.error(`${response.error}`);
        }
        setIsLoading(false);


    };

    const getTotalPurchasePrice = (items) =>
        items.reduce(
            (total, item) => total + parseFloat(item.purchased_quantity || 0) * parseFloat(item.purchase_price || 0),
            0
        );

    const handleChange = (field, value, index = null, item = null) => {
        setFormData((prev) => {
            let updatedData = { ...prev };

            if (index === null) {
                updatedData[field] = value;
            } else if (item) {
                const updatedItems = [...formData.purchase_entries];
                updatedItems[index] = { ...updatedItems[index], [field]: value };
                updatedData.purchase_entries = updatedItems;
            } else {
                const updatedEntries = [...prev.journal_entries];
                updatedEntries[index] = { ...updatedEntries[index], [field]: value };
                updatedData.journal_entries = updatedEntries;
            }

            const totalPurchasePrice = getTotalPurchasePrice(updatedData.purchase_entries);

            const discount = findEntriesByType(updatedData.journal_entries, 'discount')[0];
            const discountAmount = parseFloat(discount?.entry?.amount) || 0;

            const paymentsTotal = updatedData.journal_entries
                .filter(entry => entry.type === 'payment')
                .reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);


            const updatedBillAmount = totalPurchasePrice - discountAmount - paymentsTotal;

            updatedData.journal_entries = updatedData.journal_entries.map((entry) => {
                if (entry.type === 'bill') {
                    return { ...entry, amount: updatedBillAmount >= 0 ? updatedBillAmount : 0 };
                }
                if (entry.type === 'purchase') {
                    return { ...entry, amount: totalPurchasePrice >= 0 ? totalPurchasePrice : 0 };
                }
                return entry;
            });

            return updatedData;
        });
    };



    useEffect(() => {
        getSelectOptions();
        if (serialNumbers?.purchase) {
            setFormData((prev) => ({ ...prev, serial_number: serialNumbers.purchase }));
        }
    }, [serialNumbers, orgId]);

    useEffect(() => {

        scrollBottom(scrollRef);
    }, [formData.journal_entries, formData.purchase_entries]);




    const addBill = () => {
        const updatedEntries = [...formData.journal_entries, { account: '', debit_credit: 'credit', amount: 0.0, type: 'bill' }];

        handleChange('journal_entries', updatedEntries);
        setShowBill(true);
    }

    const addDiscount = () => {
        const updatedEntries = [...formData.journal_entries, { account: '', debit_credit: 'credit', amount: 0.0, type: 'discount' }];

        handleChange('journal_entries', updatedEntries);
        setShowDiscount(true);
    }


    return (
        <div className="flex flex-col items-start justify-start h-full gap-2 w-full text-gray-800">
            <SubHeader supplier={true} item={true} account={true} />
            <div ref={scrollRef} className="flex flex-col font-medium gap-2 w-full">
                <FormHeader header="Record Purchase" />
                <form className="flex flex-col gap-2" onSubmit={handleSubmit}>

                    <div className="flex gap-4 flex-col lg:flex-row">
                        <div className="lg:w-[50%] w-full flex flex-col gap-2 shadow-md rounded-md p-2">
                            <div className='space-y-2'>
                                <span className='font-semibold text-xl'>Purchase No: {serialNumbers.purchase}</span>

                                <FormInitialField formData={formData} handleChange={handleChange} />
                            </div>

                            <div className='w-full flex flex-row gap-2 items-center justify-center'>
                                <div className='w-[40%]'>
                                    <PurchaseSalesAccountField
                                        values={formData?.journal_entries}
                                        handleChange={handleChange}
                                        isSubmitted={isSubmitted}
                                        header="Purchase Account"
                                        accounts={purchaseAccounts}
                                    />
                                </div>

                                <div className='w-[60%]'>
                                    {showDiscount ? <DiscountAccountField
                                        formData={formData}
                                        isSubmitted={isSubmitted}
                                        handleChange={handleChange}
                                        header="Discount"
                                        accounts={incomeDiscountAccounts}
                                        setShowDiscount={setShowDiscount}
                                    /> : <Button
                                        type="dashed"
                                        className='w-[60%]'
                                        onClick={addDiscount}
                                    >
                                        <FaPlus /> Add Discount
                                    </Button>}
                                </div>
                            </div>

                        </div>
                        <div className="lg:w-[50%] w-full flex flex-col gap-2 shadow-md rounded-md p-2">
                            <AccountsField
                                formData={formData}
                                isSubmitted={isSubmitted}
                                type="credit"
                                values={formData?.journal_entries}
                                handleChange={handleChange}
                                header="Purchase Payment Accounts"
                                accounts={paymentAccounts}
                            />



                            {showBill ? <BillInvoiceAccountField
                                formData={formData}
                                handleChange={handleChange}
                                header="Bill"
                                isSubmitted={isSubmitted}
                                accounts={suppliersAccounts}
                                setShowBill={setShowBill}
                            /> : <Button
                                type="dashed"
                                className='w-[30%]'
                                onClick={addBill}
                            >
                                <FaPlus /> Add Bill
                            </Button>}




                        </div>
                    </div>
                    <PurchaseEntriesFields stocks={stocks} isSubmitted={isSubmitted} formData={formData} handleChange={handleChange} />

                    <Button type="primary" className='w-[30%] self-center' htmlType="submit" disabled={isLoading}>
                        {isLoading ? <Spin /> : 'Record'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RecordPurchase;

