import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Play,
  Square,
  Download,
  Upload,
  Flag,
  Send,
  Clock,
  Tag,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";
import { api, useData, errorText, dateLabel, download, serverStages } from "../../lib/api";
import { Avatar } from "./TaskCard";
import {
  PRIORITIES,
  PRIORITY_COLOR,
  SOURCE_LABEL,
  isManager,
  canEditTask,
  colorOf,
  fmtDuration,
} from "./helpers";

const useTick = (active) => {
  const [, set] = useState(0);
  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => set((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, [active]);
};

const Prop = ({ label, children, id }) => (
  <div className="ck-prop" data-testid={id}>
    <small>{label}</small>
    {children}
  </div>
);

export const TaskDetail = ({ task, project, user, team, statuses, onClose, onChange, onDelete }) => {
  const base = `/projects/${task.project_id}/tasks/${task.id}`;
  const manager = isManager(user),
    editable = canEditTask(user, task),
    tracker = editable;
  const [title, setTitle] = useState(task.title),
    [desc, setDesc] = useState(task.description || ""),
    [tag, setTag] = useState(""),
    [sub, setSub] = useState(""),
    [file, setFile] = useState(null),
    [comment, setComment] = useState(""),
    [minutes, setMinutes] = useState(""),
    [note, setNote] = useState(""),
    [wide, setWide] = useState(false);
  const docs = useData(`${base}/documents`),
    comments = useData(`${base}/comments`);
  useTick(!!task.running_entry);
  const feedRef = useRef(null);
  useEffect(() => {
    setTitle(task.title);
    setDesc(task.description || "");
  }, [task.id, task.title, task.description]);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const run = async (fn, ok) => {
    try {
      const r = await fn();
      if (r?.data?.id) onChange(r.data);
      if (ok) toast.success(ok);
      return r;
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  const patch = (body, ok) => run(() => api.patch(base, body), ok);
  const running = task.running_entry
    ? Math.floor((Date.now() - new Date(task.running_entry.started_at)) / 1000)
    : 0;
  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const f = new FormData();
    f.append("file", file);
    await run(() => api.post(`${base}/documents`, f), "Lampiran ditambahkan");
    setFile(null);
    docs.reload();
    onChange({ ...task, document_count: (task.document_count || 0) + 1 });
  };
  const sendComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const r = await run(() => api.post(`${base}/comments`, { message: comment.trim() }));
    if (r) {
      setComment("");
      comments.reload();
      onChange({ ...task, comment_count: (task.comment_count || 0) + 1 });
      setTimeout(() => feedRef.current?.scrollTo(0, 1e9), 50);
    }
  };
  const addTime = async (e) => {
    e.preventDefault();
    if (!minutes) return;
    await run(() => api.post(`${base}/time`, { minutes: Number(minutes), note }), "Waktu dicatat");
    setMinutes("");
    setNote("");
  };
  const done = (task.subtasks || []).filter((s) => s.done).length;
  return (
    <div className="ck-overlay" onMouseDown={onClose} data-testid="task-detail-overlay">
      <aside
        className={`ck-drawer ${wide ? "wide" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
        data-testid="task-detail"
      >
        <div className="ck-drawer-main">
          <div className="ck-drawer-top">
            <span className="ck-crumb">
              {project.name} <i>/</i> Kanban <i>/</i>{" "}
              <span className={`ck-source src-${task.source}`}>{SOURCE_LABEL[task.source]}</span>
            </span>
            <span className="ck-spacer" />
            <button className="ck-icon" onClick={() => setWide(!wide)} title="Ubah ukuran">
              {wide ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            {manager && (
              <button
                className="ck-icon danger"
                data-testid="delete-task"
                title="Hapus task"
                onClick={() => window.confirm("Hapus task ini?") && onDelete(task)}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button className="ck-icon" data-testid="close-task" onClick={onClose} title="Tutup">
              <X size={18} />
            </button>
          </div>
          {manager ? (
            <input
              className="ck-title-input"
              data-testid="task-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== task.title && patch({ title: title.trim() }, "Judul disimpan")}
            />
          ) : (
            <h2 className="ck-title-input" data-testid="task-title">{task.title}</h2>
          )}
          <div className="ck-props">
            <Prop label="Status" id="task-detail-status">
              <select
                className="ck-inline ck-inline-status"
                data-testid="task-status-select"
                disabled={!editable}
                style={{ background: colorOf(statuses, task.status) }}
                value={task.status}
                onChange={(e) => patch({ status: e.target.value }, `Status: ${e.target.value}`)}
              >
                {statuses.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </Prop>
            <Prop label="PIC" id="task-detail-assignee">
              {manager ? (
                <select
                  className="ck-inline"
                  data-testid="task-assignee-select"
                  value={task.assigned_to || ""}
                  onChange={(e) => patch({ assigned_to: e.target.value }, "PIC diperbarui")}
                >
                  <option value="">Belum ditugaskan</option>
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="ck-row-person">
                  <Avatar name={task.assigned_name} size={22} /> {task.assigned_name || "Belum ditugaskan"}
                </span>
              )}
            </Prop>
            <Prop label="Prioritas" id="task-detail-priority">
              <span className="ck-row-person" style={{ color: PRIORITY_COLOR[task.priority] }}>
                <Flag size={15} fill="currentColor" />
                {manager ? (
                  <select
                    className="ck-inline"
                    data-testid="task-priority-select"
                    value={task.priority}
                    onChange={(e) => patch({ priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  task.priority
                )}
              </span>
            </Prop>
            <Prop label="Server" id="task-detail-server">
              <select
                className="ck-inline"
                data-testid="task-server-select"
                disabled={!editable}
                value={task.server}
                onChange={(e) => patch({ server: e.target.value })}
              >
                {serverStages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Prop>
            <Prop label="Mulai" id="task-detail-start">
              <input
                type="date"
                className="ck-inline"
                data-testid="task-start-input"
                disabled={!manager}
                value={task.start_date || ""}
                onChange={(e) => patch({ start_date: e.target.value || null })}
              />
            </Prop>
            <Prop label="Target selesai" id="task-detail-due">
              <input
                type="date"
                className="ck-inline"
                data-testid="task-due-input"
                disabled={!manager}
                value={task.due_date || ""}
                onChange={(e) => patch({ due_date: e.target.value || null })}
              />
            </Prop>
            <Prop label="Estimasi (jam)" id="task-detail-estimate">
              <input
                type="number"
                min="0"
                step="0.5"
                className="ck-inline"
                data-testid="task-estimate-input"
                disabled={!manager}
                defaultValue={task.estimate_hours || 0}
                key={task.estimate_hours}
                onBlur={(e) => Number(e.target.value) !== task.estimate_hours && patch({ estimate_hours: Number(e.target.value) })}
              />
            </Prop>
            <Prop label="Waktu tercatat" id="task-detail-time">
              <span className={`ck-time ${task.running_entry ? "running" : ""}`}>
                <Clock size={15} /> {fmtDuration((task.time_total || 0) + running)}
              </span>
            </Prop>
            <Prop label="Tag" id="task-detail-tags">
              <div className="ck-tags editable">
                {(task.tags || []).map((g) => (
                  <span className="ck-tag" key={g}>
                    {g}
                    {manager && (
                      <button onClick={() => patch({ tags: task.tags.filter((x) => x !== g) })} aria-label="hapus tag">
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))}
                {manager && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!tag.trim()) return;
                      patch({ tags: [...(task.tags || []), tag.trim()] });
                      setTag("");
                    }}
                  >
                    <Tag size={13} />
                    <input
                      data-testid="task-tag-input"
                      placeholder="Tambah tag…"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                    />
                  </form>
                )}
              </div>
            </Prop>
          </div>
          <section className="ck-section">
            <h4>Deskripsi</h4>
            {manager ? (
              <textarea
                className="ck-desc"
                data-testid="task-description-input"
                placeholder="Tulis deskripsi task…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onBlur={() => desc !== (task.description || "") && patch({ description: desc }, "Deskripsi disimpan")}
              />
            ) : (
              <p className="ck-desc-text" data-testid="task-description">{task.description || "Belum ada deskripsi."}</p>
            )}
          </section>
          <section className="ck-section">
            <h4>
              Subtask <span>{done}/{(task.subtasks || []).length}</span>
            </h4>
            {(task.subtasks || []).length > 0 && (
              <div className="ck-bar-track small">
                <div style={{ width: `${(done / task.subtasks.length) * 100}%`, background: "#10b981" }} />
              </div>
            )}
            <div className="ck-subtasks">
              {(task.subtasks || []).map((s) => (
                <div className={`ck-subtask ${s.done ? "done" : ""}`} key={s.id} data-testid={`subtask-${s.id}`}>
                  <input
                    type="checkbox"
                    data-testid={`subtask-toggle-${s.id}`}
                    checked={s.done}
                    disabled={!editable}
                    onChange={(e) => run(() => api.patch(`${base}/subtasks/${s.id}`, { done: e.target.checked }))}
                  />
                  <span className="ck-subtask-title">{s.title}</span>
                  {manager ? (
                    <select
                      className="ck-inline small"
                      data-testid={`subtask-assignee-${s.id}`}
                      value={s.assigned_to || ""}
                      onChange={(e) => run(() => api.patch(`${base}/subtasks/${s.id}`, { assigned_to: e.target.value }), "PIC subtask diperbarui")}
                    >
                      <option value="">PIC —</option>
                      {team.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <small>{s.assigned_name}</small>
                  )}
                  {editable && (
                    <button
                      className="ck-icon danger"
                      data-testid={`delete-subtask-${s.id}`}
                      onClick={() => run(() => api.delete(`${base}/subtasks/${s.id}`).then(() => ({ data: { ...task, subtasks: task.subtasks.filter((x) => x.id !== s.id) } })))}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {editable && (
              <form
                className="ck-add-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!sub.trim()) return;
                  run(() => api.post(`${base}/subtasks`, { title: sub.trim() }), "Subtask ditambahkan");
                  setSub("");
                }}
              >
                <Plus size={15} />
                <input data-testid="subtask-input" placeholder="Tambah subtask, Enter untuk simpan" value={sub} onChange={(e) => setSub(e.target.value)} />
              </form>
            )}
          </section>
          <section className="ck-section">
            <h4>
              Lampiran <span>{docs.data?.length || 0}</span>
            </h4>
            {(docs.data || []).map((d) => (
              <div className="ck-doc" key={d.id} data-testid={`task-doc-${d.id}`}>
                <div>
                  <b>{d.name}</b>
                  <small>
                    {(d.size / 1024).toFixed(1)} KB · {dateLabel(d.created_at)} · {d.uploaded_by}
                  </small>
                </div>
                <button className="ck-icon" data-testid={`download-task-doc-${d.id}`} onClick={() => download(`/projects/${task.project_id}/documents/${d.id}/download`, d.name)}>
                  <Download size={15} />
                </button>
              </div>
            ))}
            {editable && (
              <form className="ck-add-row" onSubmit={upload}>
                <input type="file" data-testid="task-doc-input" accept=".pdf,.docx,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.webp" onChange={(e) => setFile(e.target.files[0])} />
                <button className="ck-primary" type="submit" data-testid="upload-task-doc" disabled={!file}>
                  <Upload size={14} /> Unggah
                </button>
              </form>
            )}
          </section>
        </div>
        <div className="ck-drawer-side">
          <section className="ck-side-block">
            <h4>Time tracking</h4>
            <div className="ck-timer" data-testid="task-timer">
              <b data-testid="task-timer-value">{fmtDuration((task.time_total || 0) + running)}</b>{" "}
              {tracker && (
                <button
                  className={`ck-timer-btn ${task.running_entry ? "stop" : ""}`}
                  data-testid="timer-toggle"
                  onClick={() => run(() => api.post(`${base}/timer`), task.running_entry ? "Timer dihentikan" : "Timer dimulai")}
                >
                  {task.running_entry ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  {task.running_entry ? "Stop" : "Mulai"}
                </button>
              )}
            </div>
            {task.estimate_hours > 0 && (
              <small className="ck-muted">
                Estimasi {task.estimate_hours} jam · {Math.round((((task.time_total || 0) + running) / 3600 / task.estimate_hours) * 100)}% terpakai
              </small>
            )}
            {tracker && (
              <form className="ck-add-row" onSubmit={addTime}>
                <input type="number" min="1" max="1440" data-testid="time-minutes" placeholder="Menit" value={minutes} onChange={(e) => setMinutes(e.target.value)} style={{ flex: "0 0 80px" }} />
                <input data-testid="time-note" placeholder="Catatan" value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="ck-primary" type="submit" data-testid="time-add" disabled={!minutes}>
                  <Plus size={14} />
                </button>
              </form>
            )}
            <div className="ck-time-entries">
              {[...(task.time_entries || [])].reverse().slice(0, 8).map((e) => (
                <div className="ck-time-entry" key={e.id} data-testid={`time-entry-${e.id}`}>
                  <Avatar name={e.user_name} size={20} />
                  <span>
                    <b>{e.ended_at ? fmtDuration(e.seconds) : "berjalan…"}</b>
                    <small>
                      {e.user_name} · {dateLabel(e.started_at)}
                      {e.note && ` · ${e.note}`}
                    </small>
                  </span>
                  {(manager || e.user_id === user.id) && e.ended_at && (
                    <button className="ck-icon danger" onClick={() => run(() => api.delete(`${base}/time/${e.id}`))} aria-label="hapus">
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="ck-side-block ck-activity">
            <h4>
              Komentar <span>{comments.data?.length || 0}</span>
            </h4>
            <div className="ck-feed" ref={feedRef}>
              {(comments.data || []).map((c) => (
                <div className="ck-comment" key={c.id} data-testid={`comment-${c.id}`}>
                  <Avatar name={c.author_name} size={28} />
                  <div>
                    <header>
                      <b>{c.author_name}</b>
                      <small>{c.author_role} · {new Date(c.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small>
                      {(manager || c.author_id === user.id) && (
                        <button className="ck-icon danger" onClick={() => run(() => api.delete(`${base}/comments/${c.id}`)).then(() => { comments.reload(); onChange({ ...task, comment_count: Math.max(0, (task.comment_count || 1) - 1) }); })} aria-label="hapus komentar">
                          <X size={12} />
                        </button>
                      )}
                    </header>
                    <p>{c.message}</p>
                  </div>
                </div>
              ))}
              {!comments.data?.length && <p className="ck-muted">Belum ada komentar. Mulai diskusi di sini.</p>}
            </div>
            <form className="ck-compose" onSubmit={sendComment}>
              <textarea
                data-testid="comment-input"
                placeholder="Tulis komentar… (Ctrl+Enter untuk kirim)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.ctrlKey || e.metaKey) && sendComment(e)}
              />
              <button className="ck-primary" type="submit" data-testid="comment-send" disabled={!comment.trim()}>
                <Send size={15} />
              </button>
            </form>
          </section>
        </div>
      </aside>
    </div>
  );
};
