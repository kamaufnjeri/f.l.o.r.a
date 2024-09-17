import React, { useState } from 'react';
import { Modal, Button, Form, Input, Select, InputNumber } from 'antd';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { postRequest } from '../../lib/helpers';
import { toast } from 'react-toastify';
import { accountCategories, accountSubCategories, accountGroups } from '../../lib/constants';

const validationSchema = Yup.object({
  name: Yup.string().required('Account name is required'),
  group: Yup.string().required('Account group is required'),
  category: Yup.string().required('Category is required'),
  sub_category: Yup.string().required('Sub category is required'),
  opening_balance: Yup.string().nullable(),
  opening_balance_type: Yup.string().nullable(),
});

const { Option } = Select;

const AddAccountModal = ({ openModal, setOpenModal }) => {
  const [entryTypes] = useState(['debit', 'credit']);
  const [categories, setCategories] = useState(accountCategories['asset']);
  const [subCategories, setSubCategories] = useState(accountSubCategories['current_asset'])

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleSelectionChange = (type, value, setFieldValue) => {
    if (type === 'group') {
      const newCategories = accountCategories[value] || [];
      setCategories(newCategories);
      if (newCategories.length > 0) {
        const firstCategoryValue = newCategories[0].value;
        setFieldValue('category', firstCategoryValue);
        const newSubCategories = accountSubCategories[firstCategoryValue] || [];
        setSubCategories(newSubCategories);
        if (newSubCategories.length > 0) {
          setFieldValue('sub_category', newSubCategories[0].value);
        }
      }
    } else {
      const newSubCategories = accountSubCategories[value] || [];
      setSubCategories(newSubCategories);
      if (newSubCategories.length > 0) {
        setFieldValue('sub_category', newSubCategories[0].value);
      }
    }
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
            group: 'asset',
            category: 'current_asset',
            sub_category: 'cash_and_cash_equivalents',
            opening_balance: 0.00,
            opening_balance_type: '',
          }}
          onSubmit={async (values, { resetForm }) => {
            const response = await postRequest(values, 'accounts', resetForm);
            
            if (response.success) {
              setCategories(accountCategories['asset'])
              setSubCategories(accountSubCategories['current_asset'])
              toast.success('Recorded: Account added successfully');
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
                <label htmlFor="group" className="w-[20%]">Group</label>
                <Form.Item
                  validateStatus={values.group ? '' : 'error'}
                  className="w-[60%]"
                  help={values.group ? '' : 'Group is required'}
                >
                  <Select
                    name="group"
                    value={values.group}
                    defaultValue={values.group}
                    onChange={(value) => {
                      setFieldValue('group', value);
                      handleSelectionChange('group', value, setFieldValue);
                    }}
                    placeholder="Enter Group"
                  >
                    {accountGroups && accountGroups.map((group) => (
                      <Option key={group.value} value={group.value}>
                        {group.name}
                      </Option>
                    ))}
                  </Select>
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
                      handleSelectionChange('category', value, setFieldValue);
                    }}
                    placeholder="Enter category"
                  >
                    {categories && categories.map((category) => (
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
                  help={values.sub_category ? '' : 'Sub category is required'}
                >
                  <Select
                    name="sub_category"
                    value={values.sub_category}
                    defaultValue={values.sub_category}
                    onChange={(value) => setFieldValue('sub_category', value)}
                    placeholder="Enter sub category"
                  >
                    {subCategories && subCategories.map((subCategory) => (
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
