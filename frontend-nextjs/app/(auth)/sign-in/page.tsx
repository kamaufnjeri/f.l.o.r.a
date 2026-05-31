import LoginForm from "@/components/auth/SignInForm";
import Link from "next/link";
import {
  FiCheckCircle,
  FiShield,
  FiStar,
} from "react-icons/fi";

export default function SignInPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#f8fafc] px-4 py-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-80px] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
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
              <Link
                href="/"
                className="mb-2 flex w-fit items-center gap-2 rounded-2xl bg-white p-2 font-semibold text-primary"
              >
                <div className="h-8 w-8 rounded-lg bg-primary" />
                F.L.O.R.A
              </Link>

              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-md">
                Secure Authentication
              </span>

              <h1 className="mt-6 text-5xl font-bold leading-tight">
                Welcome
                <br />
                back
              </h1>

              <p className="mt-5 max-w-md text-base text-white/80">
                Sign in to continue accessing your dashboard, projects, and secure account features.
              </p>
            </div>

            <div className="relative z-10 space-y-4">

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiShield className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Enterprise Security</p>
                  <p className="text-sm text-white/70">
                    Protected with encrypted sessions and secure authentication.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiCheckCircle className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Fast Access</p>
                  <p className="text-sm text-white/70">
                    Seamless sign in experience across all your devices.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right */}
          <div className="overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-6 sm:p-10 lg:p-8">

              <div className="w-full max-w-md">

                <div className="mb-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-primary shadow-sm">
                    <FiStar size={24} />
                  </div>

                  <h2 className="mt-5 text-4xl font-bold tracking-tight text-gray-900">
                    Welcome Back
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Sign in to access your organization and continue your work
                  </p>
                </div>

                <LoginForm />

                <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-gray-500 transition hover:text-primary"
                  >
                    Forgot password?
                  </Link>

                  <div className="text-gray-500">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/sign-up"
                      className="font-semibold text-primary transition hover:underline"
                    >
                      Create account
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}