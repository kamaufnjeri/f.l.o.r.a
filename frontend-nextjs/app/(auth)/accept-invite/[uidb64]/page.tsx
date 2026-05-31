import AcceptInvite from "@/components/auth/AcceptInvite";
import { FiUserPlus } from "react-icons/fi";

export default async function AcceptInvitePage({
  params,
}: {
  params:
    | { uidb64: string }
    | Promise<{ uidb64: string }>;
}) {
  const resolvedParams = params instanceof Promise ? await params : params;

  return (
    <main className="relative h-screen overflow-hidden bg-[#f8fafc] px-4 py-4">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-[-80px] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-100px] h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto h-full w-full max-w-7xl">

        <div className="grid h-full w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">

          {/* LEFT (SERVER / STATIC) */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">

            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-white/20" />
              <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full border border-white/10" />
            </div>

            <div className="relative z-10">
              <div className="mb-2 flex w-fit items-center gap-2 rounded-2xl bg-white p-2 font-semibold text-primary">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                F.L.O.R.A
              </div>

              <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm">
                Organization Invitation
              </span>

              <h1 className="mt-6 text-5xl font-bold leading-tight">
                You’ve been
                <br />
                invited
              </h1>

              <p className="mt-5 max-w-md text-white/80">
                Join your organization and start collaborating instantly.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">Team Access</p>
                <p className="text-sm text-white/70">
                  Collaborate with your organization.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">Secure Access</p>
                <p className="text-sm text-white/70">
                  Role-based permissions applied.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">Instant Join</p>
                <p className="text-sm text-white/70">
                  Start immediately after acceptance.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT (CLIENT FORMS ONLY) */}
        <div className="overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-6 sm:p-10 lg:p-8">
            
            <div className="w-full max-w-lg">

            {/* HEADER */}
            <div className="mb-6 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-primary shadow-sm">
                <FiUserPlus size={24} />
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-gray-900">
                Accept Invite
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                Join your organization by signing in or creating an account
            </p>
            </div>

            {/* FORMS */}
            <AcceptInvite uidb64={resolvedParams.uidb64} />

            </div>
        </div>
        </div>
        </div>
      </div>
    </main>
  );
}