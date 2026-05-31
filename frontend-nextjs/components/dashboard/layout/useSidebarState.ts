"use client";

import { useEffect, useState } from "react";

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // detect breakpoint cleanly
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setIsMobileOpen(false); // close drawer on desktop
      } else {
        setIsCollapsed(false); // reset collapse on mobile
      }
    };

    handler(mq);
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  return {
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    activeDropdown,
    setActiveDropdown,
  };
}