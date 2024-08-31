import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {  Form, Button} from 'antd';
import axios from 'axios';
import { getItems, postRequest, scrollBottom } from '../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../components/forms/FormHeader';
import FormInitialField from '../components/forms/FormInitialField';
import JournalEntries from '../components/forms/JournalEntries';

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
    .min(2, 'At least two journal entries are required'),
});

const RecordJournal = () => {
  const [accounts, setAccounts] = useState([]);
  const [debitCreditDiff, setDebitCreditDiff] = useState(0);
  const scrollRef = useRef(null);


  useEffect(() => {
    const getData = async () => {
      const newAccounts = await getItems('accounts');
      
      setAccounts(newAccounts);
  }
  getData()


  }, []);

  const getDebitCreditDiff = (entries) => {
    const totalDebitAmount = entries.reduce((sum, entry) => {
      return entry.debit_credit === 'debit' ? sum + parseFloat(entry.amount || 0) : sum;
    }, 0);

    const totalCreditAmount = entries.reduce((sum, entry) => {
      return entry.debit_credit === 'credit' ? sum + parseFloat(entry.amount || 0) : sum;
    }, 0);

    setDebitCreditDiff(totalDebitAmount - totalCreditAmount);
  };
  
  return (
    <div className='flex-1 flex flex-col items-center justify-center'>
      <Formik
        initialValues={{
          date: null,
          description: '',
          journal_entries: [
            { account: null, debit_credit: null, amount: 0.0 },
            { account: null, debit_credit: null, amount: 0.0 },
          ],
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          const totalDebitAmount = values.journal_entries.reduce((sum, entry) => {
            return entry.debit_credit === 'debit' ? sum + parseFloat(entry.amount || 0) : sum;
          }, 0);

          const totalCreditAmount = values.journal_entries.reduce((sum, entry) => {
            return entry.debit_credit === 'credit' ? sum + parseFloat(entry.amount || 0) : sum;
          }, 0);

          if (totalDebitAmount === totalCreditAmount) {
            const response = await postRequest(values, 'journals', resetForm)
            if (response.success) {
              toast.success('Recorded: Journal recorded successfully')
            } else {
              toast.error(`Error: ${response.error}`)
            }
          } else {
            let description = 'Debit and credit amounts need to be equal';
            toast.error(`Validation Error: ${description}`)
          }
        }}
      >
        {({ values, setFieldValue, handleChange, handleSubmit }) => {
          useEffect(() => {
            getDebitCreditDiff(values.journal_entries);
            scrollBottom(scrollRef);

          }, [values.journal_entries]);

          return (
            <div
              ref={scrollRef}
              className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'
            >

              <FormHeader header='Record journal'/>
              <Form
                className='flex-1 flex flex-col w-full h-full gap-2'
                onFinish={handleSubmit}
              >
                <div className='w-[80%]'>
                <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue}/>

                </div>

               <JournalEntries values={values} setFieldValue={setFieldValue} accounts={accounts} debitCreditDiff={debitCreditDiff}/>

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

export default RecordJournal;
