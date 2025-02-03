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
import SubHeader from '../../components/shared/SubHeader';



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
  }, [orgId, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await patchRequest(formData, `${orgId}/journals/${id}`);
    if (response.success) {
      getSelectOptions();

      setIsSubmitted(true);
      setFormData(response.data);
      toast.success('Edited: Journal edited successfully');
      setTimeout(() => setIsSubmitted(false), 500);

    } else {
      toast.error(`${response.error}`);
      getData();
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
  }, [formData?.journal_entries]);


 

  return (
    <div className="flex flex-col items-start justify-start h-full gap-2 w-full text-gray-800">
      <div ref={scrollRef} className="flex flex-col font-medium gap-2 w-full">
        <SubHeader account={true} />
        <FormHeader header="Edit journal" />
       {formData ?  <form className="flex flex-col gap-2 shadow-md rounded-md p-2" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-between text-gray-800 mr-2">
            <span className='font-semibold text-xl'>Journal No : {formData.serial_number}</span>
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
            {isLoading ? <Spin /> : 'Edit'}
          </Button>
        </form> : <Loading/>}
      </div>
    </div>
  );
};

export default UpdateSingleJournal;
