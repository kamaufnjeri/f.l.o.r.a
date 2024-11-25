import React from 'react';
import { inputContainer } from '../../lib/styles';

const InputNumberField = ({ value, handleChange, name, index=null }) => {
    const handleNumberChange = (value) => {
        if (index !== null) {
            handleChange(name, value, index);
        }
    }
  return (
    <input
      type="number"  
      className={`${inputContainer} w-full`}    
      name={name}
      value={value}
      min={1}
      placeholder={`Enter ${name.replace('-', ' ')}`}  
      onChange={(e) => {
        handleNumberChange(e.target.value)
      }}
      required
    />
  );
};

export default InputNumberField;
