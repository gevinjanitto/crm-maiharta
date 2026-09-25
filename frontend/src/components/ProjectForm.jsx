import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errorText } from "../lib/api";
import { Modal, Field, SaveButton } from "./Common";
import { Button } from "./ui/button";
export const ProjectForm = ({ open, onClose, onSaved, project }) => {
  const [clients, setClients] = useState([]),
    [team, setTeam] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [form, setForm] = useState({});
  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      project
        ? Object.fromEntries(
            [
              "name",
              "client_id",
              "description",
              "category",
              "type",
              "value",
              "start_date",
              "due_date",
              "assigned_to",
              "internal_notes",
            ].map((k) => [k, project[k] ?? ""]),
          )
        : {
            name: "",
            client_id: "",
            description: "",
            category: "Web Development",
            type: "Besar",
            value: 0,
            start_date: new Date().toISOString().slice(0, 10),
            due_date: new Date(Date.now() + 2592000000)
              .toISOString()
              .slice(0, 10),
            assigned_to: [],
            internal_notes: "",
          },
    );
    Promise.all([api.get("/clients"), api.get("/team")])
      .then(([c, t]) => {
        setClients(c.data);
        setTeam(t.data);
      })
      .catch((e) => setError(errorText(e)));
  }, [open, project]);
  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = project
        ? await api.patch(`/projects/${project.id}`, form)
        : await api.post("/projects", form);
      toast.success(project ? "Project diperbarui" : "Project berhasil dibuat");
      onSaved(r.data);
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
      title={project ? "Edit project" : "Project baru"}
      description="Mulai langkah berikutnya bersama tim Anda."
    >
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="form-full">
            <Field
              label="Nama project"
              name="name"
              value={form.name || ""}
              onChange={change}
              placeholder="Contoh: Nusantara — Company Profile"
              required
            />
          </div>
          <Field
            label="Client"
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
          <Field
            label="Kategori"
            name="category"
            as="select"
            options={[
              "Web Development",
              "Web Application",
              "E-Commerce",
              "Mobile Application",
              "UI/UX Design",
              "Lainnya",
            ]}
            value={form.category || "Web Development"}
            onChange={change}
          />
          <Field
            label="Skala project"
            name="type"
            as="select"
            options={["Besar", "Kecil"]}
            value={form.type || "Besar"}
            onChange={change}
          />
          <Field
            label="Nilai project (Rp)"
            name="value"
            type="number"
            min="0"
            value={form.value ?? 0}
            onChange={change}
            required
          />
          <Field
            label="Tanggal mulai"
            name="start_date"
            type="date"
            value={form.start_date || ""}
            onChange={change}
            required
          />
          <Field
            label="Target selesai"
            name="due_date"
            type="date"
            min={form.start_date}
            value={form.due_date || ""}
            onChange={change}
            required
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
            <p className="form-note">Developer yang ditugaskan</p>
            {team.map((t) => (
              <label key={t.id} className="checkbox-label">
                <input
                  data-testid={`assign-developer-${t.id}`}
                  type="checkbox"
                  checked={(form.assigned_to || []).includes(t.id)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      assigned_to: e.target.checked
                        ? [...(form.assigned_to || []), t.id]
                        : form.assigned_to.filter((id) => id !== t.id),
                    })
                  }
                />
                {t.name}
              </label>
            ))}
          </div>
          <div className="form-full">
            <Field
              label="Catatan internal"
              name="internal_notes"
              as="textarea"
              value={form.internal_notes || ""}
              onChange={change}
            />
          </div>
        </div>
        {error && (
          <p className="form-error" data-testid="project-form-error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button
            data-testid="cancel-project-form"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
          <SaveButton
            busy={busy}
            label={project ? "Simpan perubahan" : "Buat project"}
          />
        </div>
      </form>
    </Modal>
  );
};
