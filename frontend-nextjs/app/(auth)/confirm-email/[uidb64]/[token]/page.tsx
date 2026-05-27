import { verifyEmail } from "@/app/actions/auth-actions";
import AutoRedirect from "@/components/auth/AutoRedirect";
import Link from "next/link";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMail,
  FiShield,
  FiXCircle,
} from "react-icons/fi";

export default async function VerifyEmailPage({
  params,
}: {
  params:
    | { uidb64: string; token: string }
    | Promise<{ uidb64: string; token: string }>;
}) {
  const resolvedParams = params instanceof Promise ? await params : params;

  const result = await verifyEmail(
    resolvedParams.uidb64,
    resolvedParams.token
  );

  const success = result.success;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] px-4 py-10">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-[-80px] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">

          {/* Left */}
          <div
            className={`relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between ${
              success
                ? "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700"
                : "bg-gradient-to-br from-rose-500 via-red-600 to-orange-600"
            }`}
          >

            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-white/20" />
              <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full border border-white/10" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-md">
                Email Verification
              </span>

              <h1 className="mt-6 text-5xl font-bold leading-tight">
                {success
                  ? "Your email is verified"
                  : "Verification failed"}
              </h1>

              <p className="mt-5 max-w-md text-base text-white/80">
                {success
                  ? "Your account is now secure and ready to use. You can continue to sign in and access your dashboard."
                  : "The verification link may be invalid or expired. Please try signing in or request another verification email."}
              </p>
            </div>

            <div className="relative z-10 space-y-4">

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiShield className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Protected Account</p>
                  <p className="text-sm text-white/70">
                    Your account security is always protected with encrypted
                    verification links.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiMail className="mt-1 text-xl" />
                <div>
                  <p className="font-semibold">Secure Authentication</p>
                  <p className="text-sm text-white/70">
                    Email verification helps prevent unauthorized access and
                    protects your identity.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">

            <div className="w-full max-w-md text-center">

              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl shadow-lg ${
                  success
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {success ? (
                  <FiCheckCircle size={42} />
                ) : (
                  <FiXCircle size={42} />
                )}
              </div>

              <h2
                className={`mt-8 text-4xl font-bold tracking-tight ${
                  success ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {success ? "Email Verified" : "Verification Failed"}
              </h2>

              <p className="mt-4 text-base leading-relaxed text-gray-500">
                {result.message || result.error}
              </p>

              {success ? (
                <>
                  <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <p className="text-sm text-emerald-700">
                      Redirecting you to sign in shortly...
                    </p>
                  </div>

                  <AutoRedirect to="/sign-in" delay={2000} />

                  <Link
                    href="/sign-in"
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] hover:bg-emerald-700"
                  >
                    Continue to Sign In
                    <FiArrowRight />
                  </Link>
                </>
              ) : (
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">

                  <Link
                    href="/sign-in"
                    className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition hover:scale-[1.02]"
                  >
                    Back to Sign In
                  </Link>

                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                  >
                    Create Account
                  </Link>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}