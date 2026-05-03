"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<{
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    nationalId: string;
    email: string;
    occupation: string;
    address: string;
    nextOfKin: string;
    nextOfKinPhone: string;
    gender: "MALE" | "FEMALE" | "OTHER";
  }>;
};

export function MemberFormModal({ open, onClose, initial }: Props) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    phoneNumber: initial?.phoneNumber ?? "",
    nationalId: initial?.nationalId ?? "",
    email: initial?.email ?? "",
    occupation: initial?.occupation ?? "",
    address: initial?.address ?? "",
    nextOfKin: initial?.nextOfKin ?? "",
    nextOfKinPhone: initial?.nextOfKinPhone ?? "",
    gender: initial?.gender ?? "",
  });

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const url = editing
        ? `/api/members/${initial!.id}`
        : "/api/members";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save");
        if (data.details) {
          const e: Record<string, string> = {};
          for (const [k, v] of Object.entries(
            data.details as Record<string, string[]>
          )) {
            e[k] = v[0];
          }
          setErrors(e);
        }
        return;
      }
      toast.success(editing ? "Member updated" : "Member added");
      onClose();
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit member" : "Add new member"}
      size="lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            value={form.firstName}
            onChange={update("firstName")}
            error={errors.firstName}
            required
          />
          <Input
            label="Last name"
            value={form.lastName}
            onChange={update("lastName")}
            error={errors.lastName}
            required
          />
          <Input
            label="Phone number"
            placeholder="+256 7XX XXX XXX"
            value={form.phoneNumber}
            onChange={update("phoneNumber")}
            error={errors.phoneNumber}
            required
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={update("email")}
            error={errors.email}
          />
          <Input
            label="National ID"
            value={form.nationalId}
            onChange={update("nationalId")}
            error={errors.nationalId}
          />
          <div>
            <label className="label">Gender</label>
            <select
              className="input"
              value={form.gender}
              onChange={update("gender")}
            >
              <option value="">—</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Input
            label="Occupation"
            value={form.occupation}
            onChange={update("occupation")}
          />
          <Input
            label="Address"
            value={form.address}
            onChange={update("address")}
          />
          <Input
            label="Next of kin"
            value={form.nextOfKin}
            onChange={update("nextOfKin")}
          />
          <Input
            label="Next of kin phone"
            value={form.nextOfKinPhone}
            onChange={update("nextOfKinPhone")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
          <MagneticButton type="submit" loading={loading}>
            {editing ? "Save changes" : "Add member"}
          </MagneticButton>
        </div>
      </form>
    </Modal>
  );
}
