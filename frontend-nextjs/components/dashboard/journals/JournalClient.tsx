"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

import InputField from "./InputField";
import TextAreaField from "./TextAreaField";
import JournalEntries from "./JournalEntries";

import { deleteJournal } from "@/app/actions/journal-actions";
import { Journal } from "@/types";
import { downloadPdf } from "@/app/actions/download-actions";
import { saveFile } from "@/lib/utils";
import ConfirmModal from "../common/ConfirmationModal";
import { useRouter } from "next/navigation";
import { useJournal } from "@/hooks/useJournal";


type Props = {
  journal: Journal;
};

export default function JournalClient({ journal }: Props) {
  const { currentOrg, original, difference, accounts, journal: editingJournal, handleChange, updateEntry, addEntry, removeEntry, handleUpdate, posting,
    isDirty, hasChanges, isEditing, cancelEdit, enableEditing
    } = useJournal(journal);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  



  const handleDownload = async () => {
    const toastId = toast.loading("Preparing download...");

    try {
      if (!currentOrg?.id) {
        toast.error("Organisation id required", { id: toastId });
        return;
      }
      const title = `Journal ${journal.serial_number}`
      const res = await downloadPdf(
        currentOrg.id,
        journal,
        title,
      );

      if (res.success) {
        saveFile(res.blob, `${title}.pdf`);

        toast.success("Downloaded successfully", {
          id: toastId,
        });
      } else {
        toast.error("Download failed", { id: toastId });
      }
    } catch (error) {
      console.error('Error', error);
      toast.error("Download failed", { id: toastId });
    }
  };

const handleDelete = async () => {
  const res = await deleteJournal(currentOrg!.id, journal.id);

  if (!res?.success) {
    throw new Error(res?.error || "Delete failed");
  }

  toast.success("Journal deleted");
  // redirect or remove from list here
  router.push(`/dashboard/${currentOrg!.id}/journals`)
};

  return (
    <div className="space-y-5 w-full">

      {/* 🧠 PREMIUM HEADER (DESKTOP + MOBILE RESPONSIVE) */}
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* LEFT: TITLE */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-primary">
              Journal
            </h1>

           
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="flex flex-wrap gap-2 lg:justify-end">

            {/* EDIT / VIEW TOGGLE */}
            {!isEditing ? (
              <button
                onClick={() => enableEditing()}
                className="px-4 py-2  cursor-pointer  text-sm bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Edit Mode
              </button>
            ) : (
              <button
                onClick={cancelEdit}
                className="px-4 py-2 cursor-pointer text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                View Mode
              </button>
            )}

            {/* DOWNLOAD */}
            <button
              disabled={isEditing}
              onClick={handleDownload}
              className="rounded-xl
                  bg-primary
                  px-5 py-2.5
                  text-sm font-semibold
                  text-white
                  shadow-sm
                  transition
                  cursor-pointer
                  hover:bg-primary-dark
                  active:scale-[0.98]"
            >
              Download Pdf
            </button>

            {/* DELETE */}
            <button
              disabled={isEditing}
              onClick={() => setShowDeleteModal(true)}
              className="px-4  py-2 text-sm bg-red-50 text-red-400 rounded-lg cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>

        {/* UNSAVED STATE */}
        <div className="mt-3 text-sm">
          {hasChanges ? (
            <span className="text-yellow-600 font-medium">
              ⚠ Unsaved changes
            </span>
          ) : (
            <span className="text-gray-400">No changes</span>
          )}
        </div>
      </div>

      {/* 🧾 FORM SECTION */}
      <form onSubmit={handleUpdate} >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-2xl p-4 mb-4">
         <InputField
          label="Serial Number"
          type="text"
          value={editingJournal.serial_number}
          onChange={(val) => {
            handleChange('serial_number', val);
          }}
          required
          disabled={!isEditing}
          isDirty={isDirty("serial_number")}
        />
        <InputField
          label="Date"
          type="date"
          value={editingJournal.date}
          onChange={(val) => {
            handleChange('date', val);
          }}
          required
          disabled={!isEditing}
          isDirty={isDirty("date")}
        />

        <TextAreaField
          label="Description"
          value={editingJournal.description}
          onChange={(val) => {
            handleChange('description', val);
          }}
          required
          disabled={!isEditing}
          isDirty={isDirty("description")}
        />
      </div>

      {/* 📊 ENTRIES (PREMIUM CARD STYLE) */}
      <div className="bg-white border rounded-xl shadow-sm p-4">

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Journal Entries
          </h2>

          <span className="text-xs text-gray-400">
            {editingJournal.journal_entries.length} entries
          </span>
        </div>

        <JournalEntries
          entries={editingJournal.journal_entries}
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
          accounts={accounts}
          isDirty={isDirty("journal_entries")}
          disabled={!isEditing}
        />
      </div>
       {/* ⚖️ FOOTER (ONLY EDIT MODE) */}
      {isEditing && (
        <div className="sticky bottom-3 bg-white border rounded-xl shadow-md p-4 flex items-center justify-between">

          <div className="text-sm">
            {difference === 0 ? (
              <span className="text-green-600">✓ Balanced</span>
            ) : (
              <span className="text-red-600">
                ✗ Not Balanced ({difference})
              </span>
            )}
          </div>
         {!isEditing && (
  <button
    type="button"
    onClick={enableEditing}
    className="px-4 py-2 cursor-pointer text-sm bg-black text-white rounded-lg hover:bg-gray-800"
  >
    Edit
  </button>
)}

{isEditing && (
  <button
    type="button"
    onClick={cancelEdit}
    className="px-4 py-2 cursor-pointer text-sm bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
  >
    Cancel
  </button>
)}

          <button
            type='submit'
            disabled={difference !== 0 || posting || !hasChanges}
            className={`px-5 py-2 rounded-lg text-white text-sm transition cursor-pointer
              ${difference === 0 && hasChanges && !posting
                ? "bg-black hover:bg-gray-800"
                : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            {posting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
      </form>

      {/* 📊 TOTALS (PREMIUM SUMMARY BAR) */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border rounded-xl p-4 flex flex-col md:flex-row md:justify-between gap-2 text-sm">

        <span className="text-gray-500">Totals</span>

        <div className="flex gap-6 font-semibold">
          <span className="text-green-600">
            Debit: {original?.journal_entries_total?.debit_total}
          </span>
          <span className="text-red-600">
            Credit: {original?.journal_entries_total?.credit_total}
          </span>
        </div>
      </div>

     
     {showDeleteModal &&  <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Journal"
        description="This will permanently remove this journal entry."
        confirmText="Delete"
        tone="danger"
        onConfirm={handleDelete}
      />
     }
    </div>
  );
}