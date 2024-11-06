import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import SelectField from '../forms/SelectField';

const validationSchema = Yup.object({
  name: Yup.string().required('Category name is required'),
  group: Yup.string().required('Category is equired'),
 
});

const { Option } = Select;

const AddCategoryModal = ({ openModal, setOpenModal }) => {
  const { fixedGroups } = useSelectOptions();
  const { orgId } = useParams();
  const { getSelectOptions } = useSelectOptions();

  const handleCancel = () => {
    setOpenModal(false);
  };

 console.log(fixedGroups)
  return (
    <>
      <Modal
        title="Add Category"
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
            group: fixedGroups[0]?.id,
          }}
          onSubmit={async (values, { resetForm }) => {
            const response = await postRequest(values, `${orgId}/accounts/categories`, resetForm);
            
            if (response.success) {
              toast.success('Recorded: Category added successfully');
              getSelectOptions();
            } else {
              toast.error(`Error: ${response.error}`);
            }
          }}
        >
          {({ values, setFieldValue, handleChange, handleSubmit, touched, errors }) => (
            <Form onFinish={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-row gap-5 items-start">
                <label htmlFor="name" className="w-[20%]">Category name</label>
                <Form.Item
                   validateStatus={touched.name && errors.name ? 'error' : ''}
                   help={touched.name && errors.name ? errors.name : ''}
                  className="w-[60%]"
                 
                >
                  <Input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Enter category name"
                  />
                </Form.Item>
              </div>

             
             
              <div className="flex flex-row gap-5 items-start">
                <label htmlFor="group" className="w-[20%]">Group</label>
                <span className='w-[60%]'>
                <SelectField
                            value={values.group}
                            className='w-[60%]'
                            name={`group`}
                            setFieldValue={setFieldValue}
                            options={fixedGroups.map(group => ({ value: group.id, label: group.name }))}
                            keyName={`group`}
                        />
                </span>
            
                
              </div>

             
              <Button type="primary" className="w-[30%] self-center" htmlType="submit">
                Add
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default AddCategoryModal;
