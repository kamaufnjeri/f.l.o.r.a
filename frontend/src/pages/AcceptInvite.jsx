import React, { useState } from 'react'
import UnAuthorizedHeader from '../components/unauthorized/UnAuthorizedHeader'
import LoginComponent from '../components/LoginComponent'
import Loading from '../components/shared/Loading';
import { Link, useParams } from 'react-router-dom';
import InviteLogin from '../components/InviteLogin';
import InviteRegister from '../components/InviteRegister';

const AcceptInvite = () => {
   const [isLogin, setIsLogin] = useState(true);
   const { uidb64  } = useParams();
  return (
    <> {
        isLogin ? <InviteLogin setIsLogin={setIsLogin} uidb64={uidb64}/> : <InviteRegister setIsLogin={setIsLogin} uidb64={uidb64} />
    }</>
  )
}

export default AcceptInvite
