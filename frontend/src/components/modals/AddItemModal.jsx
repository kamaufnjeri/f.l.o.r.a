import React, { useState } from 'react';
import { Modal, Button, Form, Input, InputNumber } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';


const validationSchema = Yup.object({
  name: Yup.string().required('Item name is required'),
  unit_name: Yup.string().required('Unit name is required'),
  unit_alias: Yup.string().required('Unit alias is required'),
  opening_stock_quantity: Yup.number().required('Opening stock quantity must be positive'),
  opening_stock_rate: Yup.number().required('Opening stock rate must be positive'),
})

const AddItemModal = ({ openModal, setOpenModal }) => {
  const {orgId} = useParams();
  const handleCancel = () => {
    setOpenModal(false);
  };

  return (
    <>

      <Modal
        title="Add Stock Item"
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
            unit_name: '',
            unit_alias: '',
            opening_stock_quantity: 0,
            opening_stock_rate: 0.00
          }}
          onSubmit={async (values, { resetForm }) => {
            const response = await postRequest(values, `${orgId}/stocks`, resetForm);
            if (response.success) {
              toast.success('Recorded: Stock Item added successfully')
            } else {
              toast.error(`Error: ${response.error}`)

            }
          }}
        >
          {({ values, setFieldValue, handleChange, handleSubmit }) => {
            return (
              <Form
                onFinish={handleSubmit}
                className='flex flex-col gap-2'
              >
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="name" className='w-[20%]'>Name</label>
                  <Form.Item
                    validateStatus={values.name ? '' : 'error'}
                    className='w-[60%]'
                    help={values.name ? '' : 'Name is required'}
                  >
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Enter item name"
                    />
                  </Form.Item>
                </div>
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="unit_name" className='w-[20%]'>Unit name</label>
                  <Form.Item
                    validateStatus={values.unit_name ? '' : 'error'}
                    className='w-[60%]'
                    help={values.unit_name ? '' : 'Unit name is required'}
                  >
                    <Input
                      name="unit_name"
                      value={values.unit_name}
                      onChange={handleChange}
                      placeholder="e.g Kilograms"
                    />
                  </Form.Item>
                </div>
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="unit_alias" className='w-[20%]'>Unit alias</label>
                  <Form.Item
                    validateStatus={values.unit_alias ? '' : 'error'}
                    className='w-[60%]'
                    help={values.unit_alias ? '' : 'Unit alias is required'}
                  >
                    <Input
                      name="unit_alias"
                      value={values.unit_alias}
                      onChange={handleChange}
                      placeholder="e.g kgs"
                    />
                  </Form.Item>
                </div>
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="opening_stock_quantity" className='w-[20%]'>Opening stock quantity</label>
                  <Form.Item
                    validateStatus={values.opening_stock_quantity >= 0 ? '' : 'error'}
                    className='w-[60%]'
                    help={values.opening_stock_quantity >= 0 ? '' : 'Opening stock quantity must be positive'}
                  >
                    <InputNumber
                      name="opening_stock_quantity"
                      step={1}
                      className='w-full'
                      min={0}
                      value={values.opening_stock_quantity}
                      onChange={(value) => setFieldValue('opening_stock_quantity', value)}
                      placeholder="Enter opening stock quantity"
                    />
                  </Form.Item>
                </div>
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="opening_stock_rate" className='w-[20%]'>Opening stock rate</label>
                  <Form.Item
                    validateStatus={values.opening_stock_rate >= 0.00 ? '' : 'error'}
                    className='w-[60%]'
                    help={values.opening_stock_rate >= 0.00 ? '' : 'Opening stock rate must be positive'}
                  >
                    <InputNumber
                      className='w-full'
                      step={0.01}
                      min={0}
                      name="opening_stock_rate"
                      value={values.opening_stock_rate}
                      onChange={(value) => setFieldValue('opening_stock_rate', value)}
                      placeholder="Enter opening stock price"
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

export default AddItemModal;
