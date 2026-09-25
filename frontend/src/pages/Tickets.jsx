import React, { useState, useEffect } from "react";
import {
  Search,
  Ticket,
  Clock3,
  CheckCheck,
  ArrowUpRight,
  Send,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../App";
import {
  useData,
  api,
  errorText,
  dateLabel,
  initials,
  money,
  ticketStatuses,
} from "../lib/api";
import {
  PageHead,
  AddButton,
  Loading,
  ErrorState,
  Empty,
  Badge,
  Modal,
  Field,
  SaveButton,
} from "../components/Common";
import { Button } from "../components/ui/button";
const categories = [
  "Bug / Problem",
  "Maintenance",
  "Change Request",
  "Out of Scope",
];
export default function Tickets() {
  const { user } = useAuth(),
    { data, loading, error, reload } = useData("/tickets"),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [show, setShow] = useState(false),
    [selected, setSelected] = useState(null);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const rows = data.filter(
    (t) =>
      (t.title + " " + t.project_name + " " + t.code)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!filter || t.status === filter),
  );
  return (
    <>
      <PageHead
        eyebrow="CLIENT SUPPORT"
        title={user.role === "Client" ? "Tiket saya" : "Tiket client"}
        description="Dengarkan, tindak lanjuti, dan hadirkan solusi terbaik."
      >
        {user.role !== "Developer" && (
          <AddButton id="add-ticket" onClick={() => setShow(true)}>
            Buat tiket
          </AddButton>
        )}
      </PageHead>
      <div className="mini-stats">
        {[
          ["Total tiket", data.length, Ticket],
          [
            "Menunggu tindak lanjut",
            data.filter(
              (t) => !["Selesai", "Ditutup", "Ditolak"].includes(t.status),
            ).length,
            Clock3,
          ],
          [
            "Tiket terselesaikan",
            data.filter((t) => ["Selesai", "Ditutup"].includes(t.status))
              .length,
            CheckCheck,
          ],
        ].map(([n, v, Icon], i) => (
          <div className="mini-stat" key={n} data-testid={`ticket-stat-${i}`}>
            <Icon size={24} />
            <div>
              <small>{n}</small>
              <b>{v}</b>
            </div>
          </div>
        ))}
      </div>
      <div className="list-toolbar">
        <span className="tooltip-text" data-testid="tickets-count">
          {rows.length} tiket
        </span>
        <div className="toolbar-right">
          <div className="list-search">
            <Search size={15} />
            <input
              data-testid="ticket-search"
              placeholder="Cari tiket atau project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            data-testid="ticket-status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Semua status</option>
            {ticketStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="panel table-wrap">
        {rows.length ? (
          <table className="data-table" data-testid="tickets-table">
            <thead>
              <tr>
                <th>Tiket</th>
                <th className="hide-mobile">Project</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th className="hide-mobile">Tanggal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} data-testid={`ticket-row-${t.id}`}>
                  <td>
                    <button
                      data-testid={`open-ticket-${t.id}`}
                      onClick={() => setSelected(t.id)}
                      style={{
                        background: "none",
                        border: 0,
                        textAlign: "left",
                        color: "var(--text)",
                      }}
                    >
                      <b style={{ fontWeight: 550 }}>{t.title}</b>
                      <small
                        style={{
                          display: "block",
                          fontSize: 9,
                          color: "var(--muted-text)",
                          marginTop: 6,
                        }}
                      >
                        {t.code} · {t.category}
                      </small>
                    </button>
                  </td>
                  <td className="hide-mobile">{t.project_name}</td>
                  <td>
                    <Badge id={`ticket-priority-${t.id}`}>{t.priority}</Badge>
                  </td>
                  <td>
                    <Badge id={`ticket-status-${t.id}`}>{t.status}</Badge>
                  </td>
                  <td className="hide-mobile">{dateLabel(t.created_at)}</td>
                  <td>
                    <button
                      className="icon-button"
                      data-testid={`ticket-details-${t.id}`}
                      title="Detail tiket"
                      onClick={() => setSelected(t.id)}
                    >
                      <ArrowUpRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty message="Belum ada tiket yang sesuai." />
        )}
      </div>
      <TicketForm open={show} onClose={() => setShow(false)} onSaved={reload} />
      {selected && (
        <TicketDetail
          id={selected}
          user={user}
          onClose={() => setSelected(null)}
          onSaved={reload}
        />
      )}
    </>
  );
}
const TicketForm = ({ open, onClose, onSaved }) => {
  const [projects, setProjects] = useState([]),
    [form, setForm] = useState({
      project_id: "",
      title: "",
      description: "",
      category: "Bug / Problem",
      priority: "Sedang",
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setError("");
      api
        .get("/projects")
        .then((r) => setProjects(r.data))
        .catch((e) => setError(errorText(e)));
    }
  }, [open]);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/tickets", form);
      toast.success("Tiket dibuat dan menunggu peninjauan");
      setForm({ ...form, title: "", description: "" });
      onSaved();
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Buat tiket baru">
      <form onSubmit={save}>
        <div className="form-grid">
          <div className="form-full">
            <Field
              label="Project"
              name="project_id"
              as="select"
              options={[
                { value: "", label: "Pilih project" },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
              value={form.project_id}
              onChange={change}
              required
            />
          </div>
          <div className="form-full">
            <Field
              label="Judul tiket"
              name="title"
              value={form.title}
              onChange={change}
              required
              minLength={3}
            />
          </div>
          <Field
            label="Kategori permintaan"
            name="category"
            as="select"
            options={categories}
            value={form.category}
            onChange={change}
          />
          <Field
            label="Prioritas"
            name="priority"
            as="select"
            options={["Rendah", "Sedang", "Tinggi", "Mendesak"]}
            value={form.priority}
            onChange={change}
          />
          <div className="form-full">
            <Field
              label="Deskripsi"
              name="description"
              as="textarea"
              placeholder="Ceritakan kendala atau permintaan Anda..."
              value={form.description}
              onChange={change}
              required
              minLength={5}
            />
          </div>
        </div>
        {error && (
          <p className="form-error" data-testid="ticket-form-error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <SaveButton busy={busy} label="Kirim tiket" />
        </div>
      </form>
    </Modal>
  );
};
const transitions = {
  Baru: ["Ditinjau", "Ditolak"],
  Ditinjau: [
    "Menunggu Klarifikasi",
    "Diterima",
    "Ditolak",
    "Menunggu Estimasi Biaya",
  ],
  "Menunggu Klarifikasi": ["Ditinjau", "Ditolak"],
  "Menunggu Estimasi Biaya": ["Menunggu Persetujuan", "Ditolak"],
  "Menunggu Persetujuan": ["Diterima", "Ditolak"],
  Diterima: ["Dikerjakan"],
  Dikerjakan: ["Selesai"],
  Selesai: ["Ditutup"],
  Ditolak: ["Ditutup"],
  Ditutup: [],
};
const TicketDetail = ({ id, user, onClose, onSaved }) => {
  const { data: t, loading, error, reload } = useData(`/tickets/${id}`),
    { data: comments, reload: reloadComments } = useData(
      `/tickets/${id}/comments`,
    ),
    [team, setTeam] = useState([]),
    [form, setForm] = useState({}),
    [busy, setBusy] = useState(false),
    [updateError, setUpdateError] = useState(""),
    [message, setMessage] = useState(""),
    [internal, setInternal] = useState(false),
    [sending, setSending] = useState(false);
  const manager = ["Admin", "Admin Project"].includes(user.role);
  useEffect(() => {
    if (t) {
      setForm({
        status: t.status,
        category: t.category,
        assigned_to: t.assigned_to || "",
        estimate: t.estimate || 0,
      });
      if (manager)
        Promise.all([api.get("/team"), api.get(`/projects/${t.project_id}`)])
          .then(([team, p]) =>
            setTeam(team.data.filter((d) => p.data.assigned_to.includes(d.id))),
          )
          .catch(() => {});
    }
  }, [t, manager]);
  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setUpdateError("");
    try {
      await api.patch(
        `/tickets/${id}`,
        manager ? form : { status: form.status },
      );
      toast.success("Tiket diperbarui");
      reload();
      reloadComments();
      onSaved();
    } catch (e) {
      setUpdateError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  const send = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${id}/comments`, { message, internal });
      setMessage("");
      reloadComments();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setSending(false);
    }
  };
  let options = t ? [t.status, ...(transitions[t.status] || [])] : [];
  if (user.role === "Developer")
    options =
      t?.status === "Diterima"
        ? ["Diterima", "Dikerjakan"]
        : t?.status === "Dikerjakan"
          ? ["Dikerjakan", "Selesai"]
          : [];
  if (user.role === "Client")
    options =
      t?.status === "Menunggu Persetujuan"
        ? ["Menunggu Persetujuan", "Diterima", "Ditolak"]
        : [];
  return (
    <Modal
      open
      onClose={onClose}
      title={t?.title || "Detail tiket"}
      description={t?.code}
    >
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} reload={reload} />
      ) : (
        <>
          <div className="ticket-info">
            <Badge id="ticket-detail-status">{t.status}</Badge>
            <Badge id="ticket-detail-priority">{t.priority}</Badge>
            <span data-testid="ticket-detail-project">{t.project_name}</span>
          </div>
          <p className="ticket-description" data-testid="ticket-description">
            {t.description}
          </p>
          {t.estimate > 0 && (
            <p className="note-block" data-testid="ticket-estimate">
              Estimasi biaya: <b>{money(t.estimate)}</b>
              {t.approved ? " · Disetujui" : ""}
            </p>
          )}
          {options.length > 0 && (
            <form
              onSubmit={save}
              style={{
                borderTop: "1px solid var(--line)",
                paddingTop: 19,
                marginTop: 21,
              }}
            >
              <h3 className="detail-heading">
                {manager
                  ? "Triase & penugasan"
                  : user.role === "Client"
                    ? "Persetujuan estimasi"
                    : "Progres pekerjaan"}
              </h3>
              <div className="form-grid">
                <Field
                  label="Status tiket"
                  name="status"
                  as="select"
                  options={options}
                  value={form.status || t.status}
                  onChange={change}
                />
                {manager && (
                  <>
                    <Field
                      label="Klasifikasi akhir"
                      name="category"
                      as="select"
                      options={categories}
                      value={form.category || t.category}
                      onChange={change}
                    />
                    <Field
                      label="PIC developer"
                      name="assigned_to"
                      as="select"
                      options={[
                        { value: "", label: "Belum ditugaskan" },
                        ...team.map((d) => ({ value: d.id, label: d.name })),
                      ]}
                      value={form.assigned_to || ""}
                      onChange={change}
                    />
                    <Field
                      label="Estimasi biaya (Rp)"
                      name="estimate"
                      type="number"
                      min="0"
                      value={form.estimate ?? 0}
                      onChange={change}
                    />
                  </>
                )}
              </div>
              {updateError && (
                <p className="form-error" data-testid="ticket-update-error">
                  {updateError}
                </p>
              )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
              {manager && form.status === "Diterima" && !t.task_id && (
                <p className="hint-text" data-testid="ticket-kanban-hint">
                  Saat diterima, tiket otomatis masuk ke Kanban project dan PIC
                  menerima notifikasi email.
                </p>
              )}
              {t.task_id && (
                <p className="hint-text" data-testid="ticket-kanban-linked">
                  Tiket ini sudah terhubung ke task Kanban project.
                </p>
              )}
<<<<<<< HEAD
=======
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
              <div className="form-actions">
                <SaveButton busy={busy} label="Perbarui tiket" />
              </div>
            </form>
          )}
          <h3 className="detail-heading" style={{ marginTop: 25 }}>
            Percakapan
          </h3>
          <div className="comments-list">
            {(comments || []).map((c) => (
              <div
                className={`comment-item ${c.system ? "system" : ""}`}
                data-testid={`comment-${c.id}`}
                key={c.id}
              >
                <span className="avatar">{initials(c.author_name)}</span>
                <div className="comment-body">
                  <header>
                    <b>{c.author_name}</b>
                    <span>
                      {c.internal ? "Internal · " : ""}
                      {dateLabel(c.created_at)}
                    </span>
                  </header>
                  <p>{c.message}</p>
                </div>
              </div>
            ))}
            {!comments?.length && (
              <p className="form-note">Belum ada percakapan.</p>
            )}
          </div>
          <form onSubmit={send}>
            <div className="comment-compose">
              <textarea
                data-testid="ticket-comment-input"
                placeholder="Tulis pesan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <Button
                type="submit"
                data-testid="send-ticket-comment"
                className="primary-button"
                disabled={sending || !message.trim()}
                title="Kirim pesan"
              >
                <Send size={16} />
              </Button>
            </div>
            {user.role !== "Client" && (
              <label className="checkbox-label" style={{ marginTop: 12 }}>
                <input
                  data-testid="comment-internal-checkbox"
                  type="checkbox"
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                />
                Catatan internal tim
              </label>
            )}
          </form>
        </>
      )}
    </Modal>
  );
};
