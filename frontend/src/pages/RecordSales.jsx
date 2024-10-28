import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'antd';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { getItems, getSerialNumber, postRequest, scrollBottom } from '../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../components/forms/FormHeader';
import FormInitialField from '../components/forms/FormInitialField';
import AccountsField from '../components/forms/AccountsField';
import SalesEntriesField from '../components/forms/SalesEntriesField';
import DiscountContainer from '../components/forms/DiscountContainer';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../context/SelectOptionsContext';


const validationSchema = Yup.object({
  date: Yup.date().required('Date is required'),
  description: Yup.string().required('Description is required'),
  sales_entries: Yup.array()
    .of(
      Yup.object().shape({
        stock: Yup.string().required('Stock item is required'),
        sold_quantity: Yup.number()
          .required('Quantity is required')
          .min(0, 'Quantity must be positive'),
        sales_price: Yup.number()
          .required('Sales price is required')
          .min(0, 'Sales price must be positive')
      })
    )
    .min(1, 'At least one sales entry is required'),
  journal_entries: Yup.array()
    .of(
      Yup.object().shape({
        account: Yup.string().required('Account is required'),
        amount: Yup.number()
          .required('Amount is required')
          .min(0, 'Amount must be positive'),
        debit_credit: Yup.string().required('Debit/Credit is required')
      })
    ).min(1, 'At least one journal entry is required'),
    discount_allowed: Yup.object({
      discount_amount: Yup.number().required('Discount amount is required')
          .min(0, 'Amount must be positive'),
      discount_percentage: Yup.number().required('Discount percentage is required')
          .min(0, 'Amount must be positive')
  }).nullable()
});

const RecordSales = () => {
  const scrollRef = useRef(null);
  const { orgId } = useParams();
  const { serialNumbers, paymentAccounts, stocks, getSelectOptions } = useSelectOptions();

  const getTotalSalesPrice = (items) => {
    if (items) {
      const salesPriceTotal = items.reduce(
        (total, item) => total + (parseFloat(item.sold_quantity) * parseFloat(item.sales_price)),
        0
      );
      return salesPriceTotal;
    }
    return 0;
  };


  return (
    <div className='flex-1 flex flex-col items-center justify-center'>


      <Formik
        initialValues={{
          date: null,
          description: '',
          serial_number: serialNumbers.sales,
          sales_entries: [
            { stock: null, sold_quantity: 0, sales_price: 0.0 }
          ],
          journal_entries: [
            { account: null, debit_credit: 'debit', amount: 0.0 }
          ],
          discount_allowed: {
            discount_amount: 0.00,
            discount_percentage: 0,
        }
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          console.log(values)
          const debitTotalAmount = values.journal_entries.reduce((sum, entry) => {
            return sum + parseFloat(entry.amount || 0);
          }, 0);
          const salesPriceTotal = getTotalSalesPrice(values.sales_entries) - values.discount_allowed.discount_amount;
          
          if (salesPriceTotal === debitTotalAmount) {
            const response = await postRequest(values, `${orgId}/sales`, resetForm);

            if (response.success) {
              toast.success('Recorded: Sales recorded successfully')
              getSelectOptions()
            } else {
              toast.error(`Error: ${response.error}`)
            }
          } else {
            let description = 'Amount to be received  and discount must be equal total sales price';
            toast.error(`Validation Error: ${description}`)

          }
        }}
      >
        {({ values, setFieldValue, handleChange, handleSubmit }) => {
          const salesPriceTotal = useMemo(() => getTotalSalesPrice(values.sales_entries) || 0.00, [values.sales_entries]);
          useEffect(() => {
            if (!values.journal_entries.length) return;

            const salesPrice = salesPriceTotal - values.discount_allowed.discount_amount;
            const updatedJournalEntries = values.journal_entries.map(entry => ({
              ...entry,
              amount: (salesPrice / values.journal_entries.length)
            }));
            setFieldValue('journal_entries', updatedJournalEntries);
          }, [values.discount_allowed, salesPriceTotal]);
          useEffect(() => {
            scrollBottom(scrollRef);
          }, [salesPriceTotal, values.sales_entries])
          useEffect(() => {
            setFieldValue('serial_number', serialNumbers.sales)

          }, [serialNumbers])

          return (
            <div ref={scrollRef} className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'>
              <FormHeader header='Record sales' />

              <Form
                className='flex-1 flex flex-col w-full h-full gap-2'
                onFinish={handleSubmit}
              >
                <div className='flex flex-row justify-between text-gray-800 mr-2'>
                                <span>Sales No : {serialNumbers.sales}</span>
                            </div>
                <div className='flex flex-row gap-2 w-full'>
                  <div className='flex flex-col gap-2 w-[50%]'>
                    <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue}/>
                  </div>
                  <div className="w-[50%]">
                  <AccountsField type='debit' values={values} setFieldValue={setFieldValue} header={'Sales Receipt Accounts'} accounts={paymentAccounts}/>
                  </div>
                </div>
                <SalesEntriesField values={values} setFieldValue={setFieldValue} stocks={stocks} />
                <DiscountContainer values={values.discount_allowed} setFieldValue={setFieldValue} type='discount_allowed' totalPrice={salesPriceTotal} />
                <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                    Record
                  </Button>
              </Form>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};

export default RecordSales;
