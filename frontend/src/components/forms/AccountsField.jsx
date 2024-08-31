// JournalEntries.jsx
import React from 'react';
import { Row, Col, Button } from 'antd';
import SelectField from '../forms/SelectField';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';

const AccountsField = ({ header, values, setFieldValue, accounts, type }) => {
    return (
        <div className='flex flex-col gap-2 w-full'>
            <Row className='flex flex-row w-full text-xl font-bold'><Col className='w-full'><span>
                {header}
            </span>
            </Col></Row>
            <Row className='flex flex-row w-full gap-2'>
                <Col className='w-[40%]'><span>Account</span></Col>
                {values.journal_entries > 1 && (
                    <>
                        <Col className='w-[40%]'><span>Amount</span></Col>
                        <Col className='w-[10%]'>Remove</Col>
                    </>
                )}
            </Row>
            {values.journal_entries.map((entry, index) => (
                <Row key={index} className='flex flex-row w-full gap-2'>
                    <Col className='w-[40%]'>
                        <SelectField
                            value={entry.account}
                            name={`account`}
                            setFieldValue={setFieldValue}
                            options={accounts.map(account => ({ value: account.id, label: account.name }))}
                            keyName={`journal_entries[${index}].account`}
                        />

                    </Col>
                    {values.journal_entries.length > 1 && (
                        <><Col className='w-[40%]'>
                            <InputNumberField
                                value={entry.amount}
                                setFieldValue={setFieldValue}
                                step={0.01}
                                name='amount'
                                keyName={`journal_entries[${index}].amount`}
                            />

                        </Col>
                            <Col className='w-[10%]'>
                                <Button
                                    type="danger"
                                    onClick={() => {
                                        const updatedEntries = values.journal_entries.filter((_, i) => i !== index);
                                        setFieldValue('journal_entries', updatedEntries);
                                    }}
                                >
                                    <FaTimes className='text-red-500 text-xl' />
                                </Button>
                            </Col>
                        </>)}

                </Row>

            ))}
            <div className='flex flex-col gap-2 w-full'>

                <Row className='flex flex-row w-full gap-2'>
                    <Col className='w-[30%]'>
                        <Button
                            type="dashed"
                            className='w-[80%]'
                            onClick={() => {
                                const updatedEntries = [...values.journal_entries, { account: '', debit_credit: type, amount: 0.0 }];
                                setFieldValue('journal_entries', updatedEntries);
                            }}
                        >
                            <FaPlus /> Add Entry
                        </Button></Col>
                </Row>
            </div>
        </div>
    )
}

export default AccountsField
