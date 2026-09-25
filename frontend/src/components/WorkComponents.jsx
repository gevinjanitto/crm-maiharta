import React, { useState, useEffect } from "react";
import { CalendarDays, ArrowUpRight, Pencil } from "lucide-react";
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
    [form, setForm] = useState({});
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
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
      due_date: new Date(Date.now() + 604800000).toISOString().slice(0, 10),
      estimate: 0,
<<<<<<< HEAD
      subtasks: "",
    });
    setFile(null);
=======
    });
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
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
    const { project_id, subtasks, ...body } = form;
    try {
      const r = await api.post(`/projects/${project_id}/work/${kind}`, {
        ...body,
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
=======
    const { project_id, ...body } = form;
    try {
      await api.post(`/projects/${project_id}/work/${kind}`, body);
      toast.success(`${revision ? "Revisi" : "Maintenance"} ditambahkan`);
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
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
          />
          <Field
            label="Target selesai"
            name="due_date"
            type="date"
            value={form.due_date || ""}
            onChange={change}
            required
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
            label="Estimasi tambahan (Rp)"
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
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
        </div>
        {error && (
          <p className="form-error" data-testid="work-form-error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <SaveButton busy={busy} />
        </div>
      </form>
    </Modal>
  );
};
export const WorkCards = ({ rows, user, kind, reload, showProject = true }) => {
  const [editing, setEditing] = useState(null),
    [status, setStatus] = useState(""),
    [approved, setApproved] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch(
        `/projects/${editing.project_id}/work/${kind}/${editing.id}`,
        { status, approved },
      );
      toast.success("Status diperbarui");
      setEditing(null);
      reload();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
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
          <Field
            label="Status"
            name="status"
            as="select"
            options={["Terbuka", "Dikerjakan", "Selesai"]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
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
