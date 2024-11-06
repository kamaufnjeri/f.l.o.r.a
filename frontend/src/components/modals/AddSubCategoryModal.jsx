import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import { FaPlus } from 'react-icons/fa';
import SelectField from '../forms/SelectField';
import AddCategoryModal from './AddCategoryModal';

const validationSchema = Yup.object({
  name: Yup.string().required('Sub Category name is required'),
  category: Yup.string().required('Category is equired'),
 
});

const { Option } = Select;

const AddSubCategoryModal = ({ openModal, setOpenModal }) => {
  const { categories } = useSelectOptions();
  const { orgId } = useParams();
  const { getSelectOptions } = useSelectOptions();
  const [openCategoryModal, setOpenCategoryModal] = useState(false)

  const handleCancel = () => {
    setOpenModal(false);
  };

 
  return (
    <>
      <Modal
        title="Add Sub Category"
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
            category: categories[0]?.id,
          }}
          onSubmit={async (values, { resetForm }) => {
            const response = await postRequest(values, `${orgId}/accounts/sub_categories`, resetForm);
            
            if (response.success) {
              toast.success('Recorded: Sub category added successfully');
              getSelectOptions();
            } else {
              toast.error(`Error: ${response.error}`);
            }
          }}
        >
          {({ values, setFieldValue, handleChange, handleSubmit, touched, errors }) => (
            <Form onFinish={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-row gap-5 items-start">
                <label htmlFor="name" className="w-[20%]">Sub Category name</label>
                <Form.Item
                   validateStatus={touched.name && errors.name ? 'error' : ''}
                   help={touched.name && errors.name ? errors.name : ''}
                  className="w-[60%]"
                 
                >
                  <Input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Enter sub category name"
                  />
                </Form.Item>
              </div>

             
             
              <div className="flex flex-row gap-5 items-start">
                <AddCategoryModal openModal={openCategoryModal} setOpenModal={setOpenCategoryModal}/>
                <label htmlFor="category" className="w-[20%]">Category</label>
                <span className='w-[60%]'>
                <SelectField
                            value={values.category}
                            className='w-[60%]'
                            name={`category`}
                            setFieldValue={setFieldValue}
                            options={categories.map(category => ({ value: category.id, label: category.name }))}
                            keyName={`category`}
                        />
                </span>
            
                <span 
                onClick={() => setOpenCategoryModal(true)}
                className='flex p-1 items-center justify-between h-8 w-8 rounded-full border-4 cursor-pointer border-gray-800 text-xl hover:text-purple-800 hover:border-purple-800'>
                <FaPlus/>
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

export default AddSubCategoryModal;
