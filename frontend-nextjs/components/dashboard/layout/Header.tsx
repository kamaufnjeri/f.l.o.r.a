"use client";

import { useAuthStore } from "@/stores/authStore";
import { useModalStore } from "@/stores/modalStore";
import { ModalName } from "@/types";

type Props = {
  title?: string;
  description?: string;
  account?: boolean;
  stock?: boolean;
  service?: boolean;
  supplier?: boolean;
  customer?: boolean;
};

export const baseButton =
  "px-4 py-2 rounded-xl font-medium cursor-pointer transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 shadow-sm hover:shadow-md whitespace-nowrap";

export const variants: Record<string, string> = {
  account:
    "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-200 border border-indigo-100",
  stock:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-200 border border-emerald-100",
  service:
    "bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-200 border border-blue-100",
  customer:
    "bg-amber-50 text-amber-700 hover:bg-amber-100 focus:ring-amber-200 border border-amber-100",
  supplier:
    "bg-slate-50 text-slate-700 hover:bg-slate-100 focus:ring-slate-200 border border-slate-200",
};

export default function Header({
  title = "Accounts",
  description = "Manage your data efficiently",
  account = false,
  stock = false,
  service = false,
  customer = false,
  supplier = false,
}: Props) {

  const openModal = useModalStore((s) => s.openModal);
  const { currentOrg } = useAuthStore();
  const actions: { key: ModalName; label: string; show: boolean }[] = [
    { key: "account", label: "Add Account", show: account },
    { key: "stock", label: "Add Stock", show: stock },
    { key: "service", label: "Add Service", show: service },
    { key: "customer", label: "Add Customer", show: customer },
    { key: "supplier", label: "Add Supplier", show: supplier },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between w-full px-6 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">

        {/* LEFT */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            {title} {currentOrg?.currency ?? 'KSHS'}
          </h1>

          <p className="text-sm text-gray-500 max-w-md leading-relaxed">
            {description}
          </p>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-start sm:justify-end">

          {actions
            .filter((a) => a.show)
            .map((action) => (
              <button
                key={action.key}
                onClick={() => openModal(action.key)}
                className={`${baseButton} ${variants[action.key]}`}
              >
                + {action.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}