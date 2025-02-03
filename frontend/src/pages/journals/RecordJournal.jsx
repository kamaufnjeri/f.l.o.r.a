import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Button, Spin } from 'antd';
import { postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../../components/forms/FormHeader';
import FormInitialField from '../../components/forms/FormInitialField';
import JournalEntries from '../../components/forms/JournalEntries';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import SubHeader from '../../components/shared/SubHeader';



const RecordJournal = () => {
  const scrollRef = useRef(null);
  const { orgId } = useParams();
  const { accounts, serialNumbers, getSelectOptions } = useSelectOptions();
  const [formData, setFormData] = useState({
    date: null,
    description: '',
    serial_number: '',
    journal_entries: [
      { account: null, debit_credit: null, amount: 0, type: 'journal' },
      { account: null, debit_credit: null, amount: 0, type: 'journal' },
    ]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await postRequest(formData, `${orgId}/journals`);
    if (response.success) {
      setIsSubmitted(true);

      getSelectOptions();

      setFormData({
        date: null,
        description: '',
        serial_number: serialNumbers.journal,
        journal_entries: [
          { account: null, debit_credit: null, amount: 0, type: 'journal' },
          { account: null, debit_credit: null, amount: 0, type: 'journal' },
        ]
      });
      toast.success('Recorded: Journal recorded successfully');
      setTimeout(() => setIsSubmitted(false), 500);
    } else {
      toast.error(`${response.error}`);
    }
    setIsLoading(false);


  };


  const handleChange = (field, value, index = null) => {
    if (index === null) {
      setFormData((prev) => ({ ...prev, [field]: value }))
    } else {
      const updatedEntries = [...formData.journal_entries];
      updatedEntries[index][field] = value;
      setFormData((prev) => ({ ...prev, journal_entries: updatedEntries }));
    }
  };

  useEffect(() => {

    scrollBottom(scrollRef);
  }, [formData.journal_entries]);


  useEffect(() => {
    setFormData((prev) => ({ ...prev, serial_number: serialNumbers.journal }));
  }, [serialNumbers, orgId]);

  return (
    <div className="flex flex-col items-start justify-start h-full gap-2 w-full text-gray-800">
      <div ref={scrollRef} className="flex flex-col font-medium gap-2 w-full">
        <SubHeader account={true} />
        <FormHeader header="Record journal" />
        <form className="flex flex-col gap-2 shadow-md rounded-md p-2" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-between text-gray-800 mr-2">
            <span className='font-semibold text-xl'>Journal No : {serialNumbers.journal}</span>
          </div>
          <FormInitialField
            formData={formData}
            handleChange={handleChange}
          />
          <JournalEntries
            formData={formData}
            handleChange={handleChange}
            accounts={accounts}
            isSubmitted={isSubmitted}
          />
          <Button type="primary" className='w-[30%] self-center' htmlType="submit" disabled={isLoading}>
            {isLoading ? <Spin /> : 'Record'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecordJournal;
