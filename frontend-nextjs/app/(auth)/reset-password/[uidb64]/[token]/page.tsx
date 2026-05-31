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
    <main className="relative h-screen overflow-hidden bg-[#f8fafc] px-4 py-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-[-120px] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-100px] h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
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

              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
                Secure Password Recovery
              </span>

              <h1 className="mt-6 text-5xl font-bold leading-tight">
                Create a
                <br />
                new password
              </h1>

              <p className="mt-5 max-w-md text-base text-white/80">
                Choose a strong password you don’t reuse anywhere else.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiShield className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Encrypted</p>
                  <p className="text-sm text-white/70">
                    Your data is securely protected.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiCheckCircle className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Instant Update</p>
                  <p className="text-sm text-white/70">
                    Password updates take effect immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-6 sm:p-10 lg:p-8">

              <div className="w-full max-w-md">

                <Link
                  href="/sign-in"
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
                >
                  <FiArrowLeft />
                  Back to sign in
                </Link>

                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Reset Password
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter your new password below.
                  </p>
                </div>

                <FormWrapper
                  action={async (formData) => {
                    "use server";
                    return resetPassword(resolvedParams.uidb64, resolvedParams.token, formData);
                  }}
                  buttonLabel="Reset Password"
                  buttonLoadingLabel="Updating..."
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

                <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                  Use at least 8 characters with numbers and symbols.
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}