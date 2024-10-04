import React from 'react'
import { sortOptions } from '../../lib/constants'

const SortFilter = ({ handleSortsChange, searchItem }) => {
  return (
    <select 
      className='border-none outline-none' 
      value={searchItem.sortBy} 
      onChange={(e) => handleSortsChange(e)}
      title="Select sorting option" // Title for the select element
    >
      <option value="" disabled>
        Select sorting option {/* Placeholder option */}
      </option>

      {sortOptions.map((option, index) => (
        <option key={index} value={option.value}>{option.name}</option>
      ))}
    </select>
  )
}

export default SortFilter;