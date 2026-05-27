import { resetPassword } from "@/app/actions/auth-actions";
import FormWrapper from "@/components/forms/FormWrapper";
import Input from "@/components/forms/Input";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiLock, FiShield } from "react-icons/fi";

export default async function ResetPasswordPage({
  params,
}: {
  params:
    | { uidb64: string; token: string }
    | Promise<{ uidb64: string; token: string }>;
}) {
  const resolvedParams = params instanceof Promise ? await params : params;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] px-4 py-10">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-[-120px] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-100px] h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">

          {/* Left Side */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">

            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-white/20" />
              <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full border border-white/10" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-md">
                Secure Password Recovery
              </span>

              <h1 className="mt-6 text-5xl font-bold leading-tight">
                Create a
                <br />
                fresh password
              </h1>

              <p className="mt-5 max-w-md text-base text-white/80">
                Your security matters. Use a strong password that you don’t
                reuse on other websites.
              </p>
            </div>

            <div className="relative z-10 space-y-4">

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiShield className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Encrypted & Secure</p>
                  <p className="text-sm text-white/70">
                    Your credentials are protected using secure authentication.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiCheckCircle className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Instant Access</p>
                  <p className="text-sm text-white/70">
                    Reset your password and continue where you left off.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">

            <div className="w-full max-w-md">

              <Link
                href="/sign-in"
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-primary"
              >
                <FiArrowLeft />
                Back to sign in
              </Link>

              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Reset Password
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Enter your new password below to regain access to your
                  account.
                </p>
              </div>

              <FormWrapper
                action={async (formData) => {
                  "use server";
                  return resetPassword(
                    resolvedParams.uidb64,
                    resolvedParams.token,
                    formData
                  );
                }}
                buttonLabel="Reset Password"
                buttonLoadingLabel="Updating Password..."
              >
                <div className="space-y-5">

                  <Input
                    label="New password"
                    type="password"
                    name="password"
                    icon={<FiLock />}
                    required
                  />

                  <Input
                    label="Confirm password"
                    type="password"
                    name="confirm_password"
                    icon={<FiLock />}
                    required
                  />

                </div>
              </FormWrapper>

              <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Choose a password with at least 8 characters including a mix
                  of letters, numbers, and symbols.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}