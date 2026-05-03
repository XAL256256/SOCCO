"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function MeetingFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    meetingDate: new Date().toISOString().slice(0, 16),
    location: "NBOOG Hall, Mukono",
    agenda: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      toast.success("Meeting scheduled");
      onClose();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule meeting" size="md">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="May Monthly Meeting"
          required
        />
        <Input
          label="Date & time"
          type="datetime-local"
          value={form.meetingDate}
          onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
          required
        />
        <Input
          label="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <div>
          <label className="label">Agenda</label>
          <textarea
            className="input min-h-[120px]"
            value={form.agenda}
            onChange={(e) => setForm({ ...form, agenda: e.target.value })}
            placeholder="Welfare, savings, member updates…"
          />
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <MagneticButton type="submit" loading={loading}>
            Schedule
          </MagneticButton>
        </div>
      </form>
    </Modal>
  );
}
