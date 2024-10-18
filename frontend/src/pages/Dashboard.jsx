import React from 'react';
import { useAuth } from '../context/AuthContext';
import OrganisationCreate from '../components/OrganisationCreate';
import OrganisationInviteEmail from '../components/OrganisationInviteEmail';

const Dashboard = () => {
    const { user, currentOrg, setCurrentOrg } = useAuth();

    return (
        <div className='flex-1 flex flex-col font-medium gap-4 w-full h-full items-center justify-center'>
            {user ? (
                currentOrg ? (
                    <div>
                        <span className='text-purple-800 bold text-xl'>{user.email} current organsiation is {currentOrg.org_name}</span>
                        <div className='w-[50%] flex flex-col items-center justify-center'>
                            <OrganisationInviteEmail/>
                        </div>
                    </div>
                ) : (
                      <OrganisationCreate user={user}  setCurrentOrg={setCurrentOrg}/>
                )
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default Dashboard;
