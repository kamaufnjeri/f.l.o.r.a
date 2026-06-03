"use client";

import React, { useState, useMemo } from "react";

import InputField from "./InputField";
import JournalEntries from "./JournalEntries";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";
import TextAreaField from "./TextAreaField";
import { JournalEntry } from "@/types";
import { recordJournal } from "@/app/actions/journal-actions";
import { toast } from "react-hot-toast";


export default function RecordJournal() {
  const { serial_numbers, setSerialNumbers, accounts } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();

  // 🧠 header state
  const [date, setDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [posting, setPosting] = useState(false);

  // 🧾 entries state
  const [journalEntries, setJournalEntries] = useState<
    JournalEntry[]
  >([
    {
      account: "",
      debit_credit: "debit",
      amount: 0,
      type: "journal",
    },
  ]);

  // 🧮 balance check
  const difference = useMemo(() => {
    return journalEntries.reduce((acc, entry) => {
      const amount = Number(entry.amount || 0);

      return entry.debit_credit === "debit"
        ? acc + amount
        : acc - amount;
    }, 0);
  }, [journalEntries]);

  // 🚀 submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    const payload = {
      serial_number: serial_numbers.journal,
      date,
      description,
      journal_entries: journalEntries,
    };

    try {
    const res = await recordJournal(currentOrg?.id || "", payload);

    if (!res.success) {
        toast.error(res.error || "Something went wrong");
        return;
    }

    toast.success(res.message || "Journal entry created");
    setDate("");
    setDescription("");
    setJournalEntries([
        {
        account: "",
        debit_credit: "debit",
        amount: 0,
        type: "journal",
        },
    ]);

    // OPTIONAL: update store if backend returns updated accounts
    if (res.serial_numbers) {
        setSerialNumbers(res.serial_numbers);
    }

    
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again");
    } finally {
      setPosting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* HEADER CARD */}
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-5">
        <h1 className="text-lg font-semibold text-gray-800">
          Record Journal Entry
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SERIAL */}
          <div>
            <label className="text-xs text-gray-500">
              Serial Number
            </label>
            <div className="px-3 py-2 border rounded-lg bg-gray-50 text-sm text-gray-700">
              {serial_numbers.journal}
            </div>
          </div>

          {/* DATE */}
          <InputField
            label="Date"
            type="date"
            value={date}
            onChange={setDate}
          />

          {/* DESCRIPTION */}
          <TextAreaField
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Enter journal description"
          />
        </div>
      </div>

      {/* JOURNAL ENTRIES */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <JournalEntries
          journalEntries={journalEntries}
          setJournalEntries={setJournalEntries}
          accounts={accounts}
          type="journal"
        />
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm sticky bottom-3">
        {/* STATUS */}
        <div className="text-sm">
          {difference === 0 ? (
            <span className="text-green-600 font-medium">
              ✓ Balanced
            </span>
          ) : (
            <span className="text-red-600 font-medium">
              ✗ Not Balanced (Difference: {currentOrg?.currency || "Kshs"} {difference.toFixed(2)})
            </span>
          )}
        </div>

        {/* SUBMIT */}
        <button
            type="submit"
            disabled={difference !== 0 || posting}
            className={`
                px-5 py-2 cursor-pointer rounded-lg text-white text-sm transition flex items-center gap-2
                ${
                difference === 0 && !posting
                    ? "bg-black hover:bg-gray-800"
                    : "bg-gray-300 cursor-not-allowed"
                }
            `}
            >
            {posting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}

            {posting ? "Posting..." : "Post Journal"}
            </button>
      </div>
    </form>
  );
}