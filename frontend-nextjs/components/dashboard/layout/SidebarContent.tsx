"use client";

import Link from "next/link";
import { ModalName, SidebarContentProps } from "@/types";
import { SidebarItemType } from "@/constants";
import { useModalStore } from "@/stores/modalStore";
import { capitalizeFirstLetter } from "@/lib/utils";

export default function SidebarContent({
  sidebarIcons,
  pathname,
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  currentOrg,
}: SidebarContentProps) {
    const openModal = useModalStore((s) => s.openModal);
  return (
    <>
      {/* ================= ORG HEADER ================= */}
        <div className="group ">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all duration-200">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {currentOrg.org_name?.[0]}
            </div>

            {!isCollapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold truncate">
                  {currentOrg.org_name}
                </span>
                <span className="text-xs text-gray-400">
                  Workspace • Active
                </span>
              </div>
            )}

           
          </div>
        </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {sidebarIcons.map((item: SidebarItemType) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;
          const hasChildren = !!item.lists?.length;

          // ================= SIMPLE LINK =================
          if (item.url && !hasChildren) {
            return (
              <Link
                key={item.name}
                href={`/dashboard/${currentOrg?.id}/${item.url}`}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 relative
                  hover:bg-gray-50
                  ${isActive ? "bg-indigo-50 text-indigo-600 font-medium" : ""}
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-full" />
                )}

                <Icon className="text-lg" />

                {!isCollapsed && (
                  <span className="text-sm">{item.name}</span>
                )}
              </Link>
            );
          }

          // ================= DROPDOWN =================
          return (
            <div key={item.name}>
              <button
                onClick={() =>
                  setActiveDropdown((prev: string | null) =>
                    prev === item.name ? null : item.name
                  )
                }
                className={`
                  w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 relative
                  hover:bg-gray-50
                `}
              >
                <Icon className="text-lg" />

                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm">
                      {item.name}
                    </span>

                    <span className="text-xs opacity-60">▾</span>
                  </>
                )}
              </button>

              {/* ================= DROPDOWN ITEMS ================= */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${
                    activeDropdown === item.name && !isCollapsed
                      ? "max-h-64 opacity-100"
                      : "max-h-0 opacity-0"
                  }
                `}
              >
                <div className="ml-10 mt-2 space-y-1 border-l pl-3 border-gray-200">
                  {item.lists?.map((sub) => {
                    if (sub.showModal === true && !sub.url) {
                      return (
                        <button
                          key={sub.name}
                          onClick={() => openModal(sub.name! as ModalName)}
                          className="block text-sm text-gray-500 hover:text-indigo-600 transition hover:translate-x-0.5 cursor-pointer border border-gray-500 hover:border-indigo-600 rounded p-1"
                        >
                          Add {capitalizeFirstLetter(sub.name)}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={sub.name}
                        href={`/dashboard/${currentOrg?.id}/${sub.url}`}
                        className="block text-sm text-gray-500 hover:text-indigo-600 transition hover:translate-x-0.5"
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );
}