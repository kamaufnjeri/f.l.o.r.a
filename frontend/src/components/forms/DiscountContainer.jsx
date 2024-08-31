import React, { useEffect } from 'react'
import { Form, InputNumber } from 'antd'

const DiscountContainer = ({ values, setFieldValue, type, totalPrice }) => {
    
const setDiscountFields = (percentage=0.00, amount=0.00 ) => {
    let discount_amount = amount;
    let discount_percentage = percentage;
    if (discount_percentage > 0.00 && discount_amount <= 0.00) {
      discount_amount = (discount_percentage * totalPrice) / 100
    } else if (discount_amount > 0.00 && discount_percentage <= 0.00) {
      discount_percentage = ((discount_amount / totalPrice) * 100).toFixed(2);
    }
    setFieldValue(type, {discount_percentage, discount_amount})
  }
    return (
        <div className='flex flex-row gap-2 w-full justify-end pr-5'>
            <span className='font-bold w-[10%]'>Discount</span>
            <div className='w-[30%] flex flex-row gap-2'>
                <label htmlFor="discount_percentage" className='w-[30%]'>Discount rate</label>
                <Form.Item
                    validateStatus={values.discount_percentage >= 0 ? '' : 'error'}
                    help={values.discount_percentage >= 0 ? '' : 'Discount rate must be positive'}
                >
                    <InputNumber
                        value={values.discount_percentage}
                        step={1}
                        max={100}
                        defaultValue={values.discount_percentage}
                        placeholder='Enter discount rate'
                        min={0}
                        onChange={(newValue) => {
                            setDiscountFields(newValue, 0.00)
                        }}
                        className='w-full'
                    />
                </Form.Item>
             <span> %</span>
            </div ><div className='w-[30%] flex flex-row gap-2'>
                <label htmlFor="discount_percentage" className='w-[30%]'>Discount amount</label>
                <Form.Item
                    validateStatus={values.discount_amount >= 0 ? '' : 'error'}
                    help={values.discount_amount >= 0 ? '' : 'Discount amount must be positive'}
                >
                    <InputNumber
                        value={values.discount_amount}
                        step={1}
                        defaultValue={values.discount_amount}
                        placeholder='Enter discount amount'
                        min={0}
                        onChange={(newValue) => {
                            setDiscountFields(0.00, newValue)                            
                        }}
                        className='w-full'
                    />
                </Form.Item>
               
            </div>
        </div>
    )
}

export default DiscountContainer
