'use client'

import { useModalStore } from '@/stores/modalStore';
import { ModalName } from '@/types';

type Props = {
    title: string;
    modalName: ModalName
}
function NoItem({ title, modalName}: Props) {
  const openModal = useModalStore((s) => s.openModal);

  return (
     
    <div className="bg-white border rounded-xl p-10 text-center space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
        No {title} found
        </h2>

        <p className="text-sm text-gray-500">
        Create your first {modalName} entry to get started.
        </p>

        <button
         onClick={() => openModal(modalName)}

        className="cursor-pointer inline-block bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
        >
        + Add {title}
        </button>
    </div>
  )
}

export default NoItem
