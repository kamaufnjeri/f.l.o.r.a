import React from 'react';
import { Row, Col, Button } from 'antd';
import SelectField from '../forms/SelectField';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';

const SalesEntriesField = ({values, setFieldValue, stocks}) => {
  return (
    <div className='flex-1 flex flex-col gap-2'>
                  <Row className='flex flex-row w-[100%] justify-between items-start'>
                    <Col className='w-[10%]'><span>No. </span></Col>
                    <Col className='w-[25%]'><span>Item</span></Col>
                    <Col className='w-[25%]'><span>Quantity</span></Col>
                    <Col className='w-[25%]'><span>Sales Price</span></Col>
                    <Col className='w-[10%]'>Remove</Col>
                  </Row>
                  {values.sales_entries.map((entry, index) => (
                    <Row key={index} className='flex flex-row w-full gap-2'>
                      <Col className='w-[10%]'>{index + 1}</Col>
                      <Col className='w-[25%]'>
                      <SelectField
                    value={entry.stock}
                    name='stock'
                    setFieldValue={setFieldValue}
                    keyName={`sales_entries[${index}].stock`}
                    options={stocks.map((stock) => ({ value: stock.id, label: stock.name }))}
                />
            </Col>
            <Col className='w-[25%]'>
                <InputNumberField
                    value={entry.sold_quantity}
                    step={1}
                    name='quantity'
                    setFieldValue={setFieldValue}
                    keyName={`sales_entries[${index}].sold_quantity`}
                />

            </Col>
            <Col className='w-[25%]'>
                <InputNumberField
                    value={entry.sales_price}
                    step={0.01}
                    name='sales price'
                    setFieldValue={setFieldValue}
                    keyName={`sales_entries[${index}].sales_price`}
                />
            </Col>
                      <Col className='w-[10%]'>
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

                    </Row>
                  </div>
                  
                </div>
  )
}

export default SalesEntriesField
