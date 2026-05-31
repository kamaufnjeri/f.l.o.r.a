import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { postRequest } from '../lib/helpers';
import Loading from './shared/Loading';
import { toast } from 'react-toastify';

const OrganisationInviteEmail = () => {
  const [inviteEmails, setInviteEmails] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e, index) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = e.target.value;
    setInviteEmails(newEmails);
  }

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const response = await postRequest(inviteEmails, `organisations/send-invite`);
    if (response.success) {
        toast.success("Invitations sent successful");
        setInviteEmails([''])
    }
    else {
        toast.error(response.error);
    }
    setIsLoading(false);
  }

  const addAnotherEmail = (e) => {
    e.preventDefault();
    setInviteEmails([...inviteEmails, '']);
  }

  const removeEmail = (index) => {
    const newEmails = inviteEmails.filter((_, i) => i !== index);
    setInviteEmails(newEmails);
  }

  return (
    <div className='flex flex-col items-center justify-center w-full'>
      {isLoading && <Loading/>}
      <form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full'>
        <h2>Enter email(s) to send invite link</h2>
        {inviteEmails && inviteEmails.map((email, index) => (
          <div className='flex flex-row gap-2 items-start justify-start' key={index}>
            <input
              required
              placeholder='e.g johndoe@gmail.com'
              type="email"
              name="email"
              value={email}
              onChange={(e) => handleChange(e, index)}
              className='rounded-md w-[80%] outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800' 
            />
            {inviteEmails.length > 1 && (
              <FaTimes 
                className='text-red-500 font-bold text-xl hover:bg-gray-200 rounded-full w-[30px] h-[30px] p-1' 
                onClick={() => removeEmail(index)} 
              />
            )}
          </div>
        ))}

        <div className='flex flex-col'>
          <button 
            onClick={(e) => addAnotherEmail(e)}
            className='h-[35px] w-[60%]  border-blue-600 text-blue-600 font-bold rounded-md mt-2 mb-1 border-dashed border-2 hover:bg-blue-600 hover:text-white'>
            Add another email
          </button>
        </div>
        <div className='flex flex-col'>
          <button 
            type='submit'
            className='h-[35px] bg-purple-600 border-purple-600 text-white font-bold rounded-md mt-2 mb-1 border-2 hover:bg-white hover:text-purple-600'>
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrganisationInviteEmail;
