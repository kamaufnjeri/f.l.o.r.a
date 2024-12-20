import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spin } from 'antd';
import { findEntriesByType, getItems, patchRequest, postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../../components/forms/FormHeader';
import FormInitialField from '../../components/forms/FormInitialField';
import PurchaseSalesAccountField from '../../components/forms/PurchaseSalesAccountField';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import { FaPlus } from 'react-icons/fa';
import AccountsField from '../../components/forms/AccountsField';
import BillInvoiceAccountField from '../../components/forms/BillInvoiceAccountField';
import DiscountAccountField from '../../components/forms/DiscountAccountField';
import ServiceIncomeEntriesFields from '../../components/forms/ServiceIncomeEntriesFields';


const UpdateServiceIncome = () => {
    const scrollRef = useRef(null);
    const { orgId, id } = useParams();
    const { services, serialNumbers, paymentAccounts, serviceIncomeAccounts, expenseDiscountAccounts, getSelectOptions, customersAccounts } = useSelectOptions();
    const [showInvoice, setShowInvoice] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [showServiceIncome, setShowServiceIncome] = useState(false);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const getData = async () => {
        setIsLoading(true);
        const serviceIncome = await getItems(`${orgId}/service_income/${id}`);
        if (!serviceIncome) {
            setIsLoading(false);
            return;
        }
        const invoice = serviceIncome.invoice;
        setFormData(serviceIncome);
        setFormData((prev) => ({
            ...prev,
            due_date: invoice?.due_date || null,
        }));


        if (Array.isArray(serviceIncome.journal_entries)) {
            serviceIncome.journal_entries.forEach((entry) => {
                if (entry.type === 'discount') setShowDiscount(true);
                if (entry.type === 'invoice') setShowInvoice(true);
                if (entry.type === 'service_income') setShowServiceIncome(true);
            });
        }

        setIsLoading(false);


    };

    useEffect(() => {

        getData();
    }, [orgId, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await patchRequest(formData, `${orgId}/service_income/${id}`);
        if (response.success) {
            setIsSubmitted(true);
            getSelectOptions();
            const invoice = response.data.invoice;
            setFormData(response.data);
            setFormData((prev) => ({
                ...prev,
                due_date: invoice?.due_date || null,
            }));

            toast.success('Updated: Service Income edited successfully');
            setTimeout(() => setIsSubmitted(false), 500);
        } else {
            toast.error(`${response.error}`);
            getData();
        }
        setIsLoading(false);


    };


    const getTotalServiceIncomePrice = (items) =>
        items.reduce(
            (total, item) => total + parseFloat(item.quantity || 0) * parseFloat(item.price || 0),
            0
        );

    const handleChange = (field, value, index = null, item = null) => {
        setFormData((prev) => {
            let updatedData = { ...prev };

            if (index === null) {
                updatedData[field] = value;
            } else if (item) {
                const updatedItems = [...formData.service_income_entries];
                updatedItems[index] = { ...updatedItems[index], [field]: value };
                updatedData.service_income_entries = updatedItems;
            } else {
                const updatedEntries = [...prev.journal_entries];
                updatedEntries[index] = { ...updatedEntries[index], [field]: value };
                updatedData.journal_entries = updatedEntries;
            }

            const totalServiceIncomePrice = getTotalServiceIncomePrice(updatedData.service_income_entries);

            const discount = findEntriesByType(updatedData.journal_entries, 'discount')[0];
            const discountAmount = parseFloat(discount?.entry?.amount) || 0;

            const paymentsTotal = updatedData.journal_entries
                .filter(entry => entry.type === 'payment')
                .reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);


            const updatedInvoiceAmount = totalServiceIncomePrice - discountAmount - paymentsTotal;

            updatedData.journal_entries = updatedData.journal_entries.map((entry) => {
                if (entry.type === 'invoice') {
                    return { ...entry, amount: updatedInvoiceAmount >= 0 ? updatedInvoiceAmount : 0 };
                }
                if (entry.type === 'service_income') {
                    return { ...entry, amount: totalServiceIncomePrice >= 0 ? totalServiceIncomePrice : 0 };
                }
                return entry;
            });

            return updatedData;
        });
    };



    useEffect(() => {
        scrollBottom(scrollRef);
    }, [formData.journal_entries, formData.service_income_entries]);




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
                <FormHeader header="Record Service Income" />
                <form className="flex flex-col gap-2" onSubmit={handleSubmit}>

                    <div className="flex gap-4">
                        <div className="w-[50%] flex flex-col gap-2">
                            <span>Service Income No: {serialNumbers.service_income}</span>

                            <FormInitialField formData={formData} handleChange={handleChange} />
                            <div className='w-full flex flex-row gap-2'>
                                <div className='w-[40%]'>
                                    {showServiceIncome && <PurchaseSalesAccountField
                                        values={formData?.journal_entries}
                                        handleChange={handleChange}
                                        isSubmitted={isSubmitted}
                                        header="Service Income Account"
                                        type='service_income'
                                        accounts={serviceIncomeAccounts}
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
                            <AccountsField
                                formData={formData}
                                isSubmitted={isSubmitted}
                                type="debit"
                                values={formData?.journal_entries}
                                handleChange={handleChange}
                                header="Service Income Payment Accounts"
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
                    <ServiceIncomeEntriesFields services={services} isSubmitted={isSubmitted} formData={formData} handleChange={handleChange} />

                    <Button type="primary" className='w-[30%] self-center' htmlType="submit" disabled={isLoading}>
                        {isLoading ? <Spin /> : 'Record'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default UpdateServiceIncome;

