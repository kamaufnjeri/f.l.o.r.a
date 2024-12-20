import React, { memo } from 'react';
import DateField from './DateField.Jsx';
import { inputContainer } from '../../lib/styles';

const FormInitialField = memo(({ formData, handleChange }) => {
  return (
    <div className='flex flex-col gap-2 w-full'>
      <div className="flex flex-row gap-5 items-start w-full">
        <label htmlFor="description" className="w-[30%]">Description</label>
        
            <textarea
                name='description'
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={`Enter description`}
                className={`${inputContainer} w-[70%]`}
                required
            ></textarea>
       
      </div>
      <div className="flex flex-row gap-5 items-start w-full">
        <label htmlFor="date" className="w-[29%]">Date</label>
        <DateField className="w-[80%]" value={formData.date} handleChange={handleChange} name="date" />
      </div>
    </div>
  );
});

export default FormInitialField;
