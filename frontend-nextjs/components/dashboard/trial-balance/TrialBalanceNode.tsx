"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronRight, FiEye } from "react-icons/fi";
import { TrialBalanceAccount, TrialBalanceCategory, TrialBalanceFixedGroup, TrialBalanceSubCategory } from "./types";

type Props = {
  item: TrialBalanceCategory | TrialBalanceSubCategory | TrialBalanceAccount | TrialBalanceFixedGroup;
  level: number;

  organisationId: string;

  showCategories: boolean;
  showSubCategories: boolean;
  showAccounts: boolean;

  expandedNodes: Set<string | number>;
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string | number>>>;
};

export default function TrialBalanceNode({
  item,
  level,
  organisationId,
  showCategories,
  showSubCategories,
  showAccounts,
  expandedNodes,
  setExpandedNodes
}: Props) {


const isExpanded = expandedNodes.has(item.id);


const toggleExpand = () => {
  setExpandedNodes(prev => {
    const next = new Set(prev);

    if (next.has(item.id)) {
      next.delete(item.id);
    } else {
      next.add(item.id);
    }

    return next;
  });
};
  const hasCategories = "categories" in item;
  const hasSubCategories = "sub_categories" in item;
  const hasAccounts = "accounts" in item;

  const isAccount =
    !hasCategories &&
    !hasSubCategories &&
    !hasAccounts;

  const children = hasCategories
    ? item.categories
    : hasSubCategories
    ? item.sub_categories
    : hasAccounts
    ? item.accounts
    : [];

  const shouldRender =
    level === 0 ||
    (level === 1 && showCategories) ||
    (level === 2 && showSubCategories) ||
    (level === 3 && showAccounts);

  if (!shouldRender) return null;

  return (
    <>
      <tr
        className={`
          border-b
          hover:bg-gray-50
          transition
          ${!isAccount ? "bg-gray-50/40" : ""}
        `}
      >
        {/* Name */}

        <td
          className="p-3"
          style={{
            paddingLeft: `${level * 28 + 16}px`,
          }}
        >
          <div className="flex items-center gap-2">
            {!isAccount && children.length > 0 && (
              <button
                onClick={toggleExpand}
                className="rounded cursor-pointer hover:bg-gray-200 p-1"
              >
                {isExpanded ? (
                  <FiChevronDown />
                ) : (
                  <FiChevronRight />
                )}
              </button>
            )}

            {isAccount && (
              <div className="w-6" />
            )}

            <span
              className={
                isAccount
                  ? "text-gray-700"
                  : "font-semibold text-gray-900"
              }
            >
              {item.name}
            </span>
          </div>
        </td>

        {/* Debit */}

        <td className="p-3 text-right tabular-nums text-green-700">

          {item.balance_type === "debit"
            ? Number(item.amount).toLocaleString()
            : "-"}

        </td>

        {/* Credit */}

        <td className="p-3 text-right tabular-nums text-red-700">

          {item.balance_type === "credit"
            ? Number(item.amount).toLocaleString()
            : "-"}

        </td>

        {/* View */}

        <td className="p-3 text-right">

          {isAccount && (

            <Link
              href={`/dashboard/${organisationId}/accounts/${item.id}`}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                px-3
                py-1.5
                text-indigo-600
                hover:bg-indigo-50
              "
            >
              <FiEye />

              View

            </Link>

          )}

        </td>
      </tr>

      {isExpanded &&
        children.map((child) => (
          <TrialBalanceNode
            key={child.id}
            item={child}
            level={level + 1}
            organisationId={organisationId}
            showCategories={showCategories}
            showSubCategories={showSubCategories}
            showAccounts={showAccounts}
            expandedNodes={expandedNodes}
            setExpandedNodes={setExpandedNodes}
          />
        ))}
    </>
  );
}