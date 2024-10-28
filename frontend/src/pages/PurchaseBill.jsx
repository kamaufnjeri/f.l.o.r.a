import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Form } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { getItems, getSerialNumber, postRequest, scrollBottom } from '../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../components/forms/FormHeader';
import FormInitialField from '../components/forms/FormInitialField';
import PurchaseEntriesFields from '../components/forms/PurchaseEntriesFields';
import DiscountContainer from '../components/forms/DiscountContainer';
import BillContainer from '../components/forms/BillContainer';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../context/SelectOptionsContext';


const validationSchema = Yup.object({
    date: Yup.date().required('Date is required'),
    description: Yup.string().required('Description is required'),
    purchas_entries: Yup.array()
      .of(
        Yup.object().shape({
          stock: Yup.string().required('Stock item is required'),
          purchased_quantity: Yup.number()
            .required('Quantity is required')
            .min(0, 'Quantity must be positive'),
          purchase_price: Yup.number()
            .required('Sales price is required')
            .min(0, 'Sales price must be positive')
        })
      )
      .min(1, 'At least one sales entry is required'),
      bill: Yup.object({
        due_date: Yup.date().required('Due date is required'),
        supplier: Yup.string().required('Supplier is required'),
        amount_due: Yup.number().required('Amount due is required').min(0, 'Amount due must be positive')
      }).required('Bill info is required'),
      discount_received: Yup.object({
        discount_amount: Yup.number().required('Discount amount is required')
            .min(0, 'Amount must be positive'),
        discount_percentage: Yup.number().required('Discount percentage is required')
            .min(0, 'Amount must be positive')
    }).nullable()
  });
const PurchaseBill = () => {
    const scrollRef = useRef(null);
    const { orgId } = useParams();
    const { stocks, serialNumbers, suppliers, getSelectOptions } = useSelectOptions();

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
                    bill: {
                        amount_due: 0.00,
                        due_date: null,
                        supplier: null,
                        serial_number: serialNumbers.bill
                    },
                    discount_received: {
                        discount_amount: 0.00,
                        discount_percentage: 0,
                    }
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                    console.log(values)
                    
                    const totalAmountDue = values.bill.amount_due;

                    const purchasePriceTotal = getTotalPurchasePrice(values.purchase_entries) - values.discount_received.discount_amount;
                    if (purchasePriceTotal === totalAmountDue) {
                        const response = await postRequest(values, `${orgId}/bills/purchases`, resetForm)
                        if (response.success) {
                            toast.success('Recorded: Purchase bill recorded successfully')
                            getSelectOptions()
                        } else {
                            toast.error(`Error: ${response.error}`)
                        }
                    } else {
                        let description = 'The amount due and discount must be equal to total purchase price'
                        toast.error(`Validation Error: ${description}`)
                    }
                }}
            >
                {({ values, setFieldValue, handleChange, handleSubmit }) => {
                    const purchasePriceTotal = useMemo(() => getTotalPurchasePrice(values.purchase_entries) || 0.00, [values.purchase_entries]);

                    useEffect(() => {
                        if (!values.purchase_entries.length) return;
                        const purchasePrice = purchasePriceTotal - values.discount_received.discount_amount;
                        setFieldValue('bill.amount_due', purchasePrice)
                    }, [purchasePriceTotal, values.discount_received]);

                    useEffect(() => {
                        setFieldValue('serial_number', serialNumbers.purchase)
                    setFieldValue('bill.serial_number', serialNumbers.bill)
                    }, [serialNumbers])


                 useEffect(() => {
                        scrollBottom(scrollRef);
                    }, [values.journal_entries, values.purchase_entries])
                    return (<div ref={scrollRef} className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'>
                        <FormHeader header='Record Purchase Bill' />

                        <Form
                            className='flex-1 flex flex-col w-full h-full gap-2'
                            onFinish={handleSubmit}
                        >
                            <div className='flex flex-row justify-between text-gray-800 mr-2'>
                                <span>Bill No : {serialNumbers.bill}</span><span>Purchase No : {serialNumbers.purchase}</span>
                                </div>
                            <div className='flex flex-row gap-2 w-full'>
                                <div className='flex flex-col gap-2 w-[50%]'>
                                    <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue} />
                                </div>
                                <BillContainer values={values.bill} setFieldValue={setFieldValue} suppliers={suppliers}/>
                                
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

export default PurchaseBill
