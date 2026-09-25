import React, { useEffect, useState } from "react";
import { Trash2, Plus, Download, Paperclip, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  api,
  useData,
  errorText,
  dateLabel,
  download,
  taskStatuses,
  serverStages,
} from "../lib/api";
import { Modal, Field, SaveButton, Badge } from "./Common";
import { Button } from "./ui/button";
const priorities = ["Rendah", "Sedang", "Tinggi", "Mendesak"];
const pick = (t) => ({
  title: t.title,
  description: t.description || "",
  status: t.status,
  server: t.server,
  priority: t.priority,
  assigned_to: t.assigned_to || "",
  due_date: t.due_date || "",
});
export const TaskForm = ({ open, onClose, projectId, team, onSaved }) => {
  const [form, setForm] = useState({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setError("");
      setForm({
        title: "",
        description: "",
        status: "Belum Mulai",
        server: "Belum Naik",
        priority: "Sedang",
        assigned_to: "",
        due_date: "",
        subtasks: "",
      });
    }
  }, [open]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        ...form,
        due_date: form.due_date || null,
        subtasks: form.subtasks.split("\n").filter((s) => s.trim()),
      });
      toast.success("Task ditambahkan ke Kanban");
      onSaved();
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
            <Field
              label="Judul task"
              name="title"
              value={form.title || ""}
              onChange={change}
              required
            />
          </div>
          <Field
            label="Status"
            name="status"
            as="select"
            options={taskStatuses}
            value={form.status || "Belum Mulai"}
            onChange={change}
          />
          <Field
            label="Server"
            name="server"
            as="select"
            options={serverStages}
            value={form.server || "Belum Naik"}
            onChange={change}
          />
          <Field
            label="PIC developer"
            name="assigned_to"
            as="select"
            options={[
              { value: "", label: "Belum ditugaskan" },
              ...team.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={form.assigned_to || ""}
            onChange={change}
          />
          <Field
            label="Prioritas"
            name="priority"
            as="select"
            options={priorities}
            value={form.priority || "Sedang"}
            onChange={change}
          />
          <Field
            label="Target selesai"
            name="due_date"
            type="date"
            value={form.due_date || ""}
            onChange={change}
          />
          <div className="form-full">
            <Field
              label="Deskripsi"
              name="description"
              as="textarea"
              value={form.description || ""}
              onChange={change}
            />
          </div>
          <div className="form-full">
            <Field
              label="Subtask (satu per baris)"
              name="subtasks"
              as="textarea"
              placeholder={"Desain halaman\nIntegrasi API"}
              value={form.subtasks || ""}
              onChange={change}
            />
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
export const TaskModal = ({ task, user, team, onClose, reload }) => {
  const base = `/projects/${task.project_id}/tasks/${task.id}`;
  const manager = ["Admin", "Admin Project"].includes(user.role),
    editable =
      manager ||
      (user.role === "Developer" &&
        ["", user.id].includes(task.assigned_to || ""));
  const [form, setForm] = useState(pick(task)),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sub, setSub] = useState(""),
    [subAssignee, setSubAssignee] = useState(""),
    [file, setFile] = useState(null),
    [uploading, setUploading] = useState(false);
  const docs = useData(`${base}/documents`);
  useEffect(() => setForm(pick(task)), [task]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = manager
        ? { ...form, due_date: form.due_date || null }
        : { status: form.status, server: form.server };
      if (manager && !body.due_date) delete body.due_date;
      await api.patch(base, body);
      toast.success("Task diperbarui");
      reload();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  const act = async (fn, ok) => {
    try {
      await fn();
      if (ok) toast.success(ok);
      reload();
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  const addSub = (e) => {
    e.preventDefault();
    if (!sub.trim()) return;
    act(
      () =>
        api
          .post(`${base}/subtasks`, { title: sub, assigned_to: subAssignee })
          .then(() => {
            setSub("");
            setSubAssignee("");
          }),
      "Subtask ditambahkan",
    );
  };
  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const f = new FormData();
    f.append("file", file);
    try {
      await api.post(`${base}/documents`, f);
      toast.success("Dokumen terlampir");
      setFile(null);
      docs.reload();
      reload();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setUploading(false);
    }
  };
  const remove = () => {
    if (!window.confirm("Hapus task ini?")) return;
    act(() => api.delete(base).then(onClose), "Task dihapus");
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={task.title}
      description={`${task.project_name} · ${task.source !== "manual" ? "Dari " + task.source : "Task manual"}`}
    >
      <div className="ticket-info">
        <Badge id="task-detail-status">{task.status}</Badge>
        <Badge id="task-detail-server">{task.server}</Badge>
        <Badge id="task-detail-priority">{task.priority}</Badge>
        <span data-testid="task-detail-assignee">
          {task.assigned_name || "Belum ditugaskan"}
        </span>
      </div>
      {editable && (
        <form onSubmit={save} className="task-edit-form">
          <div className="form-grid">
            {manager && (
              <div className="form-full">
                <Field
                  label="Judul"
                  name="title"
                  value={form.title}
                  onChange={change}
                  required
                />
              </div>
            )}
            <Field
              label="Status"
              name="status"
              as="select"
              options={taskStatuses}
              value={form.status}
              onChange={change}
            />
            <Field
              label="Server"
              name="server"
              as="select"
              options={serverStages}
              value={form.server}
              onChange={change}
            />
            {manager && (
              <>
                <Field
                  label="PIC developer"
                  name="assigned_to"
                  as="select"
                  options={[
                    { value: "", label: "Belum ditugaskan" },
                    ...team.map((t) => ({ value: t.id, label: t.name })),
                  ]}
                  value={form.assigned_to}
                  onChange={change}
                />
                <Field
                  label="Prioritas"
                  name="priority"
                  as="select"
                  options={priorities}
                  value={form.priority}
                  onChange={change}
                />
                <Field
                  label="Target selesai"
                  name="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={change}
                />
                <div className="form-full">
                  <Field
                    label="Deskripsi"
                    name="description"
                    as="textarea"
                    value={form.description}
                    onChange={change}
                  />
                </div>
              </>
            )}
          </div>
          {error && (
            <p className="form-error" data-testid="task-update-error">
              {error}
            </p>
          )}
          <div className="form-actions">
            {manager && (
              <Button
                type="button"
                variant="outline"
                data-testid="delete-task"
                onClick={remove}
              >
                <Trash2 size={14} /> Hapus
              </Button>
            )}
            <SaveButton busy={busy} label="Simpan task" />
          </div>
        </form>
      )}
      {!editable && task.description && (
        <p className="ticket-description">{task.description}</p>
      )}
      <h3 className="detail-heading" style={{ marginTop: 24 }}>
        Subtask ({(task.subtasks || []).filter((s) => s.done).length}/
        {(task.subtasks || []).length})
      </h3>
      <div className="subtask-list">
        {(task.subtasks || []).map((s) => (
          <div
            className={`subtask-item ${s.done ? "done" : ""}`}
            key={s.id}
            data-testid={`subtask-${s.id}`}
          >
            <input
              type="checkbox"
              data-testid={`subtask-toggle-${s.id}`}
              checked={s.done}
              disabled={!editable}
              onChange={(e) =>
                act(() =>
                  api.patch(`${base}/subtasks/${s.id}`, {
                    done: e.target.checked,
                  }),
                )
              }
            />
            <span className="subtask-title">{s.title}</span>
            {manager ? (
              <select
                className="subtask-assignee"
                data-testid={`subtask-assignee-${s.id}`}
                value={s.assigned_to || ""}
                onChange={(e) =>
                  act(
                    () =>
                      api.patch(`${base}/subtasks/${s.id}`, {
                        assigned_to: e.target.value,
                      }),
                    "PIC subtask diperbarui",
                  )
                }
              >
                <option value="">PIC —</option>
                {team.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <small>{s.assigned_name || ""}</small>
            )}
            {editable && (
              <button
                className="icon-button danger"
                title="Hapus subtask"
                data-testid={`delete-subtask-${s.id}`}
                onClick={() =>
                  act(() => api.delete(`${base}/subtasks/${s.id}`))
                }
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
        {!(task.subtasks || []).length && (
          <p className="form-note">Belum ada subtask.</p>
        )}
      </div>
      {editable && (
        <form onSubmit={addSub} className="subtask-add">
          <input
            data-testid="subtask-input"
            placeholder="Tambah subtask..."
            value={sub}
            onChange={(e) => setSub(e.target.value)}
          />
          {manager && (
            <select
              data-testid="subtask-input-assignee"
              value={subAssignee}
              onChange={(e) => setSubAssignee(e.target.value)}
            >
              <option value="">PIC —</option>
              {team.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <Button
            type="submit"
            className="primary-button"
            data-testid="add-subtask"
            disabled={!sub.trim()}
          >
            <Plus size={15} />
          </Button>
        </form>
      )}
      <h3 className="detail-heading" style={{ marginTop: 24 }}>
        <Paperclip size={13} style={{ display: "inline", marginRight: 5 }} />
        Dokumen task ({docs.data?.length || 0})
      </h3>
      <div className="task-docs">
        {(docs.data || []).map((d) => (
          <div className="task-doc" key={d.id} data-testid={`task-doc-${d.id}`}>
            <div>
              <b>{d.name}</b>
              <small>
                {(d.size / 1024).toFixed(1)} KB · {dateLabel(d.created_at)} ·{" "}
                {d.uploaded_by}
              </small>
            </div>
            <button
              className="icon-button"
              title="Unduh"
              data-testid={`download-task-doc-${d.id}`}
              onClick={() =>
                download(
                  `/projects/${task.project_id}/documents/${d.id}/download`,
                  d.name,
                )
              }
            >
              <Download size={14} />
            </button>
          </div>
        ))}
        {!docs.data?.length && <p className="form-note">Belum ada dokumen.</p>}
      </div>
      {editable && (
        <form onSubmit={upload} className="subtask-add">
          <input
            type="file"
            data-testid="task-doc-input"
            accept=".pdf,.docx,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.webp"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="submit"
            className="primary-button"
            data-testid="upload-task-doc"
            disabled={!file || uploading}
          >
            <Upload size={14} /> {uploading ? "Mengunggah..." : "Unggah"}
          </Button>
        </form>
      )}
    </Modal>
  );
};
