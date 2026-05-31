import React from 'react';
import { Modal, Button, Form, Input } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { patchRequest, postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';


const validationSchema = Yup.object({
    name: Yup.string().required('Item name is required'),
    unit_name: Yup.string().required('Unit name is required'),
    unit_alias: Yup.string().required('Unit alias is required'),
    
  })

const UpdateItemModal = ({ setStockData, stockData, setOpenModal, openModal }) => {
    const {orgId} = useParams();
    const { getSelectOptions } = useSelectOptions();
  
    const handleCancel = () => {
      setOpenModal(false);
    };
  
    return (
      <>
  
        <Modal
          title={`Update Stock ${stockData.name}`}
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
              name: stockData.name,
              unit_name: stockData.unit_name,
              unit_alias: stockData.unit_alias,
              
            }}
            onSubmit={async (values, { resetForm }) => {
              const response = await patchRequest(values, `${orgId}/stocks/${stockData.id}`);
              if (response.success) {
                toast.success('Recorded: Stock updated successfully');
                setStockData(response.data)
                getSelectOptions();
              } else {
                toast.error(`${response.error}`)
  
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
                
                  <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                    Edit
                  </Button>
                </Form>
              )
            }}
  
          </Formik>
        </Modal>
      </>
    );
}

export default UpdateItemModal



