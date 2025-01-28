import React from 'react'
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa'

const PrevNext = ({ pageNo, data, nextPage, previousPage }) => {
  return (
    <div className='cursor-pointer z-3 p-1'>
      <div className='flex flex-row gap-2 items-center'>
        <FaAngleDoubleLeft onClick={previousPage} className={`text-2xl  ${data.previous ? 'opacity-100' : 'opacity-50 pointer-events-none'}`} />
        <span className='rounded-full bg-gray-800 text-white h-8 flex items-center justify-center text-xl font-bold w-8'>{pageNo}</span>
        <FaAngleDoubleRight onClick={nextPage} className={`text-2xl  ${data.next ? 'opacity-100' : 'opacity-50 pointer-events-none'}`} />
      </div>

    </div>
  )
}

export default PrevNext
