import React from 'react'
import { capitalizeFirstLetter, replaceDash } from '../../lib/helpers'
import { Form, InputNumber } from 'antd'

const InputNumberField = ({value, setFieldValue, name, step, keyName }) => {
    const isValid = value > 0;
    const validateStatus = isValid ? '' : 'error';
    const helpMessage = isValid ? '' : `${capitalizeFirstLetter(replaceDash(name))} must be positive`;

    return (
        <Form.Item
            validateStatus={validateStatus}
            help={helpMessage}
        >
            <InputNumber
                name={keyName}
                value={value}
                step={step}
                placeholder={`Enter ${replaceDash(name)}`}
                min={0}
                onChange={(newValue) => {
                    setFieldValue(keyName, newValue);
                }}
                className='w-full'
            />
        </Form.Item>
    );
}

export default InputNumberField


