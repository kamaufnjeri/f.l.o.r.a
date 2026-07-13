"use client";

import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import { useState, KeyboardEvent } from "react";
import { FaTimes } from "react-icons/fa";

export type Invite = {
  email: string;
  role: "viewer" | "editor" | "admin";
};

type Props = {
  name: string;
  value: Invite[];
  onChange: (value: Invite[]) => void;
  max?: number;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function InviteInput({
  name,
  value,
  onChange,
  max = 5,
}: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  const addInvite = () => {
    const clean = email.trim();

    if (!clean) return;
    if (!isValidEmail(clean)) return;
    if (value.length >= max) return;

    if (value.some((i) => i.email === clean)) return;

    onChange([
      ...value,
      {
        email: clean,
        role: role as Invite["role"],
      },
    ]);

    setEmail("");
    setRole("viewer");
  };

  const removeInvite = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      addInvite();
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700">
        Team Members
      </label>

  <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] items-end">
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      Email
    </label>

    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Email address"
      className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  </div>

  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      Role
    </label>

    <select
      value={role}
      onChange={(e) => setRole(e.target.value as Invite["role"])}
      className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
      <option value="admin">Admin</option>
    </select>
  </div>

  <button
    type="button"
    onClick={addInvite}
    className="h-12 cursor-pointer rounded-xl bg-primary px-5 text-white hover:opacity-90"
  >
    Add
  </button>
</div>

      <div className="space-y-2">
        {value.map((invite, index) => (
          <div
            key={invite.email}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-gray-900">
                {invite.email}
              </p>
              <p className="text-sm text-gray-500">
                {invite.role === "admin"
                  ? "Admin"
                  : invite.role === "editor"
                  ? "Editor"
                  : "Viewer"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeInvite(index)}
              className="cursor-pointer text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      <input
        type="hidden"
        name={name}
        value={JSON.stringify(value)}
      />

      <p className="text-xs text-gray-400">
        Maximum {max} team members.
      </p>
    </div>
  );
}