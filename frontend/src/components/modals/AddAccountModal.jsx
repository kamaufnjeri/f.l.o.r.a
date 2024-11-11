import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, Select, InputNumber } from 'antd';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import { FaPlus } from 'react-icons/fa';
import AddSubCategoryModal from './AddSubCategoryModal';
import SelectField from '../forms/SelectField';

const validationSchema = Yup.object({
  name: Yup.string().required('Account name is required'),
  belongs_to: Yup.string().required('Account belongs to is equired'),
  opening_balance: Yup.string().nullable(),
  opening_balance_type: Yup.string().nullable(),
});

const { Option } = Select;

const AddAccountModal = ({ openModal, setOpenModal }) => {
  const [entryTypes] = useState(['debit', 'credit']);
  const { subCategories } = useSelectOptions();
  const { orgId } = useParams();
  const { getSelectOptions } = useSelectOptions();
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);

  const handleCancel = () => {
    setOpenModal(false);
  };

 
  return (
    <>
      <Modal
        title="Add Account"
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
            belongs_to: subCategories[0]?.id,
            opening_balance: 0.00,
            opening_balance_type: '',
          }}
          onSubmit={async (values, { resetForm }) => {
            const response = await postRequest(values, `${orgId}/accounts`, resetForm);
            
            if (response.success) {
              toast.success('Account added successfully')
              getSelectOptions();
            } else {
              toast.error(`Error: ${response.error}`);
            }
          }}
        >
          {({ values, setFieldValue, handleChange, handleSubmit, touched, errors }) => (
            <Form onFinish={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-row gap-5 items-start">
                <label htmlFor="name" className="w-[20%]">Account name</label>
                <Form.Item
                   validateStatus={touched.name && errors.name ? 'error' : ''}
                   help={touched.name && errors.name ? errors.name : ''}
                  className="w-[60%]"
                 
                >
                  <Input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Enter account name"
                  />
                </Form.Item>
              </div>

             
             
              <div className="flex flex-row gap-5 items-start">
              <AddSubCategoryModal openModal={openSubCategoryModal} setOpenModal={setOpenSubCategoryModal} />

                <label htmlFor="belongs_to" className="w-[20%]">Belongs to</label>
                <span className='w-[60%]'>
                <SelectField
                            value={values.belongs_to}
                            className='w-[60%]'
                            name={`belongs_to`}
                            setFieldValue={setFieldValue}
                            options={subCategories.map(subCategory => ({ value: subCategory.id, label: subCategory.name }))}
                            keyName={`belongs_to`}
                        />
                </span>
            
                <span
                onClick={() => setOpenSubCategoryModal(true)}
                 className='flex p-1 items-center justify-between h-8 w-8 rounded-full border-4 cursor-pointer border-gray-800 text-xl hover:text-purple-800 hover:border-purple-800'>
                <FaPlus/>
                </span>
                
              </div>

              <div className="flex flex-row gap-5 items-start">
                <label htmlFor="opening_balance" className="w-[20%]">Opening balance</label>
                <Form.Item
                  className="w-[60%]"
                  validateStatus={values.opening_balance >= 0 ? '' : 'error'}
                  help={values.opening_balance >= 0 ? '' : 'Balance must be positive'}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    className="w-full"
                    placeholder="Enter opening balance"
                    value={values.opening_balance}
                    onChange={(value) => {
                      setFieldValue('opening_balance', value);
                    }}
                  />
                </Form.Item>
              </div>

              <div className="flex flex-row gap-5 items-start">
                <label htmlFor="opening_balance_type" className="w-[20%]">Opening balance type</label>
                <Form.Item
                  className="w-[60%]"
                  help={values.opening_balance_type ? '' : 'Debit/Credit is required if opening balance is given'}
                >
                  <Select
                    placeholder="Select opening balance type"
                    value={values.opening_balance_type || ''}
                    onChange={(value) => {
                      setFieldValue('opening_balance_type', value);
                    }}
                  >
                    <Option value=''>None</Option>
                    {entryTypes.map((type, i) => (
                      <Option key={i} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
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

export default AddAccountModal;
