import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Form } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { getItems, getSerialNumber, postRequest, scrollBottom } from '../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../components/forms/FormHeader';
import FormInitialField from '../components/forms/FormInitialField';
import AccountsField from '../components/forms/AccountsField';
import PurchaseEntriesFields from '../components/forms/PurchaseEntriesFields';
import DiscountContainer from '../components/forms/DiscountContainer';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../context/SelectOptionsContext';

const validationSchema = Yup.object({
    date: Yup.date().required('Date is required'),
    description: Yup.string().required('Description is required'),
    purchase_entries: Yup.array()
        .of(
            Yup.object().shape({
                stock: Yup.string().required('Stock item is required'),
                purchased_quantity: Yup.number()
                    .required('Quantity is required')
                    .min(0, 'Quantity must be positive'),
                purchase_price: Yup.number()
                    .required('Purchase price is required')
                    .min(0, 'Purchase price must be positive')
            })
        )
        .min(1, 'At least one purchase entry are required'),
    journal_entries: Yup.array()
        .of(
            Yup.object().shape({
                account: Yup.string().required('Account is required'),
                amount: Yup.number().required('Amount is required')
                    .min(0, 'Amount must be positive'),
                debit_credit: Yup.string().required('Debit/Credit is required')
            })
        ).min(1, 'At least one journal entry are required'),
    discount_received: Yup.object({
        discount_amount: Yup.number().required('Discount amount is required')
            .min(0, 'Amount must be positive'),
        discount_percentage: Yup.number().required('Discount percentage is required')
            .min(0, 'Amount must be positive')
    }).nullable()
});

const RecordPurchase = () => {
    const [accounts, setAccounts] = useState([]);
    const scrollRef = useRef(null);
    const { orgId } = useParams();
    const { stocks, serialNumbers, paymentAccounts, getSelectOptions } = useSelectOptions();

    const getTotalPurchasePrice = (items) => {
        if (items) {
            const purchasePriceTotal = items.reduce(
                (total, item) => total + (parseFloat(item.purchased_quantity) * parseFloat(item.purchase_price)),
                0
            );
            return purchasePriceTotal;
        }
        return 0;
    };


    return (
        <div className='flex-1 flex flex-col items-center justify-center'>

            <Formik
                initialValues={{
                    date: null,
                    description: '',
                    serial_number: serialNumbers.purchase,
                    purchase_entries: [
                        { stock: null, purchased_quantity: 0, purchase_price: 0.0 }
                    ],
                    journal_entries: [
                        { account: null, debit_credit: 'credit', amount: 0.0 }
                    ],
                    discount_received: {
                        discount_amount: 0.00,
                        discount_percentage: 0,
                    }
                }}
                validationSchema={validationSchema}
                
                onSubmit={async (values, { resetForm }) => {
                    console.log(values)
                    const creditTotalAmount = values.journal_entries.reduce((sum, entry) => {
                        return sum + parseFloat(entry.amount || 0);
                    }, 0);
                    const purchasePriceTotal = getTotalPurchasePrice(values.purchase_entries) - values.discount_received.discount_amount;
                    if (purchasePriceTotal === creditTotalAmount) {
                        const response = await postRequest(values, `${orgId}/purchases`, resetForm)
                        if (response.success) {
                            toast.success('Recorded: Purchase recorded successfully')
                            getSelectOptions();
                        } else {
                            toast.error(`Error: ${response.error}`)
                        }
                    } else {
                        let description = 'Amount to be paid and discount must be equal to total purchase price'
                        toast.error(`Validation Error: ${description}`)
                    }
                }}
            >
                {({ values, setFieldValue, handleChange, handleSubmit }) => {
                    const purchasePriceTotal = useMemo(() => getTotalPurchasePrice(values.purchase_entries) || 0.00, [values.purchase_entries]);
                    useEffect(() => {
                        if (!values.journal_entries.length) return;
                        const purchasePrice = purchasePriceTotal - values.discount_received.discount_amount;
                        const updatedJournalEntries = values.journal_entries.map(entry => ({
                            ...entry,
                            amount: purchasePrice / values.journal_entries.length,
                        }));

                        setFieldValue('journal_entries', updatedJournalEntries);

                    }, [purchasePriceTotal, values.discount_received]);


                    useEffect(() => {
                        scrollBottom(scrollRef);
                    }, [values.journal_entries, values.purchase_entries])

                    useEffect(() => {
                        setFieldValue('serial_number', serialNumbers.purchase);
                    }, [serialNumbers])
                    return (<div ref={scrollRef} className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'>
                        <FormHeader header='Record Purchase' />

                        <Form
                            className='flex-1 flex flex-col w-full h-full gap-2'
                            onFinish={handleSubmit}
                        >
                            <div className='flex flex-row justify-between text-gray-800 mr-2'>
                                <span>Purchase No : {serialNumbers.purchase}</span>
                            </div>
                            <div className='flex flex-row gap-2 w-full'>
                                <div className='flex flex-col gap-2 w-[50%]'>
                                    <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue} />
                                </div>
                                <div className='w-[50%]'>
                                    <AccountsField type='credit' values={values} setFieldValue={setFieldValue} header={'Purchase Payment Accounts'} accounts={paymentAccounts} />

                                </div>

                            </div>
                            <PurchaseEntriesFields values={values} setFieldValue={setFieldValue} stocks={stocks} />
                            <DiscountContainer values={values.discount_received} setFieldValue={setFieldValue} type='discount_received' totalPrice={purchasePriceTotal} />
                            <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                                Record
                            </Button>
                        </Form>
                    </div>)
                }}
            </Formik>
        </div>
    )
}

export default RecordPurchase
