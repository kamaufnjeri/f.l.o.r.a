import React, { useState } from 'react';
import { Modal, Button, Form, Input, Select, InputNumber } from 'antd';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { accountCategories, accountSubCategories } from '../../lib/constants';

const validationSchema = Yup.object({
  name: Yup.string().required('Account name is required'),
  category: Yup.string().required('Category is required'),
  sub_category: Yup.string().required('Sub category is required'),
  opening_balance: Yup.string().nullable(),
  opening_balance_type: Yup.string().nullable(),
});

const { Option } = Select;

const AddAccountModal = ({ openModal, setOpenModal }) => {
  const [entryTypes] = useState(['debit', 'credit']);
  const [subCategories, setSubCategories] = useState(accountSubCategories['asset']); // Default to 'asset' sub-categories

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleCategoryChange = (category, setFieldValue) => {
    const subCategories = accountSubCategories[category] || [];
    setSubCategories(subCategories);
    console.log(subCategories)
    setFieldValue('sub_category', subCategories[0].value);
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
            category: 'asset', // Default category
            sub_category: 'current_asset', // Default sub-category
            opening_balance: 0.00,
            opening_balance_type: '',
          }}
          onSubmit={async (values, { resetForm }) => {
            const response = await postRequest(values, 'accounts', resetForm);
            if (response.success) {
              toast.success('Recorded: Account added successfully');
            } else {
              toast.error(`Error: ${response.error}`);
            }
          }}
        >
          {({ values, setFieldValue, handleChange, handleSubmit }) => (
            <Form onFinish={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-row gap-5 items-start">
                <label htmlFor="name" className="w-[20%]">Account name</label>
                <Form.Item
                  validateStatus={values.name ? '' : 'error'}
                  className="w-[60%]"
                  help={values.name ? '' : 'Name is required'}
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
                <label htmlFor="category" className="w-[20%]">Category</label>
                <Form.Item
                  validateStatus={values.category ? '' : 'error'}
                  className="w-[60%]"
                  help={values.category ? '' : 'Category is required'}
                >
                  <Select
                    name="category"
                    value={values.category}
                    defaultValue={values.category}
                    onChange={(value) => {
                      setFieldValue('category', value);
                      handleCategoryChange(value, setFieldValue);
                    }}
                    placeholder="Enter category"
                  >
                    {accountCategories.map((category) => (
                      <Option key={category.value} value={category.value}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="flex flex-row gap-5 items-start">
                <label htmlFor="sub_category" className="w-[20%]">Sub category</label>
                <Form.Item
                  validateStatus={values.sub_category ? '' : 'error'}
                  className="w-[60%]"
                  help={values.sub_category ? '' : 'Sub Category is required'}
                >
                  <Select
                    name="sub_category"
                    value={values.sub_category}
                    defaultValue={values.sub_category}
                    onChange={(value) => setFieldValue('sub_category', value)}
                    placeholder="Enter sub category"
                  >
                    {subCategories.map((subCategory) => (
                      <Option key={subCategory.value} value={subCategory.value}>
                        {subCategory.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
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
                  help={values.opening_balance_type ? '' : 'Debit/Credit is required if account balance is given'}
                >
                  <Select
                    placeholder="Select opening balance type"
                    value={values.opening_balance_type || undefined}
                    onChange={(value) => {
                      setFieldValue('opening_balance_type', value);
                    }}
                  >
                    <Option value={null}>None</Option>
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
