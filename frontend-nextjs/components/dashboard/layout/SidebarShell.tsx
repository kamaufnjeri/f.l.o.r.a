"use client";

import { FiMenu, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { SidebarShellProps } from "@/types";
import Link from "next/link";
import { FaBuilding, FaSignOutAlt } from "react-icons/fa";

export default function SidebarShell({
  children,
  isMobileOpen,
  isCollapsed,
  setIsMobileOpen,
  setIsCollapsed,
  user,
  handleLogout,
  isLoggingOut
}: SidebarShellProps) {
  return (
    <>
      {/* ================= MOBILE TRIGGER ================= */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow border"
      >
        <FiMenu />
      </button>

      {/* ================= OVERLAY ================= */}
      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          isMobileOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed md:static z-50 h-screen flex flex-col
          bg-white border-r shadow-sm

          transition-all duration-300 ease-in-out

          ${isCollapsed ? "md:w-20" : "md:w-72"}
          w-72 md:translate-x-0

          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="px-4 py-4 border-b flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 font-bold">
            <div className="w-9 h-9 rounded-xl bg-primary" />

            {!isCollapsed && (
              <span className="text-lg tracking-wide text-primary">
                F.L.O.R.A
              </span>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden cursor-pointer md:flex p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden cursor-pointer p-2 rounded-lg hover:bg-gray-100"
          >
            <FiX />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {/* ================= FOOTER ================= */}
        <div className="border-t p-2 space-y-2 bg-gray-50/50">
          {/* Profile */}
          <Link
            href={`/dashboard/${user.current_organisation?.id}/profile`}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
              {user.first_name?.[0]}
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-xs text-gray-400">
                  Click to view profile
                </span>
              </div>
            )}
          </Link>

          {/* Organisations */}
          <Link
            href={`/dashboard/${user.current_organisation?.id}/organisations`}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <FaBuilding className="text-gray-600" />

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm">Organisations</span>
                <span className="text-xs text-gray-400">
                  Switch or manage organisations
                </span>
              </div>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              flex cursor-pointer items-center gap-2 p-2 rounded-lg w-full transition
              text-red-500 hover:bg-red-50
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            {isLoggingOut ? (
              <svg
                className="w-4 h-4 animate-spin text-red-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <FaSignOutAlt />
            )}

            {!isCollapsed && (
              <span className="text-sm">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}