import React, { useState } from 'react';
import { Modal, Button, Form, Input } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  name: Yup.string().required('Supplier name is required'),
  email: Yup.string()
  .email('Invalid email format')
  .matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Invalid email format'
  )
  .required('Email is required'),
  phone_number: Yup.string()
  .matches(
    /^(?:\+?\d{1,3})?[ -]?\(?\d{1,4}\)?[ -]?\d{1,4}[ -]?\d{1,4}[ -]?\d{1,9}$/,
    'Invalid phone number'
  )
  .required('Phone number is required'),
})

const AddSupplierModal = ({ openModal, setOpenModal }) => {
  const handleCancel = () => {
    setOpenModal(false);
  };

  return (
    <>

      <Modal
        title="Add Supplier"
        open={openModal}
        onCancel={handleCancel}
        width={'50%'}
        footer={
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>
        }
      >
        <Formik
          validationSchema={validationSchema}
          initialValues={{
            name: '',
            email: '',
            phone_number: ''
          }}
          onSubmit={async (values, { resetForm }) => {
            const response = await postRequest(values, 'suppliers', resetForm);
            if (response.success) {
              toast.success('Recorded: Supplier added successfully')
            } else {
              toast.error(`Error: ${response.error}`)
            }
          }}
        >
          {({ values, handleChange, handleSubmit }) => {
            return (
              <Form
                onFinish={handleSubmit}
                className='flex flex-col gap-2'
              >
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="name" className='w-[20%]'>Supplier name</label>
                  <Form.Item
                    validateStatus={values.name ? '' : 'error'}
                    className='w-[60%]'
                    help={values.name ? '' : 'Name is required'}
                  >
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Enter supplier name"
                    />
                  </Form.Item>
                </div>
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="email" className='w-[20%]'>Supplier email</label>
                  <Form.Item
                    validateStatus={values.email ? '' : 'error'}
                    className='w-[60%]'
                    help={values.email ? '' : 'Email is required'}
                  >
                    <Input
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="e.g janedoe@gmail.com"
                    />
                  </Form.Item>
                </div>
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="phone_number" className='w-[20%]'>Supplier phone number</label>
                  <Form.Item
                    validateStatus={values.phone_number ? '' : 'error'}
                    className='w-[60%]'
                    help={values.phone_number ? '' : 'Phone number is required'}
                  >
                    <Input
                      name="phone_number"
                      value={values.phone_number}
                      onChange={handleChange}
                      placeholder="e.g +254700000000"
                    />
                  </Form.Item>
                </div>
                
                
                <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                  Add
                </Button>
              </Form>
            )
          }}

        </Formik>
      </Modal>
    </>
  );
};

export default AddSupplierModal;
