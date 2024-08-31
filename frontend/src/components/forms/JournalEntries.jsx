import React, { useState } from 'react'
import { Row, Col, Button } from 'antd';
import SelectField from '../forms/SelectField';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { capitalizeFirstLetter } from '../../lib/helpers';

const JournalEntries = ({values, setFieldValue, accounts, debitCreditDiff, minLength=2 }) => {
    const [entryTypes] = useState(['debit', 'credit']);

  return (
    <>
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
                        <SelectField
                         value={entry.account}
                         name='account'
                         setFieldValue={setFieldValue}
                         keyName={`journal_entries[${index}].account`}
                        options={accounts.map((account) => ({value: account.id, label: account.name}))}
                        />
                       
                      </Col>
                      <Col className='w-[20%]'>
                      <SelectField
                        value={entry.debit_credit}
                        name='debit_credit'
                        setFieldValue={setFieldValue}
                        keyName={`journal_entries[${index}].debit_credit`}
                        options={entryTypes.map((entry) => ({value: entry, label: capitalizeFirstLetter(entry)}))}
                        />
                        
                      </Col>
                      <Col className='w-[20%]'>
                        <InputNumberField
                        value={entry.amount}
                        name='amount'
                        setFieldValue={setFieldValue}
                        step={0.01}
                        keyName={`journal_entries[${index}].amount`}
                        />
                       
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
                  </Col>{
                    
                  }
                  <Col className='w-[20%]'>Total Debit/Credit Difference</Col>
                  <Col className='w-[20%]'>
                    <div className='flex justify-end'>
                      <span className={`${debitCreditDiff !== 0 ? 'text-red-500' : ''}`}>Kshs {debitCreditDiff.toFixed(2)}</span>
                    </div>
                  </Col>
                </Row>
    </>
  )
}

export default JournalEntries
