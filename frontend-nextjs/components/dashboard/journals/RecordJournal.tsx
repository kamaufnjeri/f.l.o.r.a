"use client";


import InputField from "./InputField";
import JournalEntries from "./JournalEntries";

import { useJournal } from "@/hooks/useJournal";
import TextAreaField from "./TextAreaField";


export default function RecordJournal() {
  const { currentOrg, difference, accounts, journal, serialNumber, handleChange, updateEntry, addEntry, removeEntry, handleSubmit, posting
  } = useJournal();

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
          <InputField
                          required
                                    label="Serial Number"
                                    type="text"
                                    
                           value={journal.serial_number === "" ? serialNumber : journal.serial_number}
                                    onChange={(val) => {
                                      handleChange('serial_number', val);
                                    }}
                                  />

          {/* DATE */}
          <InputField
          required
            label="Date"
            type="date"
            value={journal.date}
            onChange={(val) => {
              handleChange('date', val);
            }}
          />

          {/* DESCRIPTION */}
          <TextAreaField
          required
            label="Description"
            value={journal.description}
            onChange={(val) => {
              handleChange('description', val);
            }}
            placeholder="Enter journal description"
          />
        </div>
      </div>

      {/* JOURNAL ENTRIES */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <JournalEntries
          entries={journal.journal_entries}
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
          accounts={accounts}
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