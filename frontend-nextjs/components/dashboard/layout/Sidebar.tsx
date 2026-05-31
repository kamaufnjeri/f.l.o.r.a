'use client';

import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarState } from "./useSidebarState";
import { sidebarIcons } from "@/constants";
import SidebarShell from "./SidebarShell";
import SidebarContent from "./SidebarContent";
import { useState } from "react";
import toast from "react-hot-toast";
import { logoutAction } from "@/app/actions/auth-actions";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentOrg, user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter()

  async function handleLogout() {
    setIsLoggingOut(true);
  
    const res = await logoutAction();
    if (res.success) {
      

    router.push('/sign-in');
    logout()

    toast.success(res.message || "Login successful");
    

    } else {
      toast.error(res.error || "Error logging out!");
      return;
    }
    setIsLoggingOut(false);
  }

  const {
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    activeDropdown,
    setActiveDropdown,
  } = useSidebarState();

  if (!currentOrg || !user) return null;

  return (
    <SidebarShell
      isMobileOpen={isMobileOpen}
      isCollapsed={isCollapsed}
      setIsMobileOpen={setIsMobileOpen}
      setIsCollapsed={setIsCollapsed}
      currentOrg={currentOrg}
      user={user}
      handleLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    >
      <SidebarContent
        sidebarIcons={sidebarIcons}
        pathname={pathname}
        isCollapsed={isCollapsed}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        currentOrg={currentOrg}
        
      />
    </SidebarShell>
  );
}