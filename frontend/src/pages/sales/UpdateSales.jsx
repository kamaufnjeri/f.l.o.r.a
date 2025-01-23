import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spin } from 'antd';
import { findEntriesByType, getItems, patchRequest, scrollBottom } from '../../lib/helpers';
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


const UpdateSales = () => {
    const scrollRef = useRef(null);
    const { orgId, id } = useParams();
    const { stocks, paymentAccounts, salesAccounts, getSelectOptions, customersAccounts, expenseDiscountAccounts } = useSelectOptions();
    const [showInvoice, setShowInvoice] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [showSales, setShowSales] = useState(false);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const getData = async () => {
        setIsLoading(true);
        const sales = await getItems(`${orgId}/sales/${id}`);
        if (!sales) {
            setIsLoading(false);
            return;
        }
        const invoice = sales.invoice;
        setFormData(sales);
        setFormData((prev) => ({
            ...prev,
            due_date: invoice?.due_date || null,
        }));


        if (Array.isArray(sales.journal_entries)) {
            sales.journal_entries.forEach((entry) => {
                if (entry.type === 'discount') setShowDiscount(true);
                if (entry.type === 'invoice') setShowInvoice(true);
                if (entry.type === 'sales') setShowSales(true);
            });
        }

        setIsLoading(false);


    }
    useEffect(() => {
        getSelectOptions();

        getData();
    }, [orgId, id]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await patchRequest(formData, `${orgId}/sales/${id}`);
        if (response.success) {
            setIsSubmitted(true);
            getSelectOptions();
            const invoice = response.data.invoice;
            setFormData(response.data);
            setFormData((prev) => ({
                ...prev,
                due_date: invoice?.due_date || null,
            }));

            toast.success('Updated: Sales edited successfully');
            setTimeout(() => setIsSubmitted(false), 500);
        } else {
            toast.error(`${response.error}`);
            getData();
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

        scrollBottom(scrollRef);
    }, [formData.journal_entries, formData.sales_entries]);



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


    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <div ref={scrollRef} className="flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] min-h-[80vh] overflow-y-auto custom-scrollbar">
                <FormHeader header="Update Sales" />
                <form className="flex flex-col gap-2" onSubmit={handleSubmit}>

                    <div className="flex gap-4">
                        <div className="w-[50%] flex flex-col gap-2">
                            <span>Sales No: {formData.serial_number}</span>

                            <FormInitialField formData={formData} handleChange={handleChange} />
                            <div className='w-full flex flex-row gap-2'>
                                <div className='w-[40%]'>
                                    {showSales && <PurchaseSalesAccountField
                                        values={formData?.journal_entries}
                                        handleChange={handleChange}
                                        isSubmitted={isSubmitted}
                                        header="Sales Account"
                                        type={"sales"}
                                        accounts={salesAccounts}
                                    />}
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
                        <div className="w-[50%] flex flex-col gap-2">
                            {<AccountsField
                                formData={formData}
                                isSubmitted={isSubmitted}
                                type="debit"
                                values={formData?.journal_entries}
                                handleChange={handleChange}
                                header="Sales Payment Accounts"
                                accounts={paymentAccounts}
                            />}



                            {showInvoice ? <BillInvoiceAccountField
                                formData={formData}
                                handleChange={handleChange}
                                header="Invoice"
                                isSubmitted={isSubmitted}
                                accounts={customersAccounts}
                                type="invoice"
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
                        {isLoading ? <Spin /> : 'Edit'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default UpdateSales;

