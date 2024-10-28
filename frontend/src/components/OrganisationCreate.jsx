import React, { useState } from 'react'
import { postRequest } from '../lib/helpers';
import { toast } from 'react-toastify';
import Loading from '../components/shared/Loading';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrganisationCreate = ({ user, setCurrentOrg }) => {
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [organisationData, setOrganisationData] = useState({
        org_name: "",
        org_email: "",
        org_phone_number: "",
        country: "",
        currency: "",
    });
    const navigate  = useNavigate()




    const handleChange = (e, fieldName) => {
        setOrganisationData({ ...organisationData, [fieldName]: e.target.value });
    }

    const handleSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        const response = await postRequest(organisationData, 'organisations');
        if (response.success) {
            toast.success("Registration successful!");
            setOrganisationData({
                org_name: "",
                org_email: "",
                org_phone_number: "",
                country: "",
                currency: "",
            })
            setUser(response.data)
            setCurrentOrg(response.data?.current_organisation)
            navigate(`/dashboard/${response.data.current_organisation.id}`)
        }
        else {
            toast.error(response.error);
        }
        setIsLoading(false);
    }
    return (
        <>
            {(user) && <div
                className='flex-1 flex flex-col font-medium gap-4 w-full items-center justify-center h-full '>
                {isLoading && <Loading />}
                <div className='flex flex-row rounded-md w-full h-[97%] ronded-sm overflow-y-auto custom-scrollbar bg-purple-800'>
                    <div className='flex flex-col items-center text-center justify-center w-1/2 text-white rounded-md'>
                        <img src="/assets/login_img.jpg" alt="Organisation image" className='h-full w-full' />

                    </div>

                    <div className='flex flex-col items-center justify-center w-1/2 gap-3 p-2 bg-white '>
                        <h2 className='font-bold text-2xl'>Create new organisation</h2>
                        <form className='flex flex-col w-full gap-3' onSubmit={handleSubmit}>
                            <div className='flex flex-col'>
                                <label htmlFor="org_name" className='font-bold'>Organisation Name</label>
                                <input required
                                    type="text"
                                    name="org_name"
                                    value={organisationData.org_name}
                                    onChange={(e) => handleChange(e, "org_name")}
                                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800'
                                />
                            </div>
                            <div className='flex flex-col'>
                                <label htmlFor="org_email" className='font-bold'>Organisation Email Address</label>
                                <input required
                                    type="org_email"
                                    name="org_email"
                                    value={organisationData.org_email}
                                    onChange={(e) => handleChange(e, "org_email")}
                                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800' />
                            </div>
                            <div className='flex flex-col'>
                                <label htmlFor="org_phone_number" className='font-bold'>Organisation Phone Number</label>
                                <input required
                                    type="text"
                                    name="org_phone_number"
                                    value={organisationData.org_phone_number}
                                    onChange={(e) => handleChange(e, "org_phone_number")}
                                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800' />
                            </div>
                            <div className='flex flex-col'>
                                <label htmlFor="country" className='font-bold'>Organisation Country</label>
                                <input required
                                    type="text"
                                    name="country"
                                    value={organisationData.country}
                                    onChange={(e) => handleChange(e, "country")}
                                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800' />
                            </div>
                            <div className='flex flex-col'>
                                <label htmlFor="currency" className='font-bold'>Organisation Currency</label>
                                <input required
                                    type="text"
                                    name="currency"
                                    value={organisationData.currency}
                                    onChange={(e) => handleChange(e, "currency")}
                                    className='rounded-md w-full outline-none border-2 border-gray-300 h-[35px] pl-1 focus:border-gray-800' />
                            </div>
                            <div className='flex flex-col'>
                                <button className='h-[35px] bg-purple-600 border-purple-600 text-white font-bold rounded-md mt-2 mb-1 border-2 hover:bg-white hover:text-purple-600'>Create</button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>}</>
    )
}

export default OrganisationCreate
