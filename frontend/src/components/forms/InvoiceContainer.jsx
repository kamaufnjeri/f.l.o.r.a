import { Row } from 'antd'
import React from 'react'
import SelectField from './SelectField'
import DateField from './DateField'
import InputNumberField from './InputNumberField'
import moment from 'moment'

const InvoiceContainer = ({ setFieldValue, values, customers }) => {
  return (
    <div className='flex flex-col gap-2 w-[50%]'>
      <Row className='w-full flex flex-row gap-5'>
        <label htmlFor="invoice.customer" className='w-[20%]'>Customer</label>
        <div className='w-[60%]'>
        <SelectField
        options={customers.map((customer) => ({value: customer.id, label: customer.name}))}
        name='invoice.customer'
        keyName={`invoice.customer`}
        setFieldValue={setFieldValue}
        value={values.customer}
        />
        </div>   
        
      </Row>
      <Row className='w-full flex flex-row gap-5'>
      <label htmlFor="description" className='w-[20%]'>Amount due</label>

        <InputNumberField
        step={0.01}
        setFieldValue={setFieldValue}
        value={values.amount_due}
        keyName={'invoice.amount_due'}
        name={'invoice.amount_due'}
        />
      </Row>
      <Row className='w-full flex flex-row gap-5'>
      <label htmlFor="description" className='w-[20%]'>Due date</label>

        <DateField value={values.due_date} name='invoice.due_date' setFieldValue={setFieldValue}/>
      </Row>
    </div>
  )
}

export default InvoiceContainer
