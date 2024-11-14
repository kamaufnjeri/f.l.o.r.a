import React from 'react'
import { dateOptions } from '../../lib/constants'

const DateFilter = ({ handleDatesChange, searchItem }) => {
  return (
    <select 
      className='border-none outline-none' 
      onChange={(e) => handleDatesChange(e)} 
      value={searchItem?.date || ""} 
      title="Select a date range"
    >
     
      <option value="" disabled>
        Select a date range
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
