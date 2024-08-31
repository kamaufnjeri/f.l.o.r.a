import { Row } from 'antd'
import React from 'react'
import SelectField from './SelectField'
import DateField from './DateField'
import InputNumberField from './InputNumberField'

const BillContainer = ({ setFieldValue, values, suppliers }) => {
  return (
    <div className='flex flex-col gap-2 w-[50%]'>
      <Row className='w-full flex flex-row gap-5'>
        <label htmlFor="bill.supplier" className='w-[20%]'>Supplier</label>
        <div className='w-[60%]'>
        <SelectField
        options={suppliers.map((supplier) => ({value: supplier.id, label: supplier.name}))}
        name='bill.supplier'
        keyName={`bill.supplier`}
        setFieldValue={setFieldValue}
        value={values.supplier}
        />
        </div> 
      </Row>
      <Row className='w-full flex flex-row gap-5'>
      <label htmlFor="description" className='w-[20%]'>Amount due</label>
        <InputNumberField
        step={0.01}
        setFieldValue={setFieldValue}
        value={values.amount_due}
        keyName={'bill.amount_due'}
        name={'bill.amount_due'}
        />
      </Row>
      <Row className='w-full flex flex-row gap-5'>
      <label htmlFor="description" className='w-[20%]'>Due date</label>

        <DateField value={values.due_date} name='bill.due_date' setFieldValue={setFieldValue}/>
      </Row>
    </div>
  )
}

export default BillContainer
