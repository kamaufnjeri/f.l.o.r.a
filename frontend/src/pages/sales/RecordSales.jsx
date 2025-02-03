import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spin } from 'antd';
import { findEntriesByType, postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../../components/forms/FormHeader';
import FormInitialField from '../../components/forms/FormInitialField';
import PurchaseSalesAccountField from '../../components/forms/PurchaseSalesAccountField';
import SalesEntriesFields from '../../components/forms/SalesEntriesFields';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import { FaPlus } from 'react-icons/fa';
import AccountsField from '../../components/forms/AccountsField';
import BillInvoiceAccountField from '../../components/forms/BillInvoiceAccountField';
import DiscountAccountField from '../../components/forms/DiscountAccountField';
import SubHeader from '../../components/shared/SubHeader';


const RecordSales = () => {
    const scrollRef = useRef(null);
    const { orgId } = useParams();
    const { stocks, serialNumbers, paymentAccounts, salesAccounts, expenseDiscountAccounts, getSelectOptions, customersAccounts } = useSelectOptions();
    const [showInvoice, setShowInvoice] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [formData, setFormData] = useState({
        date: null,
        description: '',
        due_date: null,
        serial_number: '',
        sales_entries: [{ stock: null, sold_quantity: 0, sales_price: 0.0 }],
        journal_entries: [
            { account: null, debit_credit: 'credit', amount: 0.0, type: 'sales' },
        ],
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await postRequest(formData, `${orgId}/sales`);
        if (response.success) {
            setIsSubmitted(true);

            getSelectOptions();

            setFormData({
                date: null,
                description: '',
                due_date: null,
                serial_number: serialNumbers?.sales || '',
                sales_entries: [{ stock: null, sold_quantity: 0, sales_price: 0.0 }],
                journal_entries: [
                    { account: null, debit_credit: 'credit', amount: 0.0, type: 'sales' },
                ],
            });
            setShowDiscount(false);
            setShowInvoice(false);
            toast.success('Recorded: Sales recorded successfully');
            setTimeout(() => setIsSubmitted(false), 500);
        } else {
            toast.error(`${response.error}`);
        }
        setIsLoading(false);


    };

    const getTotalSalesPrice = (items) =>
        items.reduce(
            (total, item) => total + parseFloat(item.sold_quantity || 0) * parseFloat(item.sales_price || 0),
            0
        );

    const handleChange = (field, value, index = null, item = null) => {
        setFormData((prev) => {
            let updatedData = { ...prev };

            if (index === null) {
                updatedData[field] = value;
            } else if (item) {
                const updatedItems = [...formData.sales_entries];
                updatedItems[index] = { ...updatedItems[index], [field]: value };
                updatedData.sales_entries = updatedItems;
            } else {
                const updatedEntries = [...prev.journal_entries];
                updatedEntries[index] = { ...updatedEntries[index], [field]: value };
                updatedData.journal_entries = updatedEntries;
            }

            const totalSalesPrice = getTotalSalesPrice(updatedData.sales_entries);

            const discount = findEntriesByType(updatedData.journal_entries, 'discount')[0];
            const discountAmount = parseFloat(discount?.entry?.amount) || 0;

            const paymentsTotal = updatedData.journal_entries
                .filter(entry => entry.type === 'payment')
                .reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);


            const updatedInvoiceAmount = totalSalesPrice - discountAmount - paymentsTotal;

            updatedData.journal_entries = updatedData.journal_entries.map((entry) => {
                if (entry.type === 'invoice') {
                    return { ...entry, amount: updatedInvoiceAmount >= 0 ? updatedInvoiceAmount : 0 };
                }
                if (entry.type === 'sales') {
                    return { ...entry, amount: totalSalesPrice >= 0 ? totalSalesPrice : 0 };
                }
                return entry;
            });

            return updatedData;
        });
    };



    useEffect(() => {
        getSelectOptions();

        if (serialNumbers?.sales) {
            setFormData((prev) => ({ ...prev, serial_number: serialNumbers.sales }));
        }
    }, [serialNumbers, orgId]);

   

    const addInvoice = () => {
        const updatedEntries = [...formData.journal_entries, { account: '', debit_credit: 'debit', amount: 0.0, type: 'invoice' }];

        handleChange('journal_entries', updatedEntries);
        setShowInvoice(true);
    }

    const addDiscount = () => {
        const updatedEntries = [...formData.journal_entries, { account: '', debit_credit: 'debit', amount: 0.0, type: 'discount' }];

        handleChange('journal_entries', updatedEntries);
        setShowDiscount(true);
    }

    useEffect(() => {

        scrollBottom(scrollRef);
    }, [formData.journal_entries, formData.sales_entries]);



    return (
        <div className="flex flex-col items-start justify-start h-full gap-2 w-full text-gray-800">
                        <SubHeader customer={true} item={true} account={true}/>

            <div ref={scrollRef} className="flex flex-col font-medium gap-2 w-full">
                <FormHeader header="Record Sales" />
                <form className="flex flex-col gap-2" onSubmit={handleSubmit}>

                <div className="flex gap-4 flex-col lg:flex-row">
                        <div className="lg:w-[50%] w-full flex flex-col gap-2 shadow-md rounded-md p-2">
                            <span className='font-semibold text-xl'>Sales No: {serialNumbers.sales}</span>

                            <FormInitialField formData={formData} handleChange={handleChange} />
                            <div className='w-full flex flex-row gap-2 items-center justify-center'>
                                <div className='w-[40%]'>
                                    <PurchaseSalesAccountField
                                        values={formData?.journal_entries}
                                        handleChange={handleChange}
                                        isSubmitted={isSubmitted}
                                        header="Sales Account"
                                        type='sales'
                                        accounts={salesAccounts}
                                    />
                                </div>

                                <div className='w-[60%]'>
                                    {showDiscount ? <DiscountAccountField
                                        formData={formData}
                                        isSubmitted={isSubmitted}
                                        handleChange={handleChange}
                                        header="Discount"
                                        accounts={expenseDiscountAccounts}
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
                                type="debit"
                                values={formData?.journal_entries}
                                handleChange={handleChange}
                                header="Sales Payment Accounts"
                                accounts={paymentAccounts}
                            />



                            {showInvoice ? <BillInvoiceAccountField
                                formData={formData}
                                handleChange={handleChange}
                                header="Invoice"
                                type='invoice'
                                isSubmitted={isSubmitted}
                                accounts={customersAccounts}
                                setShowBill={setShowInvoice}
                            /> : <Button
                                type="dashed"
                                className='w-[30%]'
                                onClick={addInvoice}
                            >
                                <FaPlus /> Add Invoice
                            </Button>}
                        </div>
                    </div>
                    <SalesEntriesFields stocks={stocks} isSubmitted={isSubmitted} formData={formData} handleChange={handleChange} />

                    <Button type="primary" className='w-[30%] self-center' htmlType="submit" disabled={isLoading}>
                        {isLoading ? <Spin /> : 'Record'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RecordSales;

