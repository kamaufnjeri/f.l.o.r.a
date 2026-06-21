"use client";

import { editJournal, recordJournal } from "@/app/actions/journal-actions";
import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { Journal, JournalEntry, JournalFormData, SelectOptions } from "@/types";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";


const defaultEntry: JournalEntry = {
  account: "",
  debit_credit: "debit",
  amount: 0,
  type: "journal",
};

export function useJournal(initial?: Partial<Journal>){
  const { serial_numbers, setOptions, accounts } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();
  const [posting, setPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 const [original, setOriginal] = useState<Journal | null>(
  initial as Journal ?? null
);
  const [journal, setJournal] = useState<JournalFormData>({
    date: initial?.date ?? "",
    description: initial?.description ?? "",
    serial_number: initial?.serial_number ?? serial_numbers.journal,
    journal_entries: initial?.journal_entries ?? [{ ...defaultEntry }]
  });
  const serialNumber =
    journal.serial_number ||
    serial_numbers.journal;
  const dirtyState = useMemo(() => {
  const state = {
    serial_number: journal.serial_number !== original?.serial_number,
    date: journal.date !== original?.date,
    description: journal.description !== original?.description,
    journal_entries:
      JSON.stringify(journal.journal_entries) !==
      JSON.stringify(original?.journal_entries ?? []),
  };

  if (!isEditing) {
    return {
      serial_number: false,
      date: false,
      description: false,
      journal_entries: false,
    };
  }

  return state;
}, [
  isEditing,
  journal.date,
  journal.serial_number,
  journal.description,
  journal.journal_entries,
  original?.serial_number,
  original?.date,
  original?.description,
  original?.journal_entries,
]);
    const isDirty = (key: keyof typeof dirtyState) => {
  return dirtyState[key];
};
const hasChanges = Object.values(dirtyState).some(Boolean);
  const difference = useMemo(() => {
    return journal.journal_entries.reduce((acc, entry) => {
      const amount = Number(entry.amount || 0);
  
      return entry.debit_credit === "debit"
        ? acc + amount
        : acc - amount;
      }, 0);
  }, [journal.journal_entries]);

  const handleChange = (field: keyof JournalFormData, value: string) => {
    setJournal((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  }

 const addEntry = () => {
  setJournal((prev) => ({
    ...prev,
    journal_entries: [...prev.journal_entries, { ...defaultEntry }],
  }));
};

const updateEntry = <
  K extends keyof JournalEntry
>(
  index: number,
  field: K,
  value: JournalEntry[K]
) => {
  setJournal((prev) => {
    const updated = [...prev.journal_entries];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    return {
      ...prev,
      journal_entries: updated,
    };
  });

};

  const removeEntry = (index: number) => {
    setJournal((prev) => {
      const oldEntries = [...prev.journal_entries];
      const updated = oldEntries.filter((_, i) => i !==index);

      return {
        ...prev,
        journal_entries: updated,
      }
    });

  }

  const reset = (newJournal?: JournalFormData, selectOptions?: SelectOptions) => {
    const serialNumbers = selectOptions?.serial_numbers;
    if (selectOptions) {
        setOptions(selectOptions);
    }
    setJournal({
      date: newJournal?.date ?? "",
      description: newJournal?.description ?? "",
      serial_number: newJournal?.serial_number ?? serialNumbers?.journal ?? "",
       journal_entries: newJournal?.journal_entries ?? [{ ...defaultEntry }]    });
    setIsEditing(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

   

    try {
      const finalSerial =
        journal.serial_number?.trim() || serialNumber;

      const payload = {
        ...journal,
        serial_number: finalSerial,
      };
    const res = await recordJournal(currentOrg?.id || "", payload);

    if (!res.success) {
        toast.error(res.error || "Something went wrong");
        return;
    }

    toast.success(res.message || "Journal entry created");
    const selectOptions = res.select_options;
     reset(undefined, selectOptions);    
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again");
    } finally {
      setPosting(false);
    }
  };

 const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrg?.id || !original?.id) {
      toast.error("Organisation or journal ID required");
      return;
    }

    setPosting(true);

    try {
      
      const res = await editJournal(
        currentOrg.id,
        original?.id,
        journal
      );

      if (!res?.success) {
        toast.error(res.error || "Update failed");
        return;
      }

      toast.success("Journal updated");

      setOriginal(res.journal);
      reset(res.journal, res.select_options);
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setPosting(false);
    }
  };

  const cancelEdit = () => {
    reset({
        date: original?.date ?? "",
        description: original?.description ?? "",
        serial_number: original?.serial_number ?? "",
        journal_entries: original?.journal_entries ?? [defaultEntry],
    })
  };

  const enableEditing = () => setIsEditing(true);

  return {
    journal,
    difference,
    handleChange,
    updateEntry,
    addEntry,
    removeEntry,
    reset,
    accounts,
    currentOrg,
    handleSubmit,
    posting,
    original,
    handleUpdate,
    isDirty,
    cancelEdit,
    hasChanges,
    isEditing,
    enableEditing,
    serialNumber
  };
}