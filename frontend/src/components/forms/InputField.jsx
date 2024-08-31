import React from 'react'
import { capitalizeFirstLetter, replaceDash } from '../../lib/helpers'
import { Form, Input } from 'antd'

const InputField = ({value, handleChange, name}) => {
    return (
        <Form.Item
            className='w-full'
            help={value ? '' : `${capitalizeFirstLetter(replaceDash(name))} is required`}
            validateStatus={value ? '' : 'error'}
        >
            <Input.TextArea
                name={replaceDash(name)}
                value={value}
                onChange={handleChange}
                placeholder={`Enter ${name}`}
            />
        </Form.Item>
    )
}

export default InputField
