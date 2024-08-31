import React from 'react';
import { Row, Col, Button } from 'antd';
import SelectField from '../forms/SelectField';
import InputNumberField from '../forms/InputNumberField';
import { FaPlus, FaTimes } from 'react-icons/fa';

const PurchaseEntriesFields = ({ values, setFieldValue, stocks}) => {
  return (
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
                <SelectField
                    value={entry.stock}
                    name='stock'
                    setFieldValue={setFieldValue}
                    keyName={`purchase_entries[${index}].stock`}
                    options={stocks.map((stock) => ({ value: stock.id, label: stock.name }))}
                />
            </Col>
            <Col className='w-[25%]'>
                <InputNumberField
                    value={entry.purchased_quantity}
                    step={1}
                    name='quantity'
                    setFieldValue={setFieldValue}
                    keyName={`purchase_entries[${index}].purchased_quantity`}
                />

            </Col>
            <Col className='w-[25%]'>
                <InputNumberField
                    value={entry.purchase_price}
                    step={0.01}
                    name='purchase price'
                    setFieldValue={setFieldValue}
                    keyName={`purchase_entries[${index}].purchase_price`}
                />
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
  )
}

export default PurchaseEntriesFields
