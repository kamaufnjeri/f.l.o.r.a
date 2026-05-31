import React, { useState } from 'react';
import { Modal, Button, Form, Input } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';


const validationSchema = Yup.object({
  name: Yup.string().required('Customer name is required'),
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

const AddCustomerModal = ({ openModal, setOpenModal, getData=null }) => {
  const { orgId} = useParams();
  const { getSelectOptions } = useSelectOptions();

  const handleCancel = () => {
    setOpenModal(false);
  };

  return (
    <>

      <Modal
        title="Add Customer"
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
            const response = await postRequest(values, `${orgId}/customers`, resetForm);
      
            if (response.success) {
              toast.success('Recorded: Customer added successfully')
              getSelectOptions();
              if (getData) {
                getData();
              }
            } else {
              toast.error(`${response.error}`)
            }
          }}
        >
          {({ values, handleChange, handleSubmit, touched, errors }) => {
            return (
              <Form
                onFinish={handleSubmit}
                className='flex flex-col gap-2'
              >
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="name" className='w-[20%]'>Customer name</label>
                  <Form.Item
                    className='w-[60%]'
                    validateStatus={touched.name && errors.name ? 'error' : ''}
                    help={touched.name && errors.name ? errors.name : ''}
                  >
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Enter customer name"
                    />
                  </Form.Item>
                </div>
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="email" className='w-[20%]'>Customer email</label>
                  <Form.Item
                     validateStatus={touched.email && errors.email ? 'error' : ''}
                     help={touched.email && errors.email ? errors.email : ''}
                    className='w-[60%]'
                   
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
                  <label htmlFor="phone_number" className='w-[20%]'>Customer phone number</label>
                  <Form.Item
                     validateStatus={touched.phone_number && errors.phone_number ? 'error' : ''}
                     help={touched.phone_number && errors.phone_number ? errors.phone_number : ''}
                    className='w-[60%]'
                    
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

export default AddCustomerModal;
