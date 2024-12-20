import React from 'react';
import SearchableSelectField from './SearchableSelectField';
import { findEntriesByType } from '../../lib/helpers';

const PurchaseSalesAccountField = ({ header, values, handleChange, accounts, isSubmitted = false, type='purchase' }) => {
  const entries = findEntriesByType(values, type);
  const entry = entries?.[0]?.entry || {};
  const index = entries?.[0]?.index;



  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="w-full flex flex-row text-xl font-bold h-6">
        <h2>{header}</h2>
      </div>

      <div className="flex flex-row gap-5 items-start w-full">
        <span className="w-full">
          <SearchableSelectField
            isSubmitted={isSubmitted}
            handleChange={handleChange}
            index={index}
            options={accounts}
            value={entry?.account || ''}
            name="account"
          />
        </span>
      </div>
    </div>
  );
};

export default PurchaseSalesAccountField;
