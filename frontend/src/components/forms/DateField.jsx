import React, { useEffect, memo, useState } from 'react';
import moment from 'moment';
import { inputContainer } from '../../lib/styles';
import { replaceDash } from '../../lib/helpers';


const defaultMinDate = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
const defaultMaxDate = moment().format('YYYY-MM-DD');

const DateField = memo(({ value, handleChange, name, maxDate = defaultMaxDate, minDate = defaultMinDate }) => {

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        handleChange(name, selectedDate);
    };

    return (
        <input
            className={inputContainer}
            name={name}
            type="date"
            min={minDate} 
            max={maxDate} 
            value={value || ""} 
            onChange={handleDateChange} 
            placeholder={`Select ${replaceDash(name)}`} 
            required 
        />
    );
});

export default DateField;
