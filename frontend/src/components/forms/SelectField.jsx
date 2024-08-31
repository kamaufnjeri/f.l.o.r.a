import React from 'react'
import { capitalizeFirstLetter, replaceDash } from '../../lib/helpers'
import { Form, Select } from 'antd';

const SelectField = ({ value, setFieldValue, name, keyName, options}) => {
    return (
        <Form.Item
            validateStatus={value ? '' : 'error'}
            className='w-full'
            help={value ? '' : `${capitalizeFirstLetter(replaceDash(name))} is required`}
        >
            <Select
            showSearch
                placeholder={`Select ${replaceDash(name)}`}
                name={keyName}
                value={value}
                onChange={(newValue) => {
                    setFieldValue(keyName, newValue);
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                }
            >
                {options.map((option) => (
                    <Select.Option
                        key={option.value}
                        value={option.value}
                    >{option.label}</Select.Option>
                ))}
            </Select>
        </Form.Item>
    )
}

export default SelectField
