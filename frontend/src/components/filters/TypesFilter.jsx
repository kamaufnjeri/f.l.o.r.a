import React from 'react';
import { capitalizeFirstLetter } from '../../lib/helpers';

const TypesFilter = ({ handleTypesChange, searchItem, selectOptions, type, title='type' }) => {
  return (
    <select 
      className='rounded-md border-gray-800 border p-2 outline-none focus:border-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer'
      value={searchItem[type]} 
      onChange={(e) => handleTypesChange(e)}
    >
      <option value="" disabled>{capitalizeFirstLetter(title)}</option>
      {selectOptions.map((option, index) => (
        <option key={index} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
  );
};

export default TypesFilter;
