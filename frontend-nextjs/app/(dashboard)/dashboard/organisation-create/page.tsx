import CreateOrgForm from "@/components/dashboard/organisations/CreateOrgForm";
import Link from "next/link";
import {
  FiCheckCircle,
  FiShield,
  FiStar,
} from "react-icons/fi";

export default function OrganisationCreatePage() {
  return (
    <main className="relative h-screen overflow-hidden bg-[#f8fafc] px-4 py-4">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-80px] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
      </div>


      <div className="relative mx-auto h-full w-full max-w-7xl">

        <div className="grid h-full overflow-hidden rounded-[32px] border border-white/60 bg-white/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">


          {/* Left */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">

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


              <span className="mt-4 inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-md">
                Workspace Setup
              </span>


              <h1 className="mt-6 text-5xl font-bold leading-tight">
                Create
                <br />
                your workspace
              </h1>


              <p className="mt-5 max-w-md text-base text-white/80">
                Set up your organization to manage your operations, teams,
                and financial activities from one secure dashboard.
              </p>

            </div>


            <div className="relative z-10 space-y-4">

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiShield className="mt-1 text-xl" />

                <div>
                  <p className="font-semibold">
                    Secure Workspace
                  </p>

                  <p className="text-sm text-white/70">
                    Your organization data is protected with secure access controls.
                  </p>
                </div>
              </div>


              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <FiCheckCircle className="mt-1 text-xl" />

                <div>
                  <p className="font-semibold">
                    Ready to Grow
                  </p>

                  <p className="text-sm text-white/70">
                    Add your details and start managing your business operations.
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
                    Create Organization
                  </h2>


                  <p className="mt-2 text-sm text-gray-500">
                    Complete your workspace details to continue
                  </p>

                </div>


                <CreateOrgForm />

              </div>

            </div>

          </div>


        </div>

      </div>

    </main>
  );
}
