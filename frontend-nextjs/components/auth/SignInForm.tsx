'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiMail, FiLock } from "react-icons/fi";

import Input from "../forms/Input";
import Button from "../forms/Button";
import { signIn } from "@/app/actions/auth";
import { useAuthStore } from "@/stores/authStore";

export default function SignInForm() {
  const { setUser, setCurrentOrg, setUserOrgs } = useAuthStore();
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    startTransition(async () => {
      try {
        const res = await signIn(formData);
        if (res.success) {
          const user = res.user;

          if (!user.current_organisation?.id) {
            router.push("/organisation-create");
          }
          router.push(`/dashboard/${user.current_organisation?.id}`);
          setUser(user);
          setCurrentOrg(user.current_organisation);
          setUserOrgs(user.user_organisations);
          
          toast.success("Login successful");
        

          setResetKey((k) => k + 1);
        } else {
          toast.error(res.error || "Invalid credentials");
          return;
        }
      } catch (error: unknown) {
        console.error(error);

        toast.error((error as Error)?.message || "Something went wrong");
      }
    });
  }

  return (
    <form
      key={resetKey}
      action={handleSubmit}
      className="
        space-y-6
        rounded-3xl
        bg-white/70 backdrop-blur-xl
        border border-white/60
        shadow-[0_10px_40px_rgba(0,0,0,0.06)]
        p-6 sm:p-8
      "
    >
      {/* Inputs */}
      <div className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          icon={<FiMail />}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          icon={<FiLock />}
        />
      </div>

      {/* Button */}
        <Button
             type="submit"
             disabled={pending}
             aria-disabled={pending}
             aria-busy={pending}
             className={[
               "relative w-full overflow-hidden",
               "rounded-xl py-3 font-semibold",
               "transition-all duration-300",
               pending
                 ? "cursor-not-allowed opacity-80"
                 : "hover:-translate-y-0.5",
             ].join(" ")}
           >
             <span className="flex items-center justify-center gap-2">
               
               {pending && (
                 <svg
                   className="h-4 w-4 animate-spin"
                   viewBox="0 0 24 24"
                   fill="none"
                 >
                   <circle
                     className="opacity-20"
                     cx="12"
                     cy="12"
                     r="10"
                     stroke="currentColor"
                     strokeWidth="4"
                   />
     
                   <path
                     className="opacity-90"
                     fill="currentColor"
                     d="M22 12a10 10 0 00-10-10v4a6 6 0 016 6h4z"
                   />
                 </svg>
               )}
     
               <span>
                 {pending
                   ? 'Signing in ...'
                   : 'Sign In'}
               </span>
             </span>
           </Button>

      
    </form>
  );
}