"use client";

import { useState } from "react";
import CreateAccountModal from "../accounts/CreateAccountModal";
import CreateStockModal from "../stocks/CreateStockModal";


type Props = {
  title?: string;
  description?: string;
  account?: boolean;
  stock? : boolean;
};

export default function Header({
  title = "Accounts",
  description = "Manage your data efficiently",
  account = false,
  stock = false,
}: Props) {
  const [openAccount, setOpenAccount] = useState(false);
  const [openStock, setOpenStock] = useState(false);

  return (
    <>
      <div className="w-full">
        {/* HEADER CARD */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">

          {/* LEFT SIDE */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              {title}
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              {description}
            </p>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">

           {account && <button
              onClick={() => setOpenAccount(true)}
              className="
                px-4 py-2
                rounded-xl cursor-pointer
                bg-gray-500
                text-white
                font-medium
                shadow-sm
                transition-all
                hover:bg-primary-darker
                hover:shadow-md
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-primary/30
                w-full sm:w-auto
              "
            >
              + Add Account
            </button>}
            {stock && <button
              onClick={() => setOpenStock(true)}
              className="
                px-4 py-2
                rounded-xl cursor-pointer
                bg-gray-600
                text-white
                font-medium
                shadow-sm
                transition-all
                hover:bg-primary-darker
                hover:shadow-md
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-primary/30
                w-full sm:w-auto
              "
            >
              + Add Stock
            </button>}

          </div>
        </div>
      </div>

      {/* MODAL */}
     {openAccount && (
        <CreateAccountModal
          onClose={() => setOpenAccount(false)}
        />
      )}
      {openStock && (
        <CreateStockModal
          onClose={() => setOpenStock(false)}
        />
      )}
    </>
  );
}