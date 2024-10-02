import React, { useState } from 'react';
import { Modal, Button, Form, Input, Row, Col } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormInitialField from '../forms/FormInitialField';
import PaymentAccountsFields from '../forms/PaymentAccountsFields';
import InputNumberField from '../forms/InputNumberField';
import SelectField from '../forms/SelectField';
import { FaPlus, FaTimes } from 'react-icons/fa';


const validationSchema = Yup.object({
    date: Yup.date().required('Date is required'),
    description: Yup.string().required('Description is required'),
    purchase: Yup.string().nullable(),
    return_entries: Yup.array()
        .of(
            Yup.object().shape({
                purchase_entry: Yup.string().required('Account is required'),
                return_quantity: Yup.number()
                    .required('Return quantity is required')
                    .min(0, 'Return quantity must be positive'),
            })
        )
        .min(1, 'At least one return entry are required'),
});

const PurchaseReturnModal = ({ openModal, setOpenModal, title, purchase }) => {
    const handleCancel = () => {
        setOpenModal(false);
    };

    return (
        <>

            <Modal
                title={title}
                open={openModal}
                onCancel={handleCancel}
                width={'50%'}
                className='overflow-auto custom-scrollbar max-h-[80%]'
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
                        purchase: purchase?.id,
                        return_entries: [
                            { purchase_entry: '', return_quantity: 0 },
                        ],
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { resetForm }) => {
                        console.log(values)

                        const response = await postRequest(values, 'purchase_returns', resetForm);
                        if (response.success) {
                            toast.success('Purchase return successfully')
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
                                <Row className='flex flex-row w-full text-xl font-bold'><Col className='w-full'><span>
                                    Return Items
                                </span>
                                </Col></Row>
                                <Row className='flex flex-row w-full'>
                                    <Col className='w-[10%]'><span>No#</span></Col>
                                    <Col className='w-[35%]'><span>Return Item</span></Col>
                                    <Col className='w-[35%]'><span>Return Quantity</span></Col>
                                    <Col className='w-[20%]'>Remove</Col>

                                </Row>
                                {values?.return_entries.map((entry, index) => (
                                    <div key={index} style={{ marginBottom: '16px' }}>
                                        <Row className='flex flex-row items-start justify-between w-[100%]'>
                                            <Col className='w-[4%]'>{index + 1}</Col>
                                            <Col className='w-[20%]'>
                                                <SelectField
                                                    value={entry.purchase_entry}
                                                    name='stock'
                                                    setFieldValue={setFieldValue}
                                                    keyName={`return_entries[${index}].purchase_entry`}
                                                    options={purchase.purchase_entries.map((entry) => ({ value: entry.id, label: entry.stock_name }))}
                                                />

                                            </Col>
                                            
                                            <Col className='w-[20%]'>
                                                <InputNumberField
                                                    value={entry.return_quantity}
                                                    name='quantity'
                                                    setFieldValue={setFieldValue}
                                                    step={0}
                                                    keyName={`return_entries[${index}].return_quantity`}
                                                />

                                            </Col>
                                            <Col className='w-[20%]'>
                                                
                                                    <Button
                                                        type="danger"
                                                        onClick={() => {
                                                            const updatedEntries = values.return_entries.filter((_, i) => i !== index);
                                                            setFieldValue('return_entries', updatedEntries);
                                                        }}
                                                    >
                                                        <FaTimes className='text-red-500 text-xl' />
                                                    </Button>
                                                
                                            </Col>
                                        </Row></div>


                                ))}
                                <Row className='flex flex-row w-full gap-5'>
                  <Col className='w-[30%]'>
                    <Button
                      type="dashed"
                      className='w-[80%]'
                      onClick={() => {
                        console.log(values.return_entries.length)
                        if (values.return_entries.length < purchase.purchase_entries.length) {
                        const updatedEntries = [...values.return_entries, { purchase_entry: '', return_quantity: 0 }];
                        setFieldValue('return_entries', updatedEntries);
                        }
                      }}
                    >
                      <FaPlus /> Add Entry
                    </Button>
                  </Col></Row>

                                <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                                    Return
                                </Button>
                            </Form>
                        )
                    }}

                </Formik>
            </Modal>
        </>
    );
};

export default PurchaseReturnModal;
