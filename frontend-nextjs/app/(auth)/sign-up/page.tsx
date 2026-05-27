import SignUpForm from "@/components/auth/SignUpForm";
import Link from "next/link";
import {
  FiCheckCircle,
  FiShield,
  FiZap,
  FiUsers,
} from "react-icons/fi";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] px-4 py-10">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-[-80px] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-100px] h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">

          {/* Left */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">

            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-white/20" />
              <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full border border-white/10" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-md">
                Create Your Account
              </span>

              <h1 className="mt-6 text-5xl font-bold leading-tight">
                Start your
                <br />
                journey today
              </h1>

              <p className="mt-5 max-w-md text-base text-white/80">
                Join thousands of users already using our platform to manage
                projects, collaborate, and grow faster.
              </p>
            </div>

            <div className="relative z-10 space-y-4">

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiShield className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Secure by Default</p>
                  <p className="text-sm text-white/70">
                    Built with modern authentication and encrypted sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiUsers className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Trusted by Teams</p>
                  <p className="text-sm text-white/70">
                    Designed for individuals, startups, and growing companies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiCheckCircle className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Fast Onboarding</p>
                  <p className="text-sm text-white/70">
                    Create your account in seconds and get started instantly.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">

            <div className="w-full max-w-lg">

              <div className="mb-8 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-primary shadow-sm">
                  <FiZap size={24} />
                </div>

                <h2 className="mt-5 text-4xl font-bold tracking-tight text-gray-900">
                  Create Account
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Join us and start building something amazing
                </p>
              </div>

              <SignUpForm />

              <div className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-semibold text-primary transition hover:underline"
                >
                  Sign in
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}