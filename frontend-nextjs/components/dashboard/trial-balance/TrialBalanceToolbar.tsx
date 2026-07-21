"use client";

import { Dispatch, SetStateAction } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiDownload,
} from "react-icons/fi";

type Props = {
  showCategories: boolean;
  setShowCategories: Dispatch<SetStateAction<boolean>>;

  showSubCategories: boolean;
  setShowSubCategories: Dispatch<SetStateAction<boolean>>;

  showAccounts: boolean;
  setShowAccounts: Dispatch<SetStateAction<boolean>>;
 allExpanded: boolean;
  toggleExpandAll: () => void;
};

export default function TrialBalanceToolbar({
  showCategories,
  setShowCategories,
  showSubCategories,
  setShowSubCategories,
  showAccounts,
  setShowAccounts,
  allExpanded,
  toggleExpandAll
}: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5">



        <div className="flex flex-wrap items-center justify-between gap-4">

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCategories}
              onChange={(e) =>
                setShowCategories(e.target.checked)
              }
            />

            <span>Categories</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSubCategories}
              onChange={(e) =>
                setShowSubCategories(e.target.checked)
              }
            />

            <span>Sub Categories</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAccounts}
              onChange={(e) =>
                setShowAccounts(e.target.checked)
              }
            />

            <span>Accounts</span>
          </label>

         <button
  onClick={toggleExpandAll}
  className="flex items-center cursor-pointer gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
>
  {allExpanded ? (
    <>
      <FiChevronUp />
      Collapse All
    </>
  ) : (
    <>
      <FiChevronDown />
      Expand All
    </>
  )}
</button>
         
        
        </div>


    </div>
  );
}