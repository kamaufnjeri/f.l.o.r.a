import React from 'react'
import OrganisationCreate from '../components/OrganisationCreate';
import { useAuth } from '../context/AuthContext';

const OrganisationCreatePage = () => {
    const { user, setCurrentOrg } = useAuth();

    return (
        <>
            <div className='flex-1 flex flex-col font-medium gap-4 w-full h-full items-center justify-center'>

                <OrganisationCreate user={user} setCurrentOrg={setCurrentOrg} />
            </div>
        </>



    );
}

export default OrganisationCreatePage
