"use client";

import { useState } from "react";
import FormWrapper from "../forms/FormWrapper";
import Input from "../forms/Input";
import { FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { acceptInvite } from "@/app/actions/auth-actions";

export default function AcceptInvite({
  uidb64,
}: {
  uidb64: string;
}) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-4 text-center text-sm text-gray-600">
    {!isLogin ? (
        <>
        Have an account already?{" "}
        <button
            onClick={() => setIsLogin(true)}
            className="cursor-pointer font-semibold text-primary hover:underline"
        >
            Sign in
        </button>{" "}
        to accept this invite.
        </>
    ) : (
        <>
        New here?{" "}
        <button
            onClick={() => setIsLogin(false)}
            className="cursor-pointer font-semibold text-primary hover:underline"
        >
            Create an account
        </button>{" "}
        to join the organization.
        </>
    )}
    </div>
       <FormWrapper 
          action={async (formData) => {
            return acceptInvite(uidb64, formData);
          }}
        buttonLabel="Join Organization" buttonLoadingLabel="Joining Organization...">
        {!isLogin && <div className="grid grid-cols-2 gap-3">
            <Input label="First name" name="first_name" icon={<FiUser />} required />
            <Input label="Last name" name="last_name" icon={<FiUser />} required />
        </div>}
        <Input label="Email" type="email" name="email" icon={<FiMail />} required />
        {!isLogin && <Input label="Phone number" name="phone_number" icon={<FiPhone/>} placeholder="e.g +254700000000" />}

        <Input label="Password" type='password' name="password" icon={<FiLock />} required/>

        {!isLogin && <Input label="Confirm password" type='password'  name="confirm_password" icon={<FiLock />} required/>}
<input type="hidden" name="is_login" value={isLogin ? "true" : "false"} />
    </FormWrapper>

      {/* TOGGLE TEXT */}
      <div className="text-center text-sm text-gray-500">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => setIsLogin(false)}
              className="cursor-pointer font-semibold text-primary hover:underline"
            >
              Create
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setIsLogin(true)}
              className="cursor-pointer font-semibold text-primary hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}