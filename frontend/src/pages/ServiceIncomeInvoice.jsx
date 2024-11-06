import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'antd';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { getItems, getSerialNumber, postRequest, scrollBottom } from '../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../components/forms/FormHeader';
import FormInitialField from '../components/forms/FormInitialField';
import AccountsField from '../components/forms/AccountsField';
import ServiceIncomeEntriesField from '../components/forms/ServiceIncomeEntriesField';
import DiscountContainer from '../components/forms/DiscountContainer';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../context/SelectOptionsContext';
import InvoiceContainer from '../components/forms/InvoiceContainer';


const validationSchema = Yup.object({
  date: Yup.date().required('Date is required'),
  description: Yup.string().required('Description is required'),
  service_income_entries: Yup.array()
    .of(
      Yup.object().shape({
        service: Yup.string().required('Service is required'),
        quantity: Yup.number()
          .required('Quantity is required')
          .min(0, 'Quantity must be positive'),
        price: Yup.number()
          .required('Price is required')
          .min(0, 'Price must be positive')
      })
    )
    .min(1, 'At least one service income entry is required'),
    
    invoice: Yup.object({
        due_date: Yup.date().required('Due date is required'),
        customer: Yup.string().required('Customer is required'),
        amount_due: Yup.number().required('Amount due is required').min(0, 'Amount due must be positive')
      }).required('Invoice info is required'),
    discount_allowed: Yup.object({
      discount_amount: Yup.number().required('Discount amount is required')
          .min(0, 'Amount must be positive'),
      discount_percentage: Yup.number().required('Discount percentage is required')
          .min(0, 'Amount must be positive')
  }).nullable()
});

const ServiceIncomeInvoice = () => {
  const scrollRef = useRef(null);
  const { orgId } = useParams();
  const { serialNumbers, paymentAccounts, services, getSelectOptions, customers } = useSelectOptions();

  const getTotalServiceIncomePrice = (items) => {
    if (items) {
      const serviceIncomePrice = items.reduce(
        (total, item) => total + (parseFloat(item.quantity) * parseFloat(item.price)),
        0
      );
      return serviceIncomePrice;
    }
    return 0;
  };


  return (
    <div className='flex-1 flex flex-col items-center justify-center'>


      <Formik
        initialValues={{
          date: null,
          description: '',
          serial_number: serialNumbers.service_income,
          service_income_entries: [
            { service: null, quantity: 1, price: 0.0 }
          ],
          invoice: {
            amount_due: 0.00,
            due_date: null,
            customer: null,
            serial_number: serialNumbers.invoice
          },
          discount_allowed: {
            discount_amount: 0.00,
            discount_percentage: 0,
        }
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
            const totalAmountDue = values.invoice.amount_due;

          const serviceIncomePrice = getTotalServiceIncomePrice(values.service_income_entries) - values.discount_allowed.discount_amount;
          
          if (serviceIncomePrice === totalAmountDue) {
            const response = await postRequest(values, `${orgId}/invoices/service_income`, resetForm);

            if (response.success) {
              toast.success('Recorded: Service Income recorded successfully')
              getSelectOptions()
            } else {
              toast.error(`Error: ${response.error}`)
            }
          } else {
            let description = 'Amount to be received  and discount must be equal total service income price';
            toast.error(`Validation Error: ${description}`)

          }
        }}
      >
        {({ values, setFieldValue, handleChange, handleSubmit }) => {
          const serviceIncomeTotal = useMemo(() => getTotalServiceIncomePrice(values.service_income_entries) || 0.00, [values.service_income_entries]);
          useEffect(() => {
            if (!values.service_income_entries.length) return;

            const serviceIncomePrice = serviceIncomeTotal - values.discount_allowed.discount_amount;
            
            setFieldValue('invoice.amount_due', serviceIncomePrice);
          }, [values.discount_allowed, serviceIncomeTotal]);
          useEffect(() => {
            scrollBottom(scrollRef);
          }, [serviceIncomeTotal, values.service_income_entries])
          useEffect(() => {
            setFieldValue('serial_number', serialNumbers.service_income)

          }, [serialNumbers])

          return (
            <div ref={scrollRef} className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'>
              <FormHeader header='Record service income invoice' />

              <Form
                className='flex-1 flex flex-col w-full h-full gap-2'
                onFinish={handleSubmit}
              >
                <div className='flex flex-row justify-between text-gray-800 mr-2'>
                <span>Invoice No : {serialNumbers.invoice}</span><span>Service Income No : {serialNumbers.service_income}</span>
                            </div>
                <div className='flex flex-row gap-2 w-full'>
                  <div className='flex flex-col gap-2 w-[50%]'>
                    <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue}/>
                  </div>
                  <InvoiceContainer setFieldValue={setFieldValue} customers={customers} values={values.invoice}/>

                  
                </div>
                <ServiceIncomeEntriesField values={values} setFieldValue={setFieldValue} services={services} />
                <DiscountContainer values={values.discount_allowed} setFieldValue={setFieldValue} type='discount_allowed' totalPrice={serviceIncomeTotal} />
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

export default ServiceIncomeInvoice;
