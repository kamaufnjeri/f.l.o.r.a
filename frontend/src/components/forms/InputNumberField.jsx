import React from 'react';
import { inputContainer } from '../../lib/styles';

const InputNumberField = ({ value, handleChange, name, index=null, item=false }) => {
    const handleNumberChange = (value) => {
      handleChange(name, value, index, item);

    }
  return (
    <input
      type="number"  
      className={`${inputContainer} w-full`}    
      name={name}
      value={value}
      min={1}
      placeholder={`Enter ${name.replace('_', ' ')}`}  
      onChange={(e) => {
        handleNumberChange(e.target.value)
      }}
      required
    />
  );
};

export default InputNumberField;
