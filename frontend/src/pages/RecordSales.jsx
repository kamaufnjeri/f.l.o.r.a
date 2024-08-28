import React, { useEffect, useState } from 'react';
import { notification, Form, Input, DatePicker, Row, Col, Select, InputNumber, Button } from 'antd';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik } from 'formik';
import moment from 'moment';
import { FaPlus, FaTimes } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

const validationSchema = Yup.object({
  date: Yup.date().required('Date is required'),
  description: Yup.string().required('Description is required'),
  sales_entries: Yup.array()
    .of(
      Yup.object().shape({
        stock: Yup.string().required('Stock item is required'),
        sold_quantity: Yup.number()
          .required('Quantity is required')
          .min(0, 'Quantity must be positive'),
        sales_price: Yup.number()
          .required('Sales price is required')
          .min(0, 'Sales price must be positive')
      })
    )
    .min(1, 'At least one sales entry is required'),
  journal_entries: Yup.array()
    .of(
      Yup.object().shape({
        account: Yup.string().required('Account is required'),
        amount: Yup.number()
          .required('Amount is required')
          .min(0, 'Amount must be positive'),
        debit_credit: Yup.string().required('Debit/Credit is required')
      })
    ).min(1, 'At least one journal entry is required')
});

const RecordSales = () => {
  const [stocks, setStocks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [totalSalesPrice, setTotalSalesPrice] = useState(0);

  const getTotalSalesPrice = (items) => {
    if (items) {
      const salesPriceTotal = items.reduce(
        (total, item) => total + (parseFloat(item.sold_quantity) * parseFloat(item.sales_price)),
        0
      );
      return salesPriceTotal;
    }
    return 0;
  };

  const getItems = (name) => {
    axios.get(`${BACKEND_URL}/${name}/`)
      .then((response) => {
        if (name === 'accounts') {
          setAccounts(response.data);
        } else {
          setStocks(response.data);
        }
      })
      .catch((error) => notification.error({
        message: 'Error',
        description: `Error fetching ${name}`
      }));
  };

  useEffect(() => {
    getItems('accounts');
    getItems('stocks');
  }, []);

  return (
    <div className='flex-1 flex flex-col items-center justify-center'>
      <Formik
        initialValues={{
          date: null,
          description: '',
          sales_entries: [
            { stock: '', sold_quantity: 0, sales_price: 0.0 }
          ],
          journal_entries: [
            { account: '', debit_credit: 'debit', amount: 0.0 }
          ]
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => {
          const debitTotalAmount = values.journal_entries.reduce((sum, entry) => {
            return sum + parseFloat(entry.amount || 0);
          }, 0);
          const salesPriceTotal = getTotalSalesPrice(values.sales_entries);
          if (salesPriceTotal === debitTotalAmount) {
            axios
              .post(`${BACKEND_URL}/sales/`, values)
              .then(response => {
                if (response.status === 201) {
                  resetForm();
                  console.log(response)
                  notification.success({
                    message: 'Success',
                    description: 'Sales recorded successfully!',
                  });
                }
              })
              .catch(error => {
                
                const errorData = error.response.data.detail ? error.response.data.detail : error.response.data ? error.response.data : 'An error occurred';
                let newError = '';
                if (errorData === Array.isArray()) {
                  newError = errorData.join('/n');
                } else {
                  newError = errorData;
                }
                notification.error({
                  message: 'Error',
                  description: newError,
                });
              });
          } else {
            notification.error({
              message: 'Validation Error',
              description: 'Amount to be received  and discount must be equal total sales price',
            });
          }
        }}
      >
        {({ values, setFieldValue, handleChange, handleSubmit }) => {
          useEffect(() => {
            const salesPriceTotal = getTotalSalesPrice(values.sales_entries) || 0.00;
            setTotalSalesPrice(salesPriceTotal);
            const updatedJournalEntries = values.journal_entries.map(entry => ({
              ...entry,
              amount: salesPriceTotal
            }));
            setFieldValue('journal_entries', updatedJournalEntries);
          }, [values.sales_entries]);

          return (
            <div className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'>
              <h2 className='text-black-700 text-2xl font-medium mb-5'>Record Sales</h2>

              <Form
                className='flex-1 flex flex-col w-full h-full gap-2'
                onFinish={handleSubmit}
              >
                <div className='flex flex-row gap-2 w-full'>
                  <div className='flex flex-col gap-2 w-[50%]'>
                    <div className='flex flex-row gap-5 items-start w-full'>
                      <label htmlFor="description" className='w-[15%]'>Description</label>
                      <Form.Item
                        className='w-[80%]'
                        help={values.description ? '' : 'Description is required'}
                        validateStatus={values.description ? '' : 'error'}
                      >
                        <Input.TextArea
                          name='description'
                          value={values.description}
                          onChange={handleChange}
                          placeholder='Enter description'
                        />
                      </Form.Item>
                    </div>
                    <div className='flex flex-row gap-5 items-start w-full'>
                      <label htmlFor="date" className='w-[15%]'>Date</label>
                      <Form.Item
                        className='w-[80%]'
                        help={values.date ? '' : 'Date is required'}
                        validateStatus={values.date ? '' : 'error'}
                      >
                        <DatePicker
                          name='date'
                          placeholder='Select date'
                          format='YYYY-MM-DD'
                          value={values.date ? moment(values.date) : null}
                          onChange={(date) => setFieldValue('date', date ? date.format('YYYY-MM-DD') : null)}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 w-[50%]'>
                    <Row className='flex flex-row w-full text-xl font-bold'>
                      <Col className='w-full'>
                        <span>Sales Receipt and Discount Accounts</span>
                      </Col>
                    </Row>
                    <Row className='flex flex-row w-full gap-2'>
                      <Col className='w-[40%]'><span>Account</span></Col>
                      <Col className='w-[40%]'><span>Amount</span></Col>
                      <Col className='w-[10%]'>Remove</Col>
                    </Row>
                    {values.journal_entries.map((entry, index) => (
                      <Row key={index} className='flex flex-row w-full gap-2'>
                        <Col className='w-[40%]'>
                          <Form.Item
                            validateStatus={entry.account ? '' : 'error'}
                            help={entry.account ? '' : 'Account is required'}
                          >
                            <Select
                              placeholder="Select account"
                              value={entry.account}
                              onChange={(value) => {
                                setFieldValue(`journal_entries[${index}].account`, value);
                              }}
                            >
                              {accounts.map((account) => (
                                <Select.Option
                                  key={account.id}
                                  value={account.id}
                                >{account.name}</Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col className='w-[40%]'>
                          <Form.Item
                            validateStatus={entry.amount > 0 ? '' : 'error'}
                            help={entry.amount > 0 ? '' : 'Amount must be positive'}
                          >
                            <InputNumber
                              value={totalSalesPrice}
                              step={0.01}
                              placeholder='Enter amount'
                              min={0}
                              onChange={(value) => {
                                setFieldValue(`journal_entries[${index}].amount`, value)
                              }}
                              className='w-full'
                            />
                          </Form.Item>
                        </Col>
                        <Col className='w-[10%]'>
                          {values.journal_entries.length > 1 && (
                            <Button
                              type="danger"
                              onClick={() => {
                                const updatedEntries = values.journal_entries.filter((_, i) => i !== index);
                                setFieldValue('journal_entries', updatedEntries);
                              }}
                            >
                              <FaTimes className='text-red-500 text-xl' />
                            </Button>
                          )}
                        </Col>
                      </Row>
                    ))}
                    <div className='flex flex-col gap-2 w-full'>
                      <Row className='flex flex-row w-full gap-2'>
                        <Col className='w-[30%]'>
                          <Button
                            type="dashed"
                            className='w-[80%]'
                            onClick={() => {
                              const updatedEntries = [...values.journal_entries, { account: '', debit_credit: 'debit', amount: totalSalesPrice }];
                              setFieldValue('journal_entries', updatedEntries);
                            }}
                          >
                            <FaPlus /> Add Entry
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
                <div className='flex-1 flex flex-col gap-2'>
                  <Row className='flex flex-row w-[100%] justify-between items-start'>
                    <Col className='w-[10%]'><span>No. </span></Col>
                    <Col className='w-[25%]'><span>Item</span></Col>
                    <Col className='w-[25%]'><span>Quantity</span></Col>
                    <Col className='w-[25%]'><span>Sales Price</span></Col>
                    <Col className='w-[15%]'>Remove</Col>
                  </Row>
                  {values.sales_entries.map((entry, index) => (
                    <Row key={index} className='flex flex-row w-full gap-2'>
                      <Col className='w-[10%]'>{index + 1}</Col>
                      <Col className='w-[25%]'>
                        <Form.Item
                          validateStatus={entry.stock ? '' : 'error'}
                          help={entry.stock ? '' : 'Stock item is required'}
                        >
                          <Select
                            placeholder="Select stock item"
                            value={entry.stock}
                            onChange={(value) => setFieldValue(`sales_entries[${index}].stock`, value)}
                          >
                            {stocks.map((stock) => (
                              <Select.Option
                                key={stock.id}
                                value={stock.id}
                              >{stock.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col className='w-[25%]'>
                        <Form.Item
                          validateStatus={entry.sold_quantity > 0 ? '' : 'error'}
                          help={entry.sold_quantity > 0 ? '' : 'Quantity must be positive'}
                        >
                          <InputNumber
                            value={entry.sold_quantity}
                            min={0}
                            onChange={(value) => setFieldValue(`sales_entries[${index}].sold_quantity`, value)}
                            className='w-full'
                          />
                        </Form.Item>
                      </Col>
                      <Col className='w-[25%]'>
                        <Form.Item
                          validateStatus={entry.sales_price > 0 ? '' : 'error'}
                          help={entry.sales_price > 0 ? '' : 'Sales price must be positive'}
                        >
                          <InputNumber
                            value={entry.sales_price}
                            step={0.01}
                            min={0}
                            onChange={(value) => setFieldValue(`sales_entries[${index}].sales_price`, value)}
                            className='w-full'
                          />
                        </Form.Item>
                      </Col>
                      <Col className='w-[15%]'>
                        {values.sales_entries.length > 1 && (
                          <Button
                            type="danger"
                            onClick={() => {
                              const updatedEntries = values.sales_entries.filter((_, i) => i !== index);
                              setFieldValue('sales_entries', updatedEntries);
                            }}
                          >
                            <FaTimes className='text-red-500 text-xl' />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                  <div className='flex flex-col gap-2 w-full'>
                    <Row className='flex flex-row w-full gap-2'>
                      <Col className='w-[30%]'>
                        <Button
                          type="dashed"
                          className='w-[80%]'
                          onClick={() => {
                            const updatedEntries = [...values.sales_entries, { stock: '', sold_quantity: 0, sales_price: 0.0 }];
                            setFieldValue('sales_entries', updatedEntries);
                          }}
                        >
                          <FaPlus /> Add Item
                        </Button>
                      </Col>
                      <Col className='w-[30%]'>
                        <Button
                          type="primary"
                          className='w-[80%]'
                          htmlType="submit"
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Form>
            </div>
          );
        }}
      </Formik>
    </div>
  );
};

export default RecordSales;
