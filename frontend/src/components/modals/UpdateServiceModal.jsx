import React from 'react';
import { Modal, Button, Form, Input } from 'antd';
import * as Yup from 'yup'
import { Formik } from 'formik';
import { patchRequest, postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';


const validationSchema = Yup.object({
    name: Yup.string().required('Service name is required'),
    description: Yup.string().required('Description is required'),
  })

const UpdateServiceModal = ({ setServiceData, serviceData, setOpenModal, openModal }) => {
    const {orgId} = useParams();
    const { getSelectOptions } = useSelectOptions();
  
    const handleCancel = () => {
      setOpenModal(false);
    };
  
    return (
      <>
  
        <Modal
          title={`Update Service ${serviceData.name}`}
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
              name: serviceData.name,
              description: serviceData.description
              
            }}
            onSubmit={async (values, { resetForm }) => {
              const response = await patchRequest(values, `${orgId}/services/${serviceData.id}`);
              if (response.success) {
                toast.success('Recorded: Service updated successfully');
                setServiceData(response.data)
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
                      placeholder="Enter service name"
                    />
                  </Form.Item>
                </div>
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="description" className='w-[20%]'>Description</label>
                  <Form.Item
                    validateStatus={values.description ? '' : 'error'}
                    className='w-[60%]'
                    help={values.description ? '' : 'Description is required'}
                  >
                    <Input.TextArea
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      placeholder="Enter description"
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

export default UpdateServiceModal



