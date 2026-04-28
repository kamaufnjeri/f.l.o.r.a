"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
        group border border-border rounded-2xl bg-white
        shadow-sm hover:shadow-md transition
        overflow-hidden
      "
    >

      {/* HEADER BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full flex items-center justify-between gap-4
          px-6 py-5 text-left
          hover:bg-bg-soft transition
        "
      >

        {/* QUESTION */}
        <span className="font-medium text-text leading-relaxed pr-6">
          {question}
        </span>

        {/* ICON */}
        <span
          className={`
            flex-shrink-0 text-muted transition-transform duration-300
            ${open ? "rotate-180 text-primary" : ""}
          `}
        >
          <FaChevronDown />
        </span>

      </button>

      {/* ANSWER */}
      <div
        className={`
          grid transition-all duration-300 ease-in-out
          ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
        `}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 text-sm text-muted leading-relaxed">
            {answer}
          </div>
        </div>
      </div>

    </div>
  );
}