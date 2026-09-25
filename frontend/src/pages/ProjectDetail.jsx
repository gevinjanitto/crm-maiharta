import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Check, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../App";
import {
  api,
  useData,
  errorText,
  dateLabel,
  statuses,
  money,
} from "../lib/api";
import {
  PageHead,
  Loading,
  ErrorState,
  Badge,
  Progress,
  Field,
  SaveButton,
} from "../components/Common";
import { Button } from "../components/ui/button";
import { ProjectForm } from "../components/ProjectForm";
import {
  FeaturesTab,
  TimelineTab,
  CostsTab,
  HistoryTab,
} from "../components/ProjectTabs";
import { DocumentsTab, DeploymentsTab } from "../components/DocumentTabs";
import { ProjectWorkTab } from "../components/WorkComponents";
<<<<<<< HEAD
import { KanbanTab } from "../components/KanbanTab";
=======
<<<<<<< HEAD
import { KanbanTab } from "../components/KanbanTab";
=======
<<<<<<< HEAD
import { KanbanTab } from "../components/KanbanTab";
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
export default function ProjectDetail() {
  const { id } = useParams(),
    { user } = useAuth(),
    navigate = useNavigate(),
    { data: p, loading, error, reload } = useData(`/projects/${id}`),
    [tab, setTab] = useState("Ringkasan"),
    [edit, setEdit] = useState(false);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const manager = ["Admin", "Admin Project"].includes(user.role),
    internal = ["Admin", "Admin Project", "Developer"].includes(user.role);
  const tabs = [
    "Ringkasan",
<<<<<<< HEAD
    "Kanban",
=======
<<<<<<< HEAD
    "Kanban",
=======
<<<<<<< HEAD
    "Kanban",
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
    "Fitur",
    "Timeline",
    "Dokumen",
    ...(["Admin", "Accounting"].includes(user.role) ? ["Keuangan"] : []),
    ...(internal ? ["Deployment", "Revisi", "Maintenance"] : []),
    "Riwayat",
  ];
  const remove = async () => {
    if (!window.confirm("Hapus project baru ini?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project dihapus");
      navigate("/projects");
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  return (
    <>
      <Link className="back-link" to="/projects" data-testid="back-to-projects">
        <ArrowLeft size={14} />
        Semua project
      </Link>
      <PageHead
<<<<<<< HEAD
        eyebrow={`${p.code} / ${(p.platforms || [p.category]).join(" · ")}`}
=======
<<<<<<< HEAD
        eyebrow={`${p.code} / ${(p.platforms || [p.category]).join(" · ")}`}
=======
        eyebrow={`${p.code} / ${p.category}`}
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
        title={p.name}
        description={p.client_name}
      >
        <Badge id="detail-project-status">{p.status}</Badge>
        {manager && (
          <Button
            className="secondary-button"
            data-testid="edit-project"
            onClick={() => setEdit(true)}
          >
            <Pencil size={14} />
            Edit project
          </Button>
        )}
        {manager && p.status === "Project Masuk" && (
          <button
            className="icon-button danger"
            title="Hapus project"
            data-testid="delete-project"
            onClick={remove}
          >
            <Trash2 size={16} />
          </button>
        )}
      </PageHead>
      <div className="detail-summary">
        <div data-testid="detail-client">
          <small>Client</small>
          <b>{p.client_name}</b>
        </div>
        <div data-testid="detail-start">
          <small>Tanggal mulai</small>
          <b>{dateLabel(p.start_date)}</b>
        </div>
        <div data-testid="detail-deadline">
          <small>Target selesai</small>
          <b>{dateLabel(p.due_date)}</b>
        </div>
        <div>
          <small>Progress keseluruhan</small>
          <Progress id="detail-progress" value={p.progress} />
        </div>
      </div>
      <div className="detail-tabs">
        {tabs.map((t) => (
          <button
            data-testid={`detail-tab-${t.toLowerCase()}`}
            key={t}
            className={`detail-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="detail-content" key={tab}>
        {tab === "Ringkasan" && <Overview p={p} user={user} reload={reload} />}{" "}
<<<<<<< HEAD
        {tab === "Kanban" && <KanbanTab p={p} user={user} />}{" "}
=======
<<<<<<< HEAD
        {tab === "Kanban" && <KanbanTab p={p} user={user} />}{" "}
=======
<<<<<<< HEAD
        {tab === "Kanban" && <KanbanTab p={p} user={user} />}{" "}
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
        {tab === "Fitur" && (
          <FeaturesTab p={p} user={user} reloadProject={reload} />
        )}{" "}
        {tab === "Timeline" && <TimelineTab p={p} />}{" "}
        {tab === "Dokumen" && <DocumentsTab p={p} user={user} />}{" "}
        {tab === "Keuangan" && (
          <CostsTab p={p} user={user} reloadProject={reload} />
        )}{" "}
        {tab === "Deployment" && <DeploymentsTab p={p} user={user} />}{" "}
        {tab === "Revisi" && (
          <ProjectWorkTab p={p} user={user} kind="revisions" />
        )}{" "}
        {tab === "Maintenance" && (
          <ProjectWorkTab p={p} user={user} kind="maintenances" />
        )}{" "}
        {tab === "Riwayat" && <HistoryTab p={p} />}
      </div>
      <ProjectForm
        open={edit}
        onClose={() => setEdit(false)}
        project={p}
        onSaved={reload}
      />
    </>
  );
}
const Overview = ({ p, user, reload }) => {
  const [next, setNext] = useState(""),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const idx = statuses.indexOf(p.status),
    options = statuses.slice(idx + 1, idx + 2);
  if (p.status === "Testing") options.push("Uploaded to Production");
  if (p.status === "Revisi") options.push("Testing");
  const available = options.filter(
    (s) =>
      user.role === "Admin" ||
      (user.role === "Admin Project" &&
        !["Uploaded to Production", "Selesai"].includes(s)) ||
      (user.role === "Developer" &&
        ["Development", "Uploaded to Dev Server", "Testing", "Revisi"].includes(
          p.status,
        ) &&
        ["Uploaded to Dev Server", "Testing", "Revisi"].includes(s)),
  );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(`/projects/${p.id}/status`, { status: next, note });
      toast.success("Status project diperbarui");
      setNext("");
      setNote("");
      reload();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="detail-overview">
      <section>
        <h2 className="detail-heading">Tentang project</h2>
        <p className="detail-description" data-testid="project-description">
          {p.description || "Belum ada deskripsi."}
        </p>
        <div className="overview-stats">
          <div data-testid="project-scale">
            <small>Skala project</small>
            <b>{p.type}</b>
          </div>
          <div data-testid="project-developer-count">
            <small>Developer</small>
            <b>{p.assigned_to.length}</b>
          </div>
          {p.value !== undefined && (
            <div data-testid="project-value">
              <small>Nilai project</small>
              <b style={{ fontSize: 15 }}>{money(p.value)}</b>
            </div>
          )}
        </div>
        {p.internal_notes && (
          <div className="note-block" data-testid="project-internal-notes">
            <b>Catatan internal</b>
            <p>{p.internal_notes}</p>
          </div>
        )}
        {available.length > 0 && (
          <section style={{ marginTop: 35 }}>
            <h2 className="detail-heading">Perbarui status</h2>
            <form onSubmit={submit}>
              <div className="form-grid">
                <Field
                  label="Status selanjutnya"
                  name="status"
                  as="select"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  options={[{ value: "", label: "Pilih status" }, ...available]}
                  required
                />
                <Field
                  label="Catatan perubahan"
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              {error && (
                <p className="form-error" data-testid="status-update-error">
                  {error}
                </p>
              )}
              <div className="form-actions">
                <SaveButton busy={busy} label="Perbarui status" />
              </div>
            </form>
          </section>
        )}
      </section>
      <section className="panel panel-padding">
        <h2 className="detail-heading">Perjalanan project</h2>
        <div className="workflow-list">
          {statuses.map((s, i) => (
            <div
              key={s}
              data-testid={`workflow-step-${i}`}
              className={`workflow-step ${i < idx ? "done" : ""} ${i === idx ? "current" : ""}`}
            >
              <span>{i < idx ? <Check size={12} /> : i + 1}</span>
              <span>{s}</span>
              {i === idx && <Badge>Aktif</Badge>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
