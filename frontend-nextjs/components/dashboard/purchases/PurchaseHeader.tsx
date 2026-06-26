'use client'

import { useAuthStore } from "@/stores/authStore";

type Props = {
    serialNumber: string;
    description: string;
    title: string;
}
function PurchaseHeader({ serialNumber, description, title }: Props) {
    const {currentOrg } = useAuthStore();
    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {title} # {serialNumber} ({currentOrg?.currency ?? 'KSHS'})
            </h1>

            <p className="mt-1 text-sm text-slate-500">
                {description || `${title} transaction details`}
            </p>
        </div>
    )
}

export default PurchaseHeader
