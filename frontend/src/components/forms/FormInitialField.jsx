import React, { memo } from 'react';
import DateField from './DateField.Jsx';
import { inputContainer } from '../../lib/styles';

const FormInitialField = memo(({ formData, handleChange }) => {
  return (
    <table className='min-w-full'>
      <tbody>
        <tr>
          <td>
          <label htmlFor="description" >Description</label>

          </td>
        
        <td colSpan={2}>
          <textarea
            name='description'
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder={`Enter description`}
            className={`${inputContainer} min-w-full`}
            required
        ></textarea>
        </td>
   
        </tr>
        <tr>
          <td>
          <label htmlFor="date">Date</label>
          </td>
          <td colSpan={3}>
          <DateField  value={formData.date} handleChange={handleChange} name="date" className='w-full'/>

          </td>
        </tr>
      </tbody>
    
    </table>
  );
});

export default FormInitialField;
