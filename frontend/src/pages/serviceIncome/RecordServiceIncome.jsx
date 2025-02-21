import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spin } from 'antd';
import { findEntriesByType, postRequest, scrollBottom } from '../../lib/helpers';
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
import SubHeader from '../../components/shared/SubHeader';


const RecordServiceIncome = () => {
    const { mainContainerRef}  = useSelectOptions();
    const { orgId } = useParams();
    const { services, serialNumbers, paymentAccounts, serviceIncomeAccounts, expenseDiscountAccounts, getSelectOptions, customersAccounts } = useSelectOptions();
    const [showInvoice, setShowInvoice] = useState(false);
    const [showDiscount, setShowDiscount] = useState(false);
    const [formData, setFormData] = useState({
        date: null,
        description: '',
        due_date: null,
        serial_number: '',
        service_income_entries: [{ service: null, quantity: 1, price: 0.0 }],
        journal_entries: [
            { account: null, debit_credit: 'credit', amount: 0.0, type: 'service_income' },
        ],
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await postRequest(formData, `${orgId}/service_income`);
        if (response.success) {
            setIsSubmitted(true);

            getSelectOptions();

            setFormData({
                date: null,
                description: '',
                due_date: null,
                serial_number: serialNumbers?.service_income || '',
                service_income_entries: [{ service: null, quantity: 1, price: 0.0 }],
                journal_entries: [
                    { account: null, debit_credit: 'credit', amount: 0.0, type: 'service_income' },
                ],
            });
            setShowDiscount(false);
            setShowInvoice(false);
            toast.success('Recorded: Service income recorded successfully');
            setTimeout(() => setIsSubmitted(false), 500);
        } else {
            toast.error(`${response.error}`);
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
        getSelectOptions();

        if (serialNumbers?.service_income) {
            setFormData((prev) => ({ ...prev, serial_number: serialNumbers.service_income }));
        }
    }, [serialNumbers, orgId]);

    useEffect(() => {

        scrollBottom(mainContainerRef);
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
        <div className="flex flex-col items-start justify-start h-full gap-2 w-full text-gray-800">
            <SubHeader customer={true} service={true} account={true} />
            <div className="flex flex-col font-medium gap-2 w-full">
                <FormHeader header="Record Service Income" />
                <form className="flex flex-col gap-2" onSubmit={handleSubmit}>

                <div className="flex gap-4 flex-col lg:flex-row">
                        <div className="lg:w-[50%] w-full flex flex-col gap-2 shadow-md rounded-md p-2">
                            <span className='font-semibold text-xl'>Service Income No: {serialNumbers.service_income}</span>

                            <FormInitialField formData={formData} handleChange={handleChange} />
                            <div className='w-full flex flex-row gap-2 items-center justify-center'>
                                <div className='w-[40%]'>
                                    <PurchaseSalesAccountField
                                        values={formData?.journal_entries}
                                        handleChange={handleChange}
                                        isSubmitted={isSubmitted}
                                        header="Service Income Account"
                                        type='service_income'
                                        accounts={serviceIncomeAccounts}
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

export default RecordServiceIncome;

