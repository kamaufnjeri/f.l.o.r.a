import { signUp } from "@/app/actions/auth-actions";
import { FiUser, FiMail, FiLock, FiPhone } from "react-icons/fi";
import FormWrapper from "@/components/forms/FormWrapper";
import Input from "@/components/forms/Input";

function SignUpForm() {
  return (
    <FormWrapper action={signUp} buttonLabel="Create Account" buttonLoadingLabel="Creating Account ...">
        <div className="grid grid-cols-2 gap-3">
            <Input label="First name" name="first_name" icon={<FiUser />} required />
            <Input label="Last name" name="last_name" icon={<FiUser />} required />
        </div>

        <Input label="Email" type="email" name="email" icon={<FiMail />} required />
        <Input label="Phone number" name="phone_number" icon={<FiPhone />} placeholder="e.g +254700000000" />

        <Input label="Password" type='password' name="password" icon={<FiLock />} required/>

        <Input label="Confirm password" type='password'  name="confirm_password" icon={<FiLock />} required/>
    </FormWrapper>
  )
}

export default SignUpForm
