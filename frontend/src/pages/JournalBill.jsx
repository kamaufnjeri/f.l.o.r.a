import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Form, Button } from 'antd';
import axios from 'axios';
import { getItems, getSerialNumber, postRequest, scrollBottom } from '../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../components/forms/FormHeader';
import FormInitialField from '../components/forms/FormInitialField';
import BillContainer from '../components/forms/BillContainer';
import BillInvoiceAccountsFields from '../components/forms/BillInvoiceAccountsFields';


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
    bill: Yup.object({
        due_date: Yup.date().required('Due date is required'),
        supplier: Yup.string().required('Supplier is required'),
        amount_due: Yup.number().required('Amount due is required').min(0, 'Amount due must be positive')
    }).required('Bill info is required'),
});

const JournalBill = () => {
    const [accounts, setAccounts] = useState([]);
    const scrollRef = useRef(null);
    const [suppliers, setSuppliers] = useState([]);
    const [billNo, setBillNo] = useState('');
    const [journalNo, setJounalNo] = useState('');

    const getData = async () => {
        const newAccounts = await getItems('accounts', '?group=expense');
        const newSuppliers = await getItems('suppliers');
        
        const billNo = await getSerialNumber('BILL')
        const journalNo = await getSerialNumber('JOURN')
        setBillNo(billNo)
        setJounalNo(journalNo)
        setAccounts(newAccounts);
        setSuppliers(newSuppliers);
    }
    useEffect(() => {
       
        getData()

    }, []);

   
    const getEntriesTotalAmount = (values) => {
        return values.journal_entries.reduce((sum, entry) => {
            return entry.debit_credit === 'debit' ? sum + parseFloat(entry.amount || 0) : sum;
        }, 0);

    }
    
    return (
        <div className='flex-1 flex flex-col items-center justify-center'>
            <Formik
                initialValues={{
                    date: null,
                    description: '',
                    serial_number: journalNo,
                    journal_entries: [
                        { account: null, debit_credit: 'debit', amount: 0.0 },
                    ],
                    bill: {
                        amount_due: 0.00,
                        due_date: null,
                        customer: null,
                        serial_number: billNo
                    }
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                    const totalAmountDue = values.bill.amount_due;
                    const totalEntriesAmount = getEntriesTotalAmount(values);
                    

                    if (totalEntriesAmount === totalAmountDue) {
                        const response = await postRequest(values, 'bills/journals', resetForm)
                        if (response.success) {
                            toast.success('Recorded: Journal bill recorded successfully')
                            getData()
                        } else {
                            toast.error(`Error: ${response.error}`)
                        }
                    } else {
                        let description = 'The bill accounts total amount must equal amount due';
                        toast.error(`Validation Error: ${description}`)
                    }
                }}
            >
                {({ values, setFieldValue, handleChange, handleSubmit }) => {
                    useEffect(() => {
                        const totalEntriesAmount = getEntriesTotalAmount(values);
                        setFieldValue('bill.amount_due', totalEntriesAmount)
                        scrollBottom(scrollRef);

                    }, [values.journal_entries]);
                    useEffect(() => {
                        setFieldValue('serial_number', journalNo)
                    setFieldValue('bill.serial_number', billNo)
                    }, [journalNo, billNo])

                    return (
                        <div
                            ref={scrollRef}
                            className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'
                        >

                            <FormHeader header='Record journal bill' />
                            
                            <Form
                                className='flex-1 flex flex-col w-full h-full gap-2'
                                onFinish={handleSubmit}
                            >
                                <div className='flex flex-row justify-between text-gray-800 mr-2'>
                                <span>Bill No : {billNo}</span><span>Journal No : {journalNo}</span>
                            </div>
                                <div className='flex flex-row gap-2 w-full'>
                                    <div className='flex flex-col gap-2 w-[50%]'>
                                        <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue} />
                                    </div>
                                    <BillContainer values={values.bill} setFieldValue={setFieldValue} suppliers={suppliers} />
                                </div>

                                <BillInvoiceAccountsFields type='debit' values={values} setFieldValue={setFieldValue} header={'Accounts to bill Accounts'} accounts={accounts}/>
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

export default JournalBill;
