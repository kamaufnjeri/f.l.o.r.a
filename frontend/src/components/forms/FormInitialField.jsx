import React from 'react'
import InputField from './InputField'
import DateField from './DateField.Jsx'

const FormInitialField = ({ values, handleChange, setFieldValue }) => {
  return (
    <>
      <div className='flex flex-row gap-5 items-start w-full'>
        <label htmlFor="description" className='w-[15%]'>Description</label>
        <div className='w-[80%]'>
          <InputField value={values.description} name='description' handleChange={handleChange} />

        </div>
      </div>
      <div className='flex flex-row gap-5 items-start w-full '>
        <label htmlFor="date" className='w-[15%]'>Date</label>
        <DateField className='w-[80%]' value={values.date} setFieldValue={setFieldValue} name='date' />
      </div>
    </>
  )
}

export default FormInitialField
