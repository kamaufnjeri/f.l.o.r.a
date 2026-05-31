import { forgotPassword } from "@/app/actions/auth-actions";
import FormWrapper from "@/components/forms/FormWrapper";
import Input from "@/components/forms/Input";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiMail,
  FiShield,
} from "react-icons/fi";

export default function ForgotPasswordPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#f8fafc] px-4 py-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-[-80px] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto h-full w-full max-w-7xl">
        <div className="grid h-full w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">

          {/* Left */}
          <div className="relative hidden overflow-y-auto bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">

            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-white/20" />
              <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full border border-white/10" />
            </div>

            <div className="relative z-10">
              <Link href="/" className="mb-2 flex w-fit items-center gap-2 rounded-2xl bg-white p-2 font-semibold text-primary">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                F.L.O.R.A
              </Link>

              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-md">
                Account Recovery
              </span>

              <h1 className="mt-6 text-5xl font-bold leading-tight">
                Forgot your
                <br />
                password?
              </h1>

              <p className="mt-5 max-w-md text-base text-white/80">
                We’ll send a secure password reset link to your email.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiShield className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Secure Verification</p>
                  <p className="text-sm text-white/70">
                    Reset links expire automatically for safety.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiCheckCircle className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Fast Recovery</p>
                  <p className="text-sm text-white/70">
                    Get back into your account in minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-6 sm:p-10 lg:p-14">

              <div className="w-full max-w-md">

                <Link
                  href="/sign-in"
                  className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
                >
                  <FiArrowLeft />
                  Back to sign in
                </Link>

                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Forgot Password
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter your email to receive a reset link.
                  </p>
                </div>

                <FormWrapper
                  action={forgotPassword}
                  buttonLabel="Send Reset Link"
                  buttonLoadingLabel="Sending Reset Link..."
                >
                  <Input
                    label="Email address"
                    type="email"
                    name="email"
                    icon={<FiMail />}
                    required
                  />
                </FormWrapper>

                <div className="mt-8 text-center text-sm text-gray-500">
                  Remember your password?{" "}
                  <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                    Sign in
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}