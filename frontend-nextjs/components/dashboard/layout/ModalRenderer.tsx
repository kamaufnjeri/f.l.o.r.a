"use client";

import { ModalName } from "@/types";
import CreateAccountModal from "../accounts/CreateAccountModal";
import CreateStockModal from "../stocks/CreateStockModal";
import CreateServiceModal from "../services/CreateServiceModal";
import CreateSupplierModal from "../suppliers/CreateSupplierModal";
import CreateCustomerModal from "../customers/CreateCustomerModal";
import { useModalStore } from "@/stores/modalStore";
import { ComponentType } from "react";
import ManageCategoriesModal from "../accounts/ManageCategoriesModal";

export type ModalComponentProps = {
  open: boolean;
  onClose: () => void;
  [key: string]: unknown;
};

export type ModalComponent = ComponentType<ModalComponentProps>;

export const MODAL_REGISTRY: Record<ModalName, ModalComponent> = {
  account: CreateAccountModal,
  stock: CreateStockModal,
  service: CreateServiceModal,
  supplier: CreateSupplierModal,
  customer: CreateCustomerModal,
  accountGroups: ManageCategoriesModal
};

export default function ModalRenderer() {
  const { activeModal, modalProps, closeModal } = useModalStore();

  if (!activeModal) return null;

  const ModalComponent = MODAL_REGISTRY[activeModal];

  if (!ModalComponent) return null;

  return (
    <ModalComponent
      open={true}
      onClose={closeModal}
      {...modalProps}
    />
  );
}