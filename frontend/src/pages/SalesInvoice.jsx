import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'antd';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { getItems, getSerialNumber, postRequest, scrollBottom } from '../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../components/forms/FormHeader';
import FormInitialField from '../components/forms/FormInitialField';
import SalesEntriesField from '../components/forms/SalesEntriesField';
import DiscountContainer from '../components/forms/DiscountContainer';
import InvoiceContainer from '../components/forms/InvoiceContainer';
import { useParams } from 'react-router-dom';

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
const SalesInvoice = () => {
    const [stocks, setStocks] = useState([]);
    const [customers, setCustomers] = useState([]);
    const scrollRef = useRef(null);
    const [invoiceNo, setInvoiceNo] = useState('')
    const [salesNo, setSalesNo] = useState('')
    const { orgId } = useParams();

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
    
      const getData = async () => {
        const newStocks = await getItems(`${orgId}/stocks`);
        const newCustomers = await getItems(`${orgId}/customers`)
        const saleNo = await getSerialNumber('SALE', orgId)
        const invoiceNo = await getSerialNumber('INV', orgId)
        setInvoiceNo(invoiceNo)
        setSalesNo(saleNo);
        setStocks(newStocks);
        setCustomers(newCustomers);
    }
    useEffect(() => {
        
        getData()
    }, [])
  return (
    <div className='flex-1 flex flex-col items-center justify-center'>


    <Formik
      initialValues={{
        date: null,
        description: '',
        serial_number: salesNo,
        sales_entries: [
          { stock: null, sold_quantity: 0, sales_price: 0.0 }
        ],
        invoice: {
          amount_due: 0.00,
          due_date: null,
          customer: null,
          serial_number: invoiceNo
      },
        discount_allowed: {
          discount_amount: 0.00,
          discount_percentage: 0,
      }
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
       
        const totalAmountDue = values.invoice.amount_due;
        const salesPriceTotal = getTotalSalesPrice(values.sales_entries) - values.discount_allowed.discount_amount;
        if (salesPriceTotal === totalAmountDue) {
          const response = await postRequest(values, `${orgId}/invoices/sales`, resetForm);

          if (response.success) {
            toast.success('Recorded: Sales invoice recorded successfully')
            getData()
          } else {
            toast.error(`Error: ${response.error}`)
          }
        } else {
          let description = 'Amount due and discount must be equal total sales price';
          toast.error(`Validation Error: ${description}`)

        }
      }}
    >
      {({ values, setFieldValue, handleChange, handleSubmit }) => {
        const salesPriceTotal = useMemo(() => getTotalSalesPrice(values.sales_entries) || 0.00, [values.sales_entries]);
        useEffect(() => {
          if (!values.sales_entries.length) return;
          const salesPrice = salesPriceTotal - values.discount_allowed.discount_amount;
          setFieldValue('invoice.amount_due', salesPrice);
        }, [values.discount_allowed, salesPriceTotal]);
        useEffect(() => {
          scrollBottom(scrollRef);
        }, [salesPriceTotal, values.sales_entries])

        useEffect(() => {
          setFieldValue('serial_number', salesNo)
          setFieldValue('invoice.serial_number', invoiceNo)
        }, [salesNo, invoiceNo])

        return (
          <div ref={scrollRef} className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'>
            <FormHeader header='Record sales' />
            <Form
              className='flex-1 flex flex-col w-full h-full gap-2'
              onFinish={handleSubmit}
            >
              <div className='flex flex-row justify-between text-gray-800 mr-2'>
                                <span>Invoice No : {invoiceNo}</span><span>Sales No : {salesNo}</span>
                            </div>
              <div className='flex flex-row gap-2 w-full'>
                <div className='flex flex-col gap-2 w-[50%]'>
                  <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue}/>
                </div>
                <InvoiceContainer setFieldValue={setFieldValue} customers={customers} values={values.invoice}/>
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
  )
}

export default SalesInvoice
