import React from 'react';
import { Row, Col, Button } from 'antd';
import SelectField from '../forms/SelectField';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';

const ServiceIncomeEntriesField = ({values, setFieldValue, services}) => {
  return (
    <div className='flex-1 flex flex-col gap-2'>
                  <Row className='flex flex-row w-[100%] justify-between items-start'>
                    <Col className='w-[10%]'><span>No. </span></Col>
                    <Col className='w-[25%]'><span>Service</span></Col>
                    <Col className='w-[25%]'><span>Quantity</span></Col>
                    <Col className='w-[25%]'><span>Price</span></Col>
                    <Col className='w-[10%]'>Remove</Col>
                  </Row>
                  {values.service_income_entries.map((entry, index) => (
                    <Row key={index} className='flex flex-row w-full gap-2'>
                      <Col className='w-[10%]'>{index + 1}</Col>
                      <Col className='w-[25%]'>
                      <SelectField
                    value={entry.service}
                    name='service'
                    setFieldValue={setFieldValue}
                    keyName={`service_income_entries[${index}].service`}
                    options={services.map((service) => ({ value: service.id, label: service.name }))}
                />
            </Col>
            <Col className='w-[25%]'>
                <InputNumberField
                    value={entry.quantity}
                    step={1}
                    name='quantity'
                    setFieldValue={setFieldValue}
                    keyName={`service_income_entries[${index}].quantity`}
                />

            </Col>
            <Col className='w-[25%]'>
                <InputNumberField
                    value={entry.price}
                    step={0.01}
                    name='price'
                    setFieldValue={setFieldValue}
                    keyName={`service_income_entries[${index}].price`}
                />
            </Col>
                      <Col className='w-[10%]'>
                        {values.service_income_entries.length > 1 && (
                          <Button
                            type="danger"
                            onClick={() => {
                              const updatedEntries = values.service_income_entries.filter((_, i) => i !== index);
                              setFieldValue('service_income_entries', updatedEntries);
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
                            const updatedEntries = [...values.service_income_entries, { service: '', quantity: 1, price: 0.0 }];
                            setFieldValue('service_income_entries', updatedEntries);
                          }}
                        >
                          <FaPlus /> Add Service
                        </Button>
                      </Col>

                    </Row>
                  </div>
                  
                </div>
  )
}

export default ServiceIncomeEntriesField
