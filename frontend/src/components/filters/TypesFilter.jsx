import React from 'react';

const TypesFilter = ({ handleTypesChange, searchItem, selectOptions, type, title='type' }) => {
  return (
    <select 
      className='border-none outline-none' 
      value={searchItem[type]} 
      onChange={(e) => handleTypesChange(e)}
    >
      <option value="" disabled>Select {title}</option>
      {selectOptions.map((option, index) => (
        <option key={index} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
  );
};

export default TypesFilter;
