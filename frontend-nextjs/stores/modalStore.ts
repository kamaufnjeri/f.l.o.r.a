import { ModalName } from "@/types";
import { create } from "zustand";

type ModalState = {
  activeModal: ModalName | null;
  modalProps?: Record<string, unknown>;

  openModal: (name: ModalName, props?: Record<string, unknown>) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  modalProps: undefined,

  openModal: (name, props) =>
    set({
      activeModal: name,
      modalProps: props,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalProps: undefined,
    }),
}));