import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errorText, serverStages } from "../lib/api";
import { Modal, Field, SaveButton } from "./Common";
import { PRIORITIES } from "./kanban/helpers";

const blank = (status) => ({
  title: "",
  description: "",
  status,
  server: "Belum Naik",
  priority: "Sedang",
  assigned_to: "",
  start_date: "",
  due_date: "",
  estimate_hours: 0,
  tags: "",
  subtasks: "",
});

export const TaskForm = ({ open, onClose, projectId, team, statuses = [], onSaved }) => {
  const [form, setForm] = useState(blank("")),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setError("");
      setForm(blank(statuses[0]?.name || "Belum Mulai"));
    }
  }, [open, statuses]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post(`/projects/${projectId}/tasks`, {
        ...form,
        estimate_hours: Number(form.estimate_hours) || 0,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        subtasks: form.subtasks.split("\n").filter((s) => s.trim()),
      });
      toast.success("Task ditambahkan ke Kanban");
      onSaved(r.data);
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Task baru">
      <form onSubmit={save}>
        <div className="form-grid">
          <div className="form-full">
            <Field label="Judul task" name="title" value={form.title} onChange={change} required autoFocus />
          </div>
          <Field label="Status" name="status" as="select" options={statuses.map((s) => s.name)} value={form.status} onChange={change} />
          <Field label="Server" name="server" as="select" options={serverStages} value={form.server} onChange={change} />
          <Field
            label="PIC developer"
            name="assigned_to"
            as="select"
            options={[{ value: "", label: "Belum ditugaskan" }, ...team.map((t) => ({ value: t.id, label: t.name }))]}
            value={form.assigned_to}
            onChange={change}
          />
          <Field label="Prioritas" name="priority" as="select" options={PRIORITIES} value={form.priority} onChange={change} />
          <Field label="Tanggal mulai" name="start_date" type="date" value={form.start_date} onChange={change} />
          <Field label="Target selesai" name="due_date" type="date" value={form.due_date} onChange={change} />
          <Field label="Estimasi (jam)" name="estimate_hours" type="number" min="0" step="0.5" value={form.estimate_hours} onChange={change} />
          <Field label="Tag (pisahkan koma)" name="tags" placeholder="Frontend, API" value={form.tags} onChange={change} />
          <div className="form-full">
            <Field label="Deskripsi" name="description" as="textarea" value={form.description} onChange={change} />
          </div>
          <div className="form-full">
            <Field label="Subtask (satu per baris)" name="subtasks" as="textarea" placeholder={"Desain halaman\nIntegrasi API"} value={form.subtasks} onChange={change} />
          </div>
        </div>
        {error && (
          <p className="form-error" data-testid="task-form-error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <SaveButton busy={busy} label="Buat task" />
        </div>
      </form>
    </Modal>
  );
};
