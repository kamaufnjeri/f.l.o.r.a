import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Button, Spin } from 'antd';
import { getItems, patchRequest, postRequest, scrollBottom } from '../../lib/helpers';
import { toast } from 'react-toastify';
import FormHeader from '../../components/forms/FormHeader';
import FormInitialField from '../../components/forms/FormInitialField';
import JournalEntries from '../../components/forms/JournalEntries';
import { useParams } from 'react-router-dom';
import { useSelectOptions } from '../../context/SelectOptionsContext';
import Loading from '../../components/shared/Loading';



const UpdateSingleJournal = () => {
  const scrollRef = useRef(null);
  const { orgId, id } = useParams();
  const { accounts, serialNumbers, getSelectOptions } = useSelectOptions();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getData = async () => {
    setIsLoading(true)
    const journal = await getItems(`${orgId}/journals/${id}`);
    setFormData(journal);
    
    setIsLoading(false)

  }
  useEffect(() => {

    getData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await patchRequest(formData, `${orgId}/journals/${id}`);
    if (response.success) {

      getSelectOptions();

      setFormData(response.data);
      toast.success('Edited: Journal edited successfully');
    } else {
      toast.error(`${response.error}`);
    }
    setIsLoading(false);


  };


  const handleChange = (field, value, index=null) => {
    if (index === null) {
      setFormData((prev) => ({...prev, [field]: value}))
    } else {
      const updatedEntries = [...formData.journal_entries];
      updatedEntries[index][field] = value;
      setFormData((prev) => ({...prev, journal_entries: updatedEntries}));
    }
  };

  useEffect(() => {
    
    scrollBottom(scrollRef);
  }, [formData]);


 

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col font-medium gap-4 w-full max-h-[80vh] min-h-[80vh] overflow-y-auto custom-scrollbar"
      >
        <FormHeader header="Edit journal" />
       {formData ? <form
          className="flex-1 flex flex-col w-full h-full gap-2"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-row justify-between text-gray-800 mr-2">
            <span>Journal No : {formData.serial_number}</span>
          </div>
          <div className="w-[80%]">
            <FormInitialField
              values={formData}
              handleChange={handleChange}
            />
          </div>

          <JournalEntries
            values={formData}
            handleChange={handleChange}
            accounts={accounts}
            isSubmitted={isSubmitted}
          />

          <Button type="primary" className='w-[30%] self-center' htmlType="submit" disabled={isLoading}>
            {isLoading ? <Spin /> : 'Edit'}
          </Button>
        </form> : <Loading/>}
      </div>
    </div>
  );
};

export default UpdateSingleJournal;
