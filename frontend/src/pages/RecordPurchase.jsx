import React, { useEffect, useState } from 'react'
import { notification, Form, Input, DatePicker, Row, Col, Select, InputNumber, Button } from 'antd';
import axios from 'axios';
import * as Yup from 'yup'
import { Formik } from 'formik';
import moment from 'moment';
import { FaPlus, FaTimes } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;
const validationSchema = Yup.object({
    date: Yup.date().required('Date is required'),
    description: Yup.string().required('Description is required'),
    purchase_entries: Yup.array()
        .of(
            Yup.object().shape({
                stock: Yup.string().required('Stock item is required'),
                purchased_quantity: Yup.number()
                    .required('Quantity is required')
                    .min(0, 'Quantity must be positive'),
                purchase_price: Yup.number()
                    .required('Purchase price is required')
                    .min(0, 'Purchase price must be positive')
            })
        )
        .min(1, 'At least one purchase entry are required'),
    journal_entries: Yup.array()
        .of(
            Yup.object().shape({
                account: Yup.string().required('Account is required'),
                amount: Yup.number().required('Amount is required')
                    .min(0, 'Amount must be positive'),
                debit_credit: Yup.string().required('Debit/Credit is required')
            })
        ).min(1, 'At least one journal entry are required')
});
const RecordPurchase = () => {
    const [stocks, setStocks] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);

    const getTotalPurchasePrice = (items) => {
        if (items) {
            const purchasePriceTotal = items.reduce(
                (total, item) => total + (parseFloat(item.purchased_quantity) * parseFloat(item.purchase_price)),
                0
            );
            return purchasePriceTotal;
        }
        return 0;
    };


    const getItems = (name) => {
        axios.get(`${BACKEND_URL}/${name}/`)
            .then((response) => {
                if (name === 'accounts') {
                    setAccounts(response.data)
                } else {
                    setStocks(response.data)
                }
            })
            .catch((error) => notification.error({
                message: 'Error',
                description: `Error fetching ${name}`
            }))
    }

    useEffect(() => {
        getItems('accounts');
        getItems('stocks');
    }, [])

    return (
        <div className='flex-1 flex flex-col items-center justify-center'>
            <Formik
                initialValues={{
                    date: null,
                    description: '',
                    purchase_entries: [
                        { stock: '', purchased_quantity: 0, purchase_price: 0.0 }
                    ],
                    journal_entries: [
                        { account: '', debit_credit: 'credit', amount: 0.0 }
                    ]
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                    const creditTotalAmount = values.journal_entries.reduce((sum, entry) => {
                        return sum + parseFloat(entry.amount || 0);
                      }, 0);
                    const purchasePriceTotal = getTotalPurchasePrice(values.purchase_entries);
                      if (purchasePriceTotal === creditTotalAmount) {
                        axios
                          .post(`${BACKEND_URL}/purchases/`, values)
                          .then(response => {
                            if (response.status === 201) {
                              resetForm();
                              notification.success({
                                message: 'Success',
                                description: 'Purchase recorded successfully!',
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
                          description: 'Amount to be paid and discount must be equal to total purchase price',
                        });
                      }
                    }}
                  >
                  
                {({ values, setFieldValue, handleChange, handleSubmit }) => {
                     useEffect(() => {
                        const purchasePriceTotal = getTotalPurchasePrice(values.purchase_entries) || 0.00;
                        setTotalPurchasePrice(purchasePriceTotal);
                        const updatedJournalEntries = values.journal_entries.map(entry => ({
                            ...entry,
                            amount: purchasePriceTotal
                        }));
                        setFieldValue('journal_entries', updatedJournalEntries);
                    }, [values.purchase_entries]);
                    return (<div className='flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] h-full overflow-y-auto custom-scrollbar'>
                        <h2 className='text-black-700 text-2xl font-medium mb-5'>Record Purchase</h2>

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
                                    <Row className='flex flex-row w-full text-xl font-bold'><Col className='w-full'><span>
                                        Purchase Payment and Discount Accounts
                                    </span>
                                    </Col></Row>
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
                                                        value={entry.amount}
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
                                                        const updatedEntries = [...values.journal_entries, { account: '', debit_credit: 'credit', amount: 0.0 }];
                                                        setFieldValue('journal_entries', updatedEntries);
                                                    }}
                                                >
                                                    <FaPlus /> Add Entry
                                                </Button></Col>
                                        </Row>
                                    </div>
                                </div>

                            </div>
                            <div className='flex-1 flex flex-col gap-2'>
                                <Row className='flex flex-row w-[100%] justify-between items-start'>
                                    <Col className='w-[10%]'><span>No. </span></Col>
                                    <Col className='w-[25%]'><span>Item</span></Col>
                                    <Col className='w-[25%]'><span>Quantity</span></Col>
                                    <Col className='w-[25%]'><span>Purchase price</span></Col>
                                    <Col className='w-[10%]'>Remove</Col>
                                </Row>

                                {values.purchase_entries.map((entry, index) => (
                                    <Row key={index} className='flex flex-row w-full gap-3'>
                                        <Col className='w-[10%]'><span>{index + 1}</span></Col>
                                        <Col className='w-[25%]'>
                                            <Form.Item
                                                validateStatus={entry.stock ? '' : 'error'}
                                                help={entry.stock ? '' : 'Item is required'}
                                            >
                                                <Select
                                                    placeholder="Select Item"
                                                    value={entry.stock}
                                                    onChange={(value) => {
                                                        setFieldValue(`purchase_entries[${index}].stock`, value);
                                                    }}
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
                                                validateStatus={entry.purchased_quantity > 0 ? '' : 'error'}
                                                help={entry.purchased_quantity > 0 ? '' : 'Quantity must be positive'}
                                            >
                                                <InputNumber
                                                    value={entry.purchased_quantity}
                                                    step={1}
                                                    placeholder='Enter quantity'
                                                    min={0}
                                                    onChange={(value) => {
                                                        setFieldValue(`purchase_entries[${index}].purchased_quantity`, value)
                                                    }}
                                                    className='w-full'
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col className='w-[25%]'>
                                            <Form.Item
                                                validateStatus={entry.purchase_price > 0 ? '' : 'error'}
                                                help={entry.purchase_price > 0 ? '' : 'Purchase price must be positive'}
                                            >
                                                <InputNumber
                                                    value={entry.purchase_price}
                                                    step={0.01}
                                                    placeholder='Enter purchase price'
                                                    min={0}
                                                    onChange={(value) => {
                                                        setFieldValue(`purchase_entries[${index}].purchase_price`, value)
                                                    }}
                                                    className='w-full'
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col className='w-[10%]'>
                                            {values.purchase_entries.length > 1 && (
                                                <Button
                                                    type="danger"
                                                    onClick={() => {
                                                        const updatedEntries = values.purchase_entries.filter((_, i) => i !== index);
                                                        setFieldValue('purchase_entries', updatedEntries);
                                                    }}
                                                >
                                                    <FaTimes className='text-red-500 text-xl' />
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>

                                ))}
                                <Row className='flex flex-row w-full gap-2'>
                                    <Col className='w-[30%]'>
                                        <Button
                                            type="dashed"
                                            className='w-[80%]'
                                            onClick={() => {
                                                const updatedEntries = [...values.purchase_entries, { stock: '', purchased_quantity: 0, purchase_price: 0.0 }];
                                                setFieldValue('purchase_entries', updatedEntries);
                                            }}
                                        >
                                            <FaPlus /> Add Entry
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                            <Button type="primary" className='w-[30%] self-center' htmlType="submit">
                                Record
                            </Button>
                        </Form>
                    </div>)
                }}
            </Formik>
        </div>
    )
}

export default RecordPurchase
