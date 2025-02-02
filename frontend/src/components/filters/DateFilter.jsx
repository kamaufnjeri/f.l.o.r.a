import React from 'react'
import { dateOptions } from '../../lib/constants'

const DateFilter = ({ handleDatesChange, searchItem }) => {
  return (
    <select 
      className='rounded-md border-gray-800 border p-2 outline-none focus:border-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer' 
      onChange={(e) => handleDatesChange(e)} 
      value={searchItem?.date || ""} 
      title="Date range"
    >
     
      <option value="" disabled>
        Date range
      </option>

      {dateOptions.map((option, index) => (
        <option key={index} value={option.value}>{option.name}</option>
      ))}

      {searchItem?.date && !searchItem.date.includes('today') && searchItem.date.includes('to') && (
        <option value={searchItem.date}>From {searchItem.date.replace('to', ' to ')}</option>
      )}
    </select>
  )
}

export default DateFilter
