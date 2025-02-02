import React from 'react'
import { sortOptions } from '../../lib/constants'

const SortFilter = ({ handleSortsChange, searchItem }) => {
  return (
    <select 
      className='rounded-md border-gray-800 border p-2 outline-none focus:border-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer' 
      value={searchItem.sortBy} 
      onChange={(e) => handleSortsChange(e)}
      title="Select sorting option" 
    >
      <option value="" disabled>
        Sort by
      </option>

      {sortOptions.map((option, index) => (
        <option key={index} value={option.value}>{option.name}</option>
      ))}
    </select>
  )
}

export default SortFilter;
