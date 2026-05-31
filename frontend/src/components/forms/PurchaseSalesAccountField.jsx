import React from 'react';
import SearchableSelectField from './SearchableSelectField';
import { findEntriesByType } from '../../lib/helpers';

const PurchaseSalesAccountField = ({ header, values, handleChange, accounts, isSubmitted = false, type = 'purchase' }) => {
  const entries = findEntriesByType(values, type);
  const entry = entries?.[0]?.entry || {};
  const index = entries?.[0]?.index;



  return (
    <table className="min-w-full mt-1">
      <tbody>
        <tr >
          <td className='p-1'  >
            <h2 className='text-xl font-semibold'>{header}</h2>

          </td>
        </tr>
        <tr>
          <td className='p-1' >
            <SearchableSelectField
              isSubmitted={isSubmitted}
              handleChange={handleChange}
              index={index}
              options={accounts}
              value={entry?.account || ''}
              name="account"
            />
          </td>
        </tr>
      </tbody>

    </table>
  );
};

export default PurchaseSalesAccountField;
