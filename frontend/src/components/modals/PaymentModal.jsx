import React, { useState } from 'react';
import { Modal, Button, Form, Input } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormInitialField from '../forms/FormInitialField';
import PaymentAccountsFields from '../forms/PaymentAccountsFields';
import { useParams } from 'react-router-dom';


const validationSchema = Yup.object({
    date: Yup.date().required('Date is required'),
    description: Yup.string().required('Description is required'),
    bill: Yup.string().nullable(),
    invoice: Yup.string().nullable(),
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
        .min(1, 'At least one journal entry are required'),
});

const PaymentModal = ({ openModal, setOpenModal, title, type, bill_id=null, invoice_id=null, onPaymentSuccess }) => {
    const { orgId } = useParams();
    const handleCancel = () => {
        setOpenModal(false);
    };

    return (
        <>

            <Modal
                title={title}
                open={openModal}
                onCancel={handleCancel}
                className='overflow-auto custom-scrollbar max-h-[80%]'
                width={'50%'}
                footer={
                    <Button key="cancel" onClick={handleCancel}>
                        Cancel
                    </Button>
                }
            >
                <Formik
                    initialValues={{
                        date: null,
                        description: '',
                        bill: bill_id,
                        invoice: invoice_id,
                        journal_entries: [
                            { account: null, debit_credit: type, amount: 0.0 },
                        ],
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { resetForm }) => {
                        console.log(values)

                        const response = await postRequest(values, `${orgId}/payments`, resetForm);
                        if (response.success) {
                            toast.success('Payment made successfully')
                            onPaymentSuccess()
                        } else {
                            toast.error(`Error: ${response.error}`)
                        }
                    }}
                >
                    {({ values, handleChange, handleSubmit, setFieldValue }) => {
                        return (
                            <Form
                                onFinish={handleSubmit}
                                className='flex flex-col gap-2'
                            >
                                <div className='w-full'>
                                    <FormInitialField values={values} handleChange={handleChange} setFieldValue={setFieldValue} />

                                </div>
                                <div className='w-full'>
                                    <PaymentAccountsFields type={type} values={values} setFieldValue={setFieldValue} />

                                </div>

                                <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                                    Record
                                </Button>
                            </Form>
                        )
                    }}

                </Formik>
            </Modal>
        </>
    );
};

export default PaymentModal;
