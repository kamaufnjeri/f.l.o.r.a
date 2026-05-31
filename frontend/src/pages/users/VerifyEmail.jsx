import React, { useEffect, useState } from 'react';
import UnAuthorizedHeader from '../../components/unauthorized/UnAuthorizedHeader';
import Loading from '../../components/shared/Loading';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

const VerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  const confirmEmail = async () => {
    const url = `${BACKEND_URL}/auth/confirm-email/${uidb64}/${token}/`;
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        setIsEmailVerified(true);
        setIsLoading(false);
        setVerificationMessage(response.data?.message)
        toast.success(response.data?.message || 'Email verified successfully!');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);  // 2-second delay
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error verifying email. It may have expired or is invalid.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    confirmEmail();
  }, []);

  return (
    <>
      <UnAuthorizedHeader />
      <div className="flex items-center justify-center unauthorized-height w-screen absolute top-[60px]">
        {isLoading ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <span className="z-50 bg-black text-white w-[160px] rounded-full h-[160px] flex items-center justify-center">
              Verifying Email...
            </span>
            <Loading />
          </div>
        ) : (
          <div className="text-center">
            {isEmailVerified ? (
              <div>
                <h2 className="text-6xl font-bold text-green-500">{verificationMessage}</h2>
                <p>Redirecting to login...</p>
              </div>
            ) : (
              <h2 className="text-6xl font-bold text-red-500">Email verification failed</h2>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default VerifyEmail;
