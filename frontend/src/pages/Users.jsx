import React, { useState, useEffect } from "react";
import { Search, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../App";
import { api, useData, errorText, initials } from "../lib/api";
import {
  PageHead,
  Loading,
  ErrorState,
  Empty,
  AddButton,
  Badge,
  Modal,
  Field,
  SaveButton,
} from "../components/Common";
const roles = ["Admin", "Admin Project", "Developer", "Accounting", "Client"];
export default function Users() {
  const { user } = useAuth(),
    { data, loading, error, reload } = useData("/users"),
    [search, setSearch] = useState(""),
    [show, setShow] = useState(false),
    [editing, setEditing] = useState(null),
    [clients, setClients] = useState([]),
    [form, setForm] = useState({}),
    [busy, setBusy] = useState(false),
    [formError, setFormError] = useState("");
  useEffect(() => {
    api
      .get("/clients")
      .then((r) => setClients(r.data))
      .catch(() => {});
  }, []);
  const open = (u) => {
    setEditing(u);
    setForm(
      u
        ? { role: u.role, client_id: u.client_id || "", active: u.active }
        : {
            name: "",
            username: "",
            email: "",
            password: "",
            role: "Developer",
            client_id: "",
          },
    );
    setFormError("");
    setShow(true);
  };
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      editing
        ? await api.patch(`/users/${editing.id}`, form)
        : await api.post("/users", form);
      toast.success("User berhasil disimpan");
      setShow(false);
      reload();
    } catch (e) {
      setFormError(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (u) => {
    try {
      await api.patch(`/users/${u.id}`, { active: !u.active });
      reload();
      toast.success(u.active ? "User dinonaktifkan" : "User diaktifkan");
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const rows = data.filter((u) =>
    (u.name + " " + u.username + " " + u.role)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHead
        eyebrow="WORKSPACE ACCESS"
        title="Manajemen user"
        description="Orang yang tepat, akses yang tepat."
      >
        <AddButton id="add-user" onClick={() => open(null)}>
          User baru
        </AddButton>
      </PageHead>
      <div className="list-toolbar">
        <span className="tooltip-text" data-testid="users-count">
          {data.length} anggota workspace ·{" "}
          {data.filter((u) => u.active).length} aktif
        </span>
        <div className="list-search">
          <Search size={15} />
          <input
            data-testid="user-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau role..."
          />
        </div>
      </div>
      <div className="panel table-wrap">
        {rows.length ? (
          <table className="data-table" data-testid="users-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th className="hide-mobile">Email</th>
                <th>Role</th>
                <th>Aktif</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} data-testid={`user-row-${u.id}`}>
                  <td>
                    <div className="table-name">
                      <span className="avatar">{initials(u.name)}</span>
                      <div>
                        <b>{u.name}</b>
                        {u.id === user.id && <small>Anda</small>}
                      </div>
                    </div>
                  </td>
                  <td>{u.username}</td>
                  <td className="hide-mobile">{u.email}</td>
                  <td>
                    <Badge id={`user-role-${u.id}`}>{u.role}</Badge>
                  </td>
                  <td>
                    <input
                      data-testid={`user-active-${u.id}`}
                      type="checkbox"
                      checked={u.active}
                      onChange={() => toggle(u)}
                      disabled={u.id === user.id}
                      aria-label={`Status aktif ${u.name}`}
                    />
                  </td>
                  <td>
                    <button
                      data-testid={`edit-user-${u.id}`}
                      className="icon-button"
                      title="Edit akses user"
                      onClick={() => open(u)}
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty message="User tidak ditemukan." />
        )}
      </div>
      <Modal
        open={show}
        onClose={() => setShow(false)}
        title={editing ? `Akses ${editing.name}` : "User baru"}
      >
        <form onSubmit={save}>
          <div className="form-grid">
            {!editing && (
              <>
                <Field
                  label="Nama lengkap"
                  name="name"
                  value={form.name || ""}
                  onChange={change}
                  required
                />
                <Field
                  label="Username"
                  name="username"
                  value={form.username || ""}
                  onChange={change}
                  minLength={3}
                  pattern="[a-zA-Z0-9_.\-]+"
                  required
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email || ""}
                  onChange={change}
                  required
                />
                <Field
                  label="Password awal"
                  name="password"
                  type="password"
                  minLength={10}
                  value={form.password || ""}
                  onChange={change}
                  autoComplete="new-password"
                  required
                />
              </>
            )}
            <Field
              label="Role"
              name="role"
              as="select"
              options={roles}
              value={form.role || "Developer"}
              onChange={change}
            />
            {form.role === "Client" && (
              <Field
                label="Terhubung ke client"
                name="client_id"
                as="select"
                options={[
                  { value: "", label: "Pilih client" },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={form.client_id || ""}
                onChange={change}
                required
              />
            )}
          </div>
          {!editing && (
            <p className="form-note">
              Password minimal 10 karakter. Pengguna dapat menggantinya di
              Pengaturan.
            </p>
          )}
          {formError && (
            <p className="form-error" data-testid="user-form-error">
              {formError}
            </p>
          )}
          <div className="form-actions">
            <SaveButton busy={busy} />
          </div>
        </form>
      </Modal>
    </>
  );
}
