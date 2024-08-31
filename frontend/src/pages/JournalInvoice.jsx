import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Form, Button } from 'antd';
import axios from 'axios';
import { getItems, postRequest, scrollBottom } from '../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../components/forms/FormHeader';
import FormInitialField from '../components/forms/FormInitialField';
import JournalEntries from '../components/forms/JournalEntries';
import InvoiceContainer from '../components/forms/InvoiceContainer';
import AccountsField from '../components/forms/AccountsField';
import BillInvoiceAccountsFields from '../components/forms/BillInvoiceAccountsFields';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

const validationSchema = Yup.object({
    date: Yup.date().required('Date is required'),
    description: Yup.string().required('Description is required'),
    journal_entries: Yup.array()
        .of(
            Yup.object().shape({
                account: Yup.string().required('Account is required'),
                debit_credit: Yup.string().required('Debit/Credit is required'),
                amount: Yup.number()
                    .required('Amount is required')
                    .min(0, 'Amount must be positive'),
            })
        )
        .min(1, 'At least one journal entries are required'),
    invoice: Yup.object({
        due_date: Yup.date().required('Due date is required'),
        customer: Yup.string().required('Customer is required'),
        amount_due: Yup.number().required('Amount due is required').min(0, 'Amount due must be positive')
    }).required('Invoice info is required'),
});

const JournalInvoice = () => {
    const [accounts, setAccounts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const scrollRef = useRef(null);


    useEffect(() => {
        const getData = async () => {
            const newAccounts = await getItems('accounts', '?group=income');
            const newCustomers = await getItems('customers')
            setAccounts(newAccounts);
            setCustomers(newCustomers);
        }
        getData()

    }, []);

    
    const getEntriesTotalAmount = (values) => {
        return values.journal_entries.reduce((sum, entry) => {
            return entry.debit_credit === 'credit' ? sum + parseFloat(entry.amount || 0) : sum;
        }, 0);

    }
 
    return (
        <div className='flex-1 flex flex-col items-center justify-center'>
            <Formik
                initialValues={{
                    date: null,
                    description: '',
                    journal_entries: [
                        { account: null, debit_credit: 'credit', amount: 0.0 },
                    ],
                    invoice: {
                        amount_due: 0.00,
                        due_date: null,
                        customer: null
                    }
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                    const totalAmountDue = values.invoice.amount_due;
                    const totalEntriesAmount = getEntriesTotalAmount(values);
                    if (totalEntriesAmount === totalAmountDue) {
                        const response = await postRequest(values, 'invoices/journals', resetForm)
                        if (response.success) {
                            toast.success('Recorded: Journal invoice recorded successfully')
                        } else {
                            toast.error(`Error: ${response.error}`)
                        }
                    } else {
                        let description = 'The invoice accounts total amount must equal amount due';
                        toast.error(`Validation Error: ${description}`)
                    }
                }}
            >
                {({ values, setFieldValue, handleChange, handleSubmit }) => {
                    useEffect(() => {
                        const totalAmountDue = getEntriesTotalAmount(values);
                        setFieldValue('invoice.amount_due', totalAmountDue);
                        scrollBottom(scrollRef);
                    }, [values.journal_entries]);

                    return (
                        <div
                            ref={scrollRef}
                            className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'
                        >

                            <FormHeader header='Record journal invoice' />
                            <Form
                                className='flex-1 flex flex-col w-full h-full gap-2'
                                onFinish={handleSubmit}
                            >
                                <div className='flex flex-row gap-2 w-full'>
                                    <div className='flex flex-col gap-2 w-[50%]'>
                                        <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue} />
                                    </div>
                                    <InvoiceContainer values={values.invoice} setFieldValue={setFieldValue} customers={customers} />
                                </div>

                                <BillInvoiceAccountsFields type='credit' values={values} setFieldValue={setFieldValue} header={'Accounts to invoice'} accounts={accounts}/>

                                <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                                    Record
                                </Button>

                            </Form></div>
                    );
                }}
            </Formik>
        </div>
    );
};

export default JournalInvoice;
