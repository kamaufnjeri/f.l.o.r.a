"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClose={onClose}
      className="modal"
    >
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>

      <style jsx>{`
        dialog.modal {
          padding: 0;
          border: none;
          width: min(1200px, 95vw);
          max-width: 95vw;
          margin: auto;
          background: transparent;

          /* center fallback */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        dialog::backdrop {
          background: rgba(0, 0, 0, 0.4);
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
        }

        .modal-content {
          position: relative;
          background: white;
          width: auto;
          max-width: 95vw;

          max-height: 90vh;
          overflow-y: auto;

          border-radius: 12px;
          padding-bottom:20px;

          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </dialog>
  );
}