import React from 'react'
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa'

const PrevNext = ({ pageNo, data, nextPage, previousPage}) => {
  return (
    <div className='cursor-pointer w-full z-3 p-1 relative'>
        <div className='flex flex-row gap-2 absolute -bottom-5 right-1'>
        <FaAngleDoubleLeft onClick={previousPage} className={`text-2xl  ${data.previous ? 'opacity-100' : 'opacity-50 pointer-events-none'}`} />
        <span className='rounded-lg bg-gray-800 text-white h-6 flex items-center justify-center text-xl font-bold w-6'>{pageNo}</span>
         <FaAngleDoubleRight onClick={nextPage} className={`text-2xl  ${data.next ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}/>
        </div>
        
      </div>)
}

export default PrevNext
