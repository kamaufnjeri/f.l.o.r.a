import React from 'react';
import { DatePicker, Form } from 'antd';
import moment from 'moment';
import { capitalizeFirstLetter, replaceDash } from '../../lib/helpers';

// Default min and max dates
const defaultMinDate = moment().subtract(1, 'year').startOf('year');
const defaultMaxDate = moment().add(1, 'year').endOf('year');

const DateField = ({ value, setFieldValue, name, maxDate = defaultMaxDate, minDate = defaultMinDate }) => {
    const disabledDate = (current) => {
        return current && (current < minDate || current > maxDate);
    };

    const formatValue = (value) => {
        return value ? moment(value, 'YYYY-MM-DD') : null;
    };

    return (
        <Form.Item
            className=''
            help={!value ? `${capitalizeFirstLetter(replaceDash(name))} is required` : ''}
            validateStatus={value ? '' : 'error'}
        >
            <DatePicker
                name={name}
                disabledDate={disabledDate}
                placeholder={`Select ${replaceDash(name)}`}
                format='YYYY-MM-DD'
                value={formatValue(value)}
                onChange={(date) => setFieldValue(name, date ? date.format('YYYY-MM-DD') : null)}
            />
        </Form.Item>
    );
};

export default DateField;
