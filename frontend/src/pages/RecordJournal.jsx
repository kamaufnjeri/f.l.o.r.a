import React, { useEffect, useRef, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Input, InputNumber, Select, DatePicker, Form, Button, Row, Col } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { postRequest } from '../lib/helpers';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;
const { Option } = Select;

const validationSchema = Yup.object({
  date: Yup.date().required('Date is required'),
  description: Yup.string().required('Description is required'),
  journal_entries: Yup.array()
    .of(
      Yup.object().shape({
        account: Yup.string().required('Account is required'),
        debit_credit: Yup.string().required('Debit/Credit is required'),
        amount: Yup.number()
          .required('Amount is required')
          .min(0, 'Amount must be positive'),
      })
    )
    .min(2, 'At least two journal entries are required'),
});

const RecordJournal = () => {
  const [accounts, setAccounts] = useState([]);
  const [entryTypes] = useState(['debit', 'credit']);
  const [debitCreditDiff, setDebitCreditDiff] = useState(0);
  const scrollRef = useRef(null);


  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/accounts/`)
      .then(response => setAccounts(response.data))
      .catch((error) => toast.error(`Error': Error fetching ${name}`))


  }, []);

  const getDebitCreditDiff = (entries) => {
    const totalDebitAmount = entries.reduce((sum, entry) => {
      return entry.debit_credit === 'debit' ? sum + parseFloat(entry.amount || 0) : sum;
    }, 0);

    const totalCreditAmount = entries.reduce((sum, entry) => {
      return entry.debit_credit === 'credit' ? sum + parseFloat(entry.amount || 0) : sum;
    }, 0);

    setDebitCreditDiff(totalDebitAmount - totalCreditAmount);
  };
  const scrollBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }
  return (
    <div className='flex-1 flex flex-col items-center justify-center'>
      <Formik
        initialValues={{
          date: null,
          description: '',
          journal_entries: [
            { account: '', debit_credit: '', amount: 0.0 },
            { account: '', debit_credit: '', amount: 0.0 },
          ],
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          const totalDebitAmount = values.journal_entries.reduce((sum, entry) => {
            return entry.debit_credit === 'debit' ? sum + parseFloat(entry.amount || 0) : sum;
          }, 0);

          const totalCreditAmount = values.journal_entries.reduce((sum, entry) => {
            return entry.debit_credit === 'credit' ? sum + parseFloat(entry.amount || 0) : sum;
          }, 0);

          if (totalDebitAmount === totalCreditAmount) {
            const response = await postRequest(values, 'journals', resetForm)
            if (response.success) {
              toast.success('Recorded: Journal recorded successfully')
            } else {
              toast.error(`Error: ${response.error}`)
            }
          } else {
            let description = 'Debit and credit amounts need to be equal';
            toast.error(`Validation Error: ${description}`)
          }
        }}
      >
        {({ values, setFieldValue, handleChange, handleSubmit }) => {
          useEffect(() => {
            getDebitCreditDiff(values.journal_entries);
            scrollBottom();

          }, [values.journal_entries]);

          return (
            <div
              ref={scrollRef}
              className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'
            >

              <h2 className='text-black-700 text-2xl font-medium mb-5'>Record journal</h2>
              <Form
                className='flex-1 flex flex-col w-full h-full gap-2'
                onFinish={handleSubmit}
              >
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="description" className='w-[10%]'>Description</label>
                  <Form.Item
                    validateStatus={values.description ? '' : 'error'}
                    className='w-[70%]'
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
                <div className='flex flex-row gap-5 items-start'>
                  <label htmlFor="date" className='w-[10%]'>Date</label>
                  <Form.Item
                    validateStatus={values.date ? '' : 'error'}
                    help={values.date ? '' : 'Date is required'}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      placeholder="Select date"
                      value={values.date ? moment(values.date) : null}
                      onChange={(date) => setFieldValue('date', date ? date.format('YYYY-MM-DD') : null)}
                    />
                  </Form.Item>
                </div>
                <Row className='flex flex-row items-start w-[100%] justify-between'>
                  <span className='w-[4%]'>No.</span>
                  <Col className='w-[20%]'>Account</Col>
                  <Col className='w-[20%]'>Debit/Credit</Col>
                  <Col className='w-[20%]'>Amount</Col>
                  <span className='w-[20%]'>Remove</span>
                </Row>
                {values.journal_entries.map((entry, index) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <Row className='flex flex-row items-start justify-between w-[100%]'>
                      <Col className='w-[4%]'>{index + 1}</Col>
                      <Col className='w-[20%]'>
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
                            {accounts.map(account => (
                              <Option key={account.id} value={account.id}>
                                {account.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col className='w-[20%]'>
                        <Form.Item
                          validateStatus={entry.debit_credit ? '' : 'error'}
                          help={entry.debit_credit ? '' : 'Debit/Credit is required'}
                        >
                          <Select
                            placeholder="Select entry type"
                            value={entry.debit_credit}
                            onChange={(value) => {
                              setFieldValue(`journal_entries[${index}].debit_credit`, value);
                            }}
                          >
                            {entryTypes.map((type, i) => (
                              <Option key={i} value={type}>
                                {type}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col className='w-[20%]'>
                        <Form.Item
                          validateStatus={entry.amount > 0 ? '' : 'error'}
                          help={entry.amount > 0 ? '' : 'Amount must be positive'}
                        >
                          <InputNumber
                            min={0}
                            step={0.01}
                            className='w-full'
                            placeholder="Enter amount"
                            value={entry.amount}
                            onChange={(value) => {
                              setFieldValue(`journal_entries[${index}].amount`, value);
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col className='w-[20%]'>
                        {values.journal_entries.length > 2 && (
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
                  </div>
                ))}
                <Row className='flex flex-row w-full gap-5'>
                  <Col className='w-[30%]'>
                    <Button
                      type="dashed"
                      className='w-[80%]'
                      onClick={() => {
                        const updatedEntries = [...values.journal_entries, { account: '', debit_credit: '', amount: 0.0 }];
                        setFieldValue('journal_entries', updatedEntries);
                      }}
                    >
                      <FaPlus /> Add Entry
                    </Button>
                  </Col>
                  <Col className='w-[20%]'>Total Debit/Credit Difference</Col>
                  <Col className='w-[20%]'>
                    <div className='flex justify-end'>
                      <span className={`${debitCreditDiff !== 0 ? 'text-red-500' : ''}`}>Kshs {debitCreditDiff.toFixed(2)}</span>
                    </div>
                  </Col>
                </Row>

                <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                  Record
                </Button>

              </Form></div>
          );
        }}
      </Formik>
    </div>
  );
};

export default RecordJournal;
