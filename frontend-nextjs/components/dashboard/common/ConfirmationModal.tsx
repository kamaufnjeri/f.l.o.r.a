"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import ModalHeader from "./ModalHeader";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;

  title: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  tone?: "danger" | "warning" | "primary";

  onConfirm: () => Promise<void> | void;
};

export default function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "danger",
  onConfirm,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toneStyles = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    primary: "bg-black hover:bg-gray-800",
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh] w-full max-w-lg mx-auto bg-white overflow-hidden">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <ModalHeader
            title={title}
            description={description}
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="px-6 py-6 bg-gray-50/50 text-sm text-gray-600">
          Are you sure you want to continue? This action cannot be undone.
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 cursor-pointer text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`
              px-4 py-2 text-sm rounded-lg text-white transition cursor-pointer
              ${toneStyles[tone]}
              ${loading ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}