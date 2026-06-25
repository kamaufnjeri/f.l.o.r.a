"use client";

import { editReturn, recordReturn } from "@/app/actions/returns-actions";
import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { SelectOptions } from "@/types";
import { ReturnEntry, ReturnFormData, ReturnOverview } from "@/types/returns";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";


export function useReturn(type: 'sales' | 'purchases', revalidateUrl?: string | null, initial?: Partial<ReturnOverview>){
  const { setOptions } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();
  const [posting, setPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [original, setOriginal] = useState<ReturnOverview | null>(
    initial as ReturnOverview ?? null
  );
  const [returnItem, setReturnItem] = useState<ReturnFormData>({
    date: initial?.date ?? "",
    description: initial?.description ?? "",
    purchase: initial?.purchase ?? null,
    sales: initial?.sales ?? null,
    return_entries: initial?.return_entries ?? [{ return_quantity: 0, purchase_entry: "", sales_entry: "" }]
  });
  
  const dirtyState = useMemo(() => {
  const state = {
    date: returnItem.date !== original?.date,
    description: returnItem.description !== original?.description,
    return_entries:
      JSON.stringify(returnItem.return_entries) !==
      JSON.stringify(original?.return_entries ?? []),
  };

  if (!isEditing) {
    return {
      date: false,
      description: false,
      return_entries: false,
    };
  }

  return state;
}, [
  isEditing,
  returnItem.date,
  returnItem.description,
  returnItem.return_entries,
  original?.date,
  original?.description,
  original?.return_entries,
]);
    const isDirty = (key: keyof typeof dirtyState) => {
  return dirtyState[key];
};
const hasChanges = Object.values(dirtyState).some(Boolean);



const entriesLength = useMemo(() => {
  return returnItem.return_entries.length;
}, [returnItem.return_entries]);

  const handleChange = (field: keyof ReturnFormData, value: string) => {
    setReturnItem((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  }

 const addEntry = () => {
  setReturnItem((prev) => ({
    ...prev,
    return_entries: [...prev.return_entries, { return_quantity: 0, purchase_entry: "", sales_entry: "" }],
  }));
};

const updateEntry = <
  K extends keyof ReturnEntry
>(
  index: number,
  field: K,
  value: ReturnEntry[K]
) => {
  setReturnItem((prev) => {
    const updated = [...prev.return_entries];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    return {
      ...prev,
      return_entries: updated,
    };
  });

};

  const removeEntry = (index: number) => {
    setReturnItem((prev) => {
      const oldEntries = [...prev.return_entries];
      const updated = oldEntries.filter((_, i) => i !==index);

      return {
        ...prev,
        return_entries: updated,
      }
    });

  }

  const reset = (newReturn?: ReturnFormData, selectOptions?: SelectOptions) => {
    if (selectOptions) {
        setOptions(selectOptions);
    }
    setReturnItem({
      date: newReturn?.date ?? "",
      description: newReturn?.description ?? "",
      sales: newReturn?.sales ?? null,
      purchase: newReturn?.purchase ?? null,
      return_entries: newReturn?.return_entries ?? [{ return_quantity: 0, purchase_entry: "", sales_entry: "" }]});
    setIsEditing(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

   

    try {
      if (!revalidateUrl) {
        toast.error('Revalidate url required');
        return;
      }
      
    const res = await recordReturn(currentOrg?.id || "", revalidateUrl as string, type, returnItem);

    if (!res.success) {
        toast.error(res.error || "Something went wrong");
        return;
    }

    toast.success(res.message || "Return entry created");
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
      toast.error("Organisation or return ID required");
      return;
    }

    if (!revalidateUrl) {
        toast.error('Revalidate url required');
        return
      }

    setPosting(true);

    try {
    
   
      const res = await editReturn(
        currentOrg.id,
        original?.id,
        returnItem,
        type,
        revalidateUrl,
      );
      

      if (!res?.success) {
        toast.error(res.error || "Update failed");
        return;
      }

      toast.success("Return updated");

      setOriginal(res.return);
      reset(res.return, res.select_options);
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
        sales: original?.sales ?? null,
        purchase: original?.purchase ?? null,
        return_entries: original?.return_entries ?? [{ return_quantity: 0, purchase_entry: "", sales_entry: "" }],
    })
  };

  const enableEditing = () => setIsEditing(true);

  return {
    returnItem,
    handleChange,
    updateEntry,
    addEntry,
    removeEntry,
    reset,
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
    entriesLength,
  };
}