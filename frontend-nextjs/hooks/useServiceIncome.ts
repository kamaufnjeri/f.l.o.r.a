"use client";

import { editServiceIncome, recordServiceIncome } from "@/app/actions/service-income-actions";
import { computeServiceIncomeTotal } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { DebitCredit, JournalEntry, JournalType, ServiceIncome, ServiceIncomeEntry, ServiceIncomeFormData, SelectOptions } from "@/types";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";


const defaultEntry: JournalEntry = {
  account: "",
  debit_credit: "credit",
  amount: 0,
  type: "service_income",
};

const defaultServiceIncomeEntry: ServiceIncomeEntry = {
    service: "",
    quantity: 1,
    price: 0.0
}

export function useServiceIncome(initial?: Partial<ServiceIncome>){
  const {
    serial_numbers,
    serviceIncomeAccounts,
    paymentAccounts,
    customersAccounts,
    expenseDiscountAccounts,
    services,
    setOptions,
  } = useSelectOptionsStore();  const { currentOrg } = useAuthStore();
  const [posting, setPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 const [original, setOriginal] = useState<ServiceIncome | null>(
  initial as ServiceIncome ?? null
);
  const [serviceIncome, setServiceIncome] = useState<ServiceIncomeFormData>({
    date: initial?.date ?? "",
    due_date: initial?.due_date ?? "",
    description: initial?.description ?? "",
    serial_number: initial?.serial_number ?? serial_numbers.service_income,
    journal_entries: initial?.journal_entries ?? [{ ...defaultEntry, account: serviceIncomeAccounts[0]?.id  }, {
      account: paymentAccounts[0]?.id,
      debit_credit: "debit",
      amount: 0,
      type: "payment",
    }],
    service_income_entries: initial?.service_income_entries ?? [{ ...defaultServiceIncomeEntry }]

  });

  const dirtyState = useMemo(() => {
  const state = {
    serial_number: serviceIncome.serial_number !== original?.serial_number,

    date: serviceIncome.date !== original?.date,
    description: serviceIncome.description !== original?.description,
    due_date: serviceIncome.due_date !== original?.due_date,
    journal_entries:
      JSON.stringify(serviceIncome.journal_entries) !==
      JSON.stringify(original?.journal_entries ?? []),
    service_income_entries:
      JSON.stringify(serviceIncome.service_income_entries) !==
      JSON.stringify(original?.service_income_entries ?? []),
  };

  if (!isEditing) {
    return {
      serial_number: false,
      date: false,
      description: false,
      due_date: false,
      journal_entries: false,
    };
  }

  return state;
}, [
  isEditing,
  serviceIncome.serial_number,
  original?.serial_number,
  serviceIncome.date,
  serviceIncome.description,
  serviceIncome.due_date,
  serviceIncome.journal_entries,
  serviceIncome.service_income_entries,
  original?.date,
  original?.due_date,
  original?.description,
  original?.journal_entries,
  original?.service_income_entries
]);



const hasChanges = Object.values(dirtyState).some(Boolean);

  const difference = useMemo(() => {
    return serviceIncome.journal_entries.reduce((acc, entry) => {
      const amount = Number(entry.amount || 0);
  
      return entry.debit_credit === "debit"
        ? acc + amount
        : acc - amount;
      }, 0);
  }, [serviceIncome.journal_entries]);

  const serviceIncomeTotal = useMemo(() => {
  return serviceIncome.service_income_entries.reduce((amount, entry) => {
    const quantity = Number(entry.quantity || 0);
    const price = Number(entry.price || 0);

    return amount + (quantity * price);
  }, 0);
}, [serviceIncome.service_income_entries]);



    const isDirty = (key: keyof typeof dirtyState) => {
  return dirtyState[key];
};
  const handleChange = (field: keyof ServiceIncomeFormData, value: string) => {
    setServiceIncome((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  }

 const addEntry = (type: JournalType, debitCredit: DebitCredit) => {
   setServiceIncome((prev) => ({
    ...prev,
    journal_entries: [...prev.journal_entries, {
      account: "",
      debit_credit: debitCredit,
      amount: 0,
      type
    }],
  }));
};

const updateEntry = <
  K extends keyof JournalEntry
>(
  index: number,
  field: K,
  value: JournalEntry[K]
) => {
  setServiceIncome((prev) => {
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
    setServiceIncome((prev) => {
      const oldEntries = [...prev.journal_entries];
      const updated = oldEntries.filter((_, i) => i !==index);

      return {
        ...prev,
        journal_entries: updated,
      }
    });

  }

 
  // -----------------------
  // ADD ENTRY
  // -----------------------
  const addServiceIncomeEntry = () => {
    setServiceIncome((prev) => ({
      ...prev,
      service_income_entries: [...prev.service_income_entries, { ...defaultServiceIncomeEntry }]
    }));
  };

  // -----------------------
  // UPDATE ENTRY
  // -----------------------
  const updateServiceIncomeEntry = <
  K extends keyof ServiceIncomeEntry
>(
  index: number,
  field: K,
  value: ServiceIncomeEntry[K]
) => {
    setServiceIncome((prev) => {
  const updated = [...prev.service_income_entries];

  updated[index] = {
    ...updated[index],
    [field]: value,
  };

  const total = computeServiceIncomeTotal(updated);

  return {
    ...prev,
    service_income_entries: updated,
    journal_entries: prev.journal_entries.map((entry) =>
      entry.type === "service_income"
        ? { ...entry, amount: total }
        : entry
    ),
  };
});
  };

  // -----------------------
  // REMOVE ENTRY
  // -----------------------
  const removeServiceIncomeEntry = (index: number) => {
   setServiceIncome((prev) => {
  const updated = prev.service_income_entries.filter((_, i) => i !== index);

  const total = computeServiceIncomeTotal(updated);

  return {
    ...prev,
    service_income_entries: updated,
    journal_entries: prev.journal_entries.map((entry) =>
      entry.type === "service_income"
        ? { ...entry, amount: total }
        : entry
    ),
  };
});
  }


  const reset = (newServiceIncome?: ServiceIncomeFormData, selectOptions?: SelectOptions) => {
    const serialNumbers = selectOptions?.serial_numbers;
    if (selectOptions) {
        setOptions(selectOptions);
    }
    setServiceIncome({
      date: newServiceIncome?.date ?? "",
      description: newServiceIncome?.description ?? "",
      due_date: newServiceIncome?.due_date ?? "",
      serial_number: newServiceIncome?.serial_number ?? serialNumbers?.service_income ?? "",
      journal_entries: newServiceIncome?.journal_entries ?? [{ ...defaultEntry, account: serviceIncomeAccounts[0]?.id  }, {
        account: paymentAccounts[0]?.id,
        debit_credit: "debit",
        amount: 0,
        type: "payment",
      }],
      service_income_entries: newServiceIncome?.service_income_entries ?? [{ ...defaultServiceIncomeEntry }]   
    });
    setIsEditing(false);
  }

  const serialNumber =
    serviceIncome.serial_number ||
    serial_numbers.service_income;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    try {
     const finalSerial =
        serviceIncome.serial_number?.trim() || serialNumber;

      const payload = {
        ...serviceIncome,
        serial_number: finalSerial,
      };
    const res = await recordServiceIncome(currentOrg?.id || "", payload);

    if (!res.success) {
        toast.error(res.error || "Something went wrong");
        return;
    }

    toast.success(res.message || "ServiceIncome recorded.");
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
      toast.error("Organisation or serviceIncome ID required");
      return;
    }

    setPosting(true);

    try {
      
      const res = await editServiceIncome(
        currentOrg.id,
        original?.id,
        serviceIncome
      );

      if (!res?.success) {
        toast.error(res.error || "Update failed");
        return;
      }

      toast.success("Service income updated");

      setOriginal(res.serviceIncome);
      reset(res.serviceIncome, res.select_options);
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
        due_date: original?.due_date ?? "",
        serial_number: original?.serial_number ?? "",
        journal_entries: original?.journal_entries ?? [defaultEntry],
        service_income_entries: original?.service_income_entries ?? [defaultServiceIncomeEntry]
    })
  };

  const enableEditing = () => setIsEditing(true);
  return {
    serviceIncome,
    difference,
    handleChange,
    updateEntry,
    addEntry,
    removeEntry,
    addServiceIncomeEntry,
    updateServiceIncomeEntry,
    removeServiceIncomeEntry,
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
    serviceIncomeAccounts,
    paymentAccounts,
    customersAccounts,
    expenseDiscountAccounts,
    services,
    serviceIncomeTotal,
    serialNumber
  };
}