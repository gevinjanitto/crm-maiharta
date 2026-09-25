import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { CalendarDays, ArrowUpRight, Pencil, Trash2, Flag, Inbox, Play } from "lucide-react";
=======
import { CalendarDays, ArrowUpRight, Pencil } from "lucide-react";
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, useData, errorText, dateLabel, money } from "../lib/api";
import {
  Loading,
  ErrorState,
  Empty,
  AddButton,
  Modal,
  Field,
  SaveButton,
  Badge,
} from "./Common";
export const WorkForm = ({ open, onClose, onSaved, kind, project }) => {
  const [projects, setProjects] = useState([]),
    [team, setTeam] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
<<<<<<< HEAD
    [form, setForm] = useState({}),
    [file, setFile] = useState(null);
=======
<<<<<<< HEAD
    [form, setForm] = useState({}),
    [file, setFile] = useState(null);
=======
    [form, setForm] = useState({});
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
  const revision = kind === "revisions",
    options = revision
      ? ["In-scope", "Out-of-scope", "Change Request"]
      : ["Adaptive", "Corrective", "Change Request"];
  useEffect(() => {
    if (!open) return;
    setError("");
    setForm({
      project_id: project?.id || "",
      title: "",
      description: "",
      kind: kind === "revisions" ? "In-scope" : "Adaptive",
      assigned_to: "",
<<<<<<< HEAD
      entry_date: new Date().toISOString().slice(0, 10),
      started_date: "",
      due_date: revision
        ? new Date(Date.now() + 604800000).toISOString().slice(0, 10)
        : "",
      priority: "Sedang",
      estimate: 0,
      subtasks: "",
    });
    setFile(null);
=======
      due_date: new Date(Date.now() + 604800000).toISOString().slice(0, 10),
      estimate: 0,
<<<<<<< HEAD
      subtasks: "",
    });
    setFile(null);
=======
    });
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
    Promise.all([api.get("/projects"), api.get("/team")])
      .then(([p, t]) => {
        setProjects(
          p.data.filter((x) => kind === "revisions" || x.production_at),
        );
        setTeam(t.data);
      })
      .catch((e) => setError(errorText(e)));
  }, [open, project, kind]);
  const selected = project || projects.find((p) => p.id === form.project_id),
    devs = team.filter((t) => selected?.assigned_to.includes(t.id));
  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
      ...(e.target.name === "project_id" ? { assigned_to: "" } : {}),
    });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
    const { project_id, subtasks, ...body } = form;
    try {
      const r = await api.post(`/projects/${project_id}/work/${kind}`, {
        ...body,
<<<<<<< HEAD
        started_date: body.started_date || null,
        due_date: body.due_date || null,
        estimate: Number(body.estimate) || 0,
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
        subtasks: (subtasks || "").split("\n").filter((s) => s.trim()),
      });
      if (file && r.data.task_id) {
        const f = new FormData();
        f.append("file", file);
        await api
          .post(`/projects/${project_id}/tasks/${r.data.task_id}/documents`, f)
          .catch((e) => toast.error(errorText(e)));
      }
      toast.success(
        `${revision ? "Revisi" : "Maintenance"} ditambahkan & masuk ke Kanban`,
      );
<<<<<<< HEAD
=======
=======
    const { project_id, ...body } = form;
    try {
      await api.post(`/projects/${project_id}/work/${kind}`, body);
      toast.success(`${revision ? "Revisi" : "Maintenance"} ditambahkan`);
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
      onSaved();
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={revision ? "Revisi baru" : "Maintenance baru"}
    >
      <form onSubmit={save}>
        <div className="form-grid">
          {!project && (
            <div className="form-full">
              <Field
                label="Project"
                name="project_id"
                as="select"
                options={[
                  { value: "", label: "Pilih project" },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
                value={form.project_id || ""}
                onChange={change}
                required
              />
            </div>
          )}
          <div className="form-full">
            <Field
              label="Judul"
              name="title"
              value={form.title || ""}
              onChange={change}
              required
            />
          </div>
          <Field
            label="Klasifikasi"
            name="kind"
            as="select"
            options={options}
            value={form.kind || options[0]}
            onChange={change}
<<<<<<< HEAD
            required
          />
          <Field
            label="Prioritas"
            name="priority"
            as="select"
            options={["Rendah", "Sedang", "Tinggi", "Mendesak"]}
            value={form.priority || "Sedang"}
            onChange={change}
            required
          />
          <Field
            label="Tanggal masuk"
            name="entry_date"
            type="date"
            value={form.entry_date || ""}
            onChange={change}
            required
          />
          <Field
            label="Tanggal dikerjakan"
            name="started_date"
            type="date"
            min={form.entry_date}
            value={form.started_date || ""}
            onChange={change}
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
          />
          <Field
            label="Target selesai"
            name="due_date"
            type="date"
<<<<<<< HEAD
            min={form.entry_date}
            value={form.due_date || ""}
            onChange={change}
            required={revision}
=======
            value={form.due_date || ""}
            onChange={change}
            required
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
          />
          <Field
            label="PIC developer"
            name="assigned_to"
            as="select"
            options={[
              { value: "", label: "Belum ditugaskan" },
              ...devs.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={form.assigned_to || ""}
            onChange={change}
          />
          <Field
<<<<<<< HEAD
            label="Estimasi biaya tambahan (Rp)"
=======
            label="Estimasi tambahan (Rp)"
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
            name="estimate"
            type="number"
            min="0"
            value={form.estimate ?? 0}
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
          <div className="form-full">
            <Field
              label="Subtask Kanban (satu per baris)"
              name="subtasks"
              as="textarea"
              placeholder={"Perbaiki layout mobile\nUpdate teks halaman"}
              value={form.subtasks || ""}
              onChange={change}
            />
          </div>
          <div className="form-full">
            <Field
              label="Lampiran dokumen (opsional, maks. 10 MB)"
              name="work_file"
              type="file"
              accept=".pdf,.docx,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
<<<<<<< HEAD
=======
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
        </div>
        {error && (
          <p className="form-error" data-testid="work-form-error">
            {error}
          </p>
        )}
<<<<<<< HEAD
        <p className="form-legend">
          <em>*</em> wajib diisi
        </p>
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
        <div className="form-actions">
          <SaveButton busy={busy} />
        </div>
      </form>
    </Modal>
  );
};
<<<<<<< HEAD
const PRIO_COLOR = { Mendesak: "#e5484d", Tinggi: "#f5a623", Sedang: "#4f8ef7", Rendah: "#9aa4b8" };
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
export const WorkCards = ({ rows, user, kind, reload, showProject = true }) => {
  const [editing, setEditing] = useState(null),
    [status, setStatus] = useState(""),
    [approved, setApproved] = useState(false),
<<<<<<< HEAD
    [extra, setExtra] = useState({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const maintenance = kind === "maintenances",
    statusOptions = maintenance
      ? ["Belum dikerjakan", "Development", "Testing", "Selesai"]
      : ["Terbuka", "Dikerjakan", "Selesai"];
  const manager = ["Admin", "Admin Project"].includes(user.role);
=======
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch(
        `/projects/${editing.project_id}/work/${kind}/${editing.id}`,
<<<<<<< HEAD
        {
          status,
          approved,
          started_date: extra.started_date || null,
          due_date: extra.due_date || null,
          priority: extra.priority || null,
          estimate: extra.estimate === "" ? null : Number(extra.estimate),
        },
      );
      toast.success("Pekerjaan diperbarui");
=======
        { status, approved },
      );
      toast.success("Status diperbarui");
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
      setEditing(null);
      reload();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
<<<<<<< HEAD
  const remove = async (r) => {
    if (!window.confirm(`Pindahkan "${r.title}" ke arsip?`)) return;
    try {
      await api.delete(`/projects/${r.project_id}/work/${kind}/${r.id}`);
      toast.success("Dipindahkan ke arsip");
      reload();
    } catch (e) {
      toast.error(errorText(e));
    }
  };
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
  return (
    <>
      <div className="work-card-list">
        {rows.map((r) => (
          <article
            className="work-card"
            key={r.id}
            data-testid={`work-card-${r.id}`}
          >
            <div className="section-heading">
              <Badge id={`work-status-${r.id}`}>{r.status}</Badge>
              <span className="sample-tag">{r.kind}</span>
<<<<<<< HEAD
              {r.priority && (
                <span
                  className="sample-tag"
                  style={{ color: PRIO_COLOR[r.priority], fontWeight: 700 }}
                  data-testid={`work-priority-${r.id}`}
                >
                  <Flag size={12} fill="currentColor" style={{ display: "inline", marginRight: 4 }} />
                  {r.priority}
                </span>
              )}
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
            </div>
            {showProject && (
              <Link
                to={`/projects/${r.project_id}`}
                className="section-link"
                data-testid={`work-project-${r.id}`}
              >
                {r.project_name}
                <ArrowUpRight size={12} />
              </Link>
            )}
            <h3>{r.title}</h3>
            <p>{r.description || "—"}</p>
<<<<<<< HEAD
            <div className="work-meta" data-testid={`work-dates-${r.id}`}>
              <span title="Tanggal masuk">
                <Inbox size={13} /> Masuk {dateLabel(r.entry_date || r.created_at)}
              </span>
              <span title="Tanggal dikerjakan">
                <Play size={13} /> Dikerjakan {r.started_date ? dateLabel(r.started_date) : "—"}
              </span>
              <span title="Target selesai">
                <CalendarDays size={13} /> Target {r.due_date ? dateLabel(r.due_date) : "—"}
              </span>
            </div>
            <div className="work-card-bottom">
              <span>{r.assigned_to ? "PIC ditugaskan" : "Belum ada PIC"}</span>
              {r.estimate > 0 && <span>{money(r.estimate)}</span>}
              {manager && (
                <>
                  <button
                    className="icon-button"
                    data-testid={`edit-work-${r.id}`}
                    title="Perbarui pekerjaan"
                    onClick={() => {
                      setEditing(r);
                      setStatus(r.status);
                      setApproved(r.approved || false);
                      setExtra({
                        started_date: r.started_date || "",
                        due_date: r.due_date || "",
                        priority: r.priority || "Sedang",
                        estimate: r.estimate ?? 0,
                      });
                      setError("");
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="icon-button danger"
                    data-testid={`delete-work-${r.id}`}
                    title="Pindahkan ke arsip"
                    onClick={() => remove(r)}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
=======
            <div className="work-card-bottom">
              <span>
                <CalendarDays
                  size={12}
                  style={{ display: "inline", marginRight: 5 }}
                />
                {dateLabel(r.due_date)}
              </span>
              {r.estimate > 0 && <span>{money(r.estimate)}</span>}
              {["Admin", "Admin Project"].includes(user.role) && (
                <button
                  className="icon-button"
                  data-testid={`edit-work-${r.id}`}
                  title="Perbarui status"
                  onClick={() => {
                    setEditing(r);
                    setStatus(r.status);
                    setApproved(r.approved || false);
                    setError("");
                  }}
                >
                  <Pencil size={14} />
                </button>
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
              )}
            </div>
            {r.completed_at && (
              <p style={{ fontSize: 9, marginTop: 10 }}>
                Selesai pada {dateLabel(r.completed_at)}
              </p>
            )}
          </article>
        ))}
      </div>
      {!rows.length && (
        <Empty
          message={`Belum ada ${kind === "revisions" ? "revisi" : "maintenance"}.`}
        />
      )}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Perbarui pekerjaan"
      >
        <form onSubmit={save}>
<<<<<<< HEAD
          <div className="form-grid">
            <Field
              label="Status pengerjaan"
              name="status"
              as="select"
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            />
            <Field
              label="Prioritas"
              name="priority"
              as="select"
              options={["Rendah", "Sedang", "Tinggi", "Mendesak"]}
              value={extra.priority || "Sedang"}
              onChange={(e) => setExtra({ ...extra, priority: e.target.value })}
              required
            />
            <Field
              label="Tanggal dikerjakan"
              name="started_date"
              type="date"
              value={extra.started_date || ""}
              onChange={(e) => setExtra({ ...extra, started_date: e.target.value })}
            />
            <Field
              label="Target selesai"
              name="due_date"
              type="date"
              value={extra.due_date || ""}
              onChange={(e) => setExtra({ ...extra, due_date: e.target.value })}
            />
            <Field
              label="Estimasi biaya tambahan (Rp)"
              name="estimate"
              type="number"
              min="0"
              value={extra.estimate ?? 0}
              onChange={(e) => setExtra({ ...extra, estimate: e.target.value })}
            />
          </div>
=======
          <Field
            label="Status"
            name="status"
            as="select"
            options={["Terbuka", "Dikerjakan", "Selesai"]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
          {["Out-of-scope", "Change Request"].includes(editing?.kind) && (
            <label className="checkbox-label" style={{ marginTop: 20 }}>
              <input
                data-testid="approve-work-estimate"
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
              />
              Estimasi biaya telah disetujui
            </label>
          )}
          {error && (
            <p className="form-error" data-testid="work-update-error">
              {error}
            </p>
          )}
          <div className="form-actions">
            <SaveButton busy={busy} />
          </div>
        </form>
      </Modal>
    </>
  );
};
export const ProjectWorkTab = ({ p, user, kind }) => {
  const { data, loading, error, reload } = useData(
      `/projects/${p.id}/work/${kind}`,
    ),
    [show, setShow] = useState(false);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const manager = ["Admin", "Admin Project"].includes(user.role),
    allowed = kind === "revisions" || p.production_at;
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>
            {kind === "revisions" ? "Revisi project" : "Maintenance project"}
          </h2>
          {!allowed && (
            <p data-testid="maintenance-restriction">
              Maintenance tersedia setelah project production.
            </p>
          )}
        </div>
        {manager && allowed && (
          <AddButton id="add-project-work" onClick={() => setShow(true)}>
            Tambah {kind === "revisions" ? "revisi" : "maintenance"}
          </AddButton>
        )}
      </div>
      <WorkCards
        rows={data}
        user={user}
        kind={kind}
        reload={reload}
        showProject={false}
      />
      <WorkForm
        open={show}
        onClose={() => setShow(false)}
        onSaved={reload}
        kind={kind}
        project={p}
      />
    </>
  );
};
