import React, { useState } from "react";
import { Plus, MoreHorizontal, Trash2, Pencil, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { api, errorText, slug } from "../../lib/api";
import { TaskCard } from "./TaskCard";
import { STATUS_COLORS, byOrder, midOrder, canEditTask } from "./helpers";

const ColumnMenu = ({ col, project, statuses, onChange, onClose }) => {
  const [name, setName] = useState(col.name),
    [color, setColor] = useState(col.color),
    [kind, setKind] = useState(col.kind);
  const base = `/projects/${project.id}/statuses/${col.id}`;
  const save = async () => {
    try {
      const r = await api.patch(base, { name, color, kind });
      onChange(r.data);
      toast.success("Status diperbarui");
      onClose();
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  const remove = async () => {
    if (statuses.length < 2) return toast.error("Minimal satu status.");
    if (!window.confirm(`Hapus status "${col.name}"? Task akan dipindahkan.`))
      return;
    try {
      const r = await api.delete(base);
      onChange(r.data);
      onClose();
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  return (
    <div className="ck-menu" data-testid={`column-menu-${slug(col.name)}`} onClick={(e) => e.stopPropagation()}>
      <label>
        Nama status
        <input
          data-testid="column-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        Jenis
        <select value={kind} onChange={(e) => setKind(e.target.value)} data-testid="column-kind-select">
          <option value="todo">Belum dikerjakan</option>
          <option value="active">Sedang berjalan</option>
          <option value="done">Selesai</option>
        </select>
      </label>
      <div className="ck-colors">
        {STATUS_COLORS.map((c) => (
          <button
            key={c}
            className={color === c ? "active" : ""}
            style={{ background: c }}
            onClick={() => setColor(c)}
            aria-label={c}
          />
        ))}
      </div>
      <div className="ck-menu-actions">
        <button className="ck-danger" data-testid="column-delete" onClick={remove}>
          <Trash2 size={14} /> Hapus
        </button>
        <button className="ck-primary" data-testid="column-save" onClick={save}>
          <Pencil size={14} /> Simpan
        </button>
      </div>
    </div>
  );
};

const QuickAdd = ({ project, status, onAdded }) => {
  const [open, setOpen] = useState(false),
    [title, setTitle] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const r = await api.post(`/projects/${project.id}/tasks`, {
        title: title.trim(),
        status,
      });
      onAdded(r.data);
      setTitle("");
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  if (!open)
    return (
      <button
        className="ck-add-task"
        data-testid={`quick-add-${slug(status)}`}
        onClick={() => setOpen(true)}
      >
        <Plus size={15} /> Tambah task
      </button>
    );
  return (
    <form className="ck-quick-add" onSubmit={submit}>
      <input
        autoFocus
        data-testid={`quick-add-input-${slug(status)}`}
        placeholder="Nama task, Enter untuk simpan"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => !title && setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      />
    </form>
  );
};

const AddColumn = ({ project, onChange }) => {
  const [open, setOpen] = useState(false),
    [name, setName] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const r = await api.post(`/projects/${project.id}/statuses`, {
        name: name.trim(),
        color: STATUS_COLORS[Math.floor(Math.random() * STATUS_COLORS.length)],
        kind: "active",
      });
      onChange(r.data);
      setName("");
      setOpen(false);
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  return (
    <div className="ck-col ck-add-col">
      {open ? (
        <form onSubmit={submit} className="ck-quick-add">
          <input
            autoFocus
            data-testid="add-column-input"
            placeholder="Nama status baru"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          />
        </form>
      ) : (
        <button data-testid="add-column" onClick={() => setOpen(true)}>
          <Plus size={16} /> Tambah status
        </button>
      )}
    </div>
  );
};

export const BoardView = ({
  project,
  tasks,
  statuses,
  setStatuses,
  user,
  manager,
  onOpen,
  onLocalUpdate,
  onAdded,
}) => {
  const [drag, setDrag] = useState(null),
    [dragCol, setDragCol] = useState(null),
    [over, setOver] = useState(null),
    [menu, setMenu] = useState(null);
  const columns = statuses || [];
  const move = async (t, status, index) => {
    const items = tasks
      .filter((x) => x.status === status && x.id !== t.id)
      .sort(byOrder);
    const order = midOrder(items[index - 1], items[index]);
    if (t.status === status && t.order === order) return;
    onLocalUpdate({ ...t, status, order });
    try {
      const r = await api.patch(`/projects/${project.id}/tasks/${t.id}`, {
        status,
        order,
      });
      onLocalUpdate(r.data);
      if (t.status !== status) toast.success(`Dipindahkan ke ${status}`);
    } catch (e) {
      toast.error(errorText(e));
      onLocalUpdate(t);
    }
  };
  const reorderCols = async (targetId) => {
    if (!dragCol || dragCol === targetId) return;
    const ids = columns.map((c) => c.id),
      from = ids.indexOf(dragCol),
      to = ids.indexOf(targetId);
    ids.splice(from, 1);
    ids.splice(to, 0, dragCol);
    setStatuses(ids.map((i) => columns.find((c) => c.id === i)));
    try {
      const r = await api.post(`/projects/${project.id}/statuses/reorder`, { ids });
      setStatuses(r.data);
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  const end = () => {
    setDrag(null);
    setDragCol(null);
    setOver(null);
  };
  return (
    <div className="ck-board" data-testid="kanban-board" onClick={() => setMenu(null)}>
      {columns.map((col) => {
        const items = tasks.filter((t) => t.status === col.name).sort(byOrder);
        const isOver = over?.col === col.name && drag;
        return (
          <section
            key={col.id}
            className={`ck-col ${isOver ? "over" : ""} ${dragCol === col.id ? "dragging" : ""}`}
            data-testid={`kanban-column-${slug(col.name)}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (drag && over?.col !== col.name)
                setOver({ col: col.name, index: items.length });
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (drag) move(drag, col.name, over?.index ?? items.length);
              if (dragCol) reorderCols(col.id);
              end();
            }}
          >
            <header
              className="ck-col-head"
              draggable={manager}
              onDragStart={() => setDragCol(col.id)}
              onDragEnd={end}
            >
              {manager && <GripVertical size={14} className="ck-grip" />}
              <span
                className="ck-status-pill"
                style={{ background: col.color }}
                data-testid={`kanban-column-title-${slug(col.name)}`}
              >
                {col.name}
              </span>
              <span className="ck-col-count" data-testid={`kanban-count-${slug(col.name)}`}>
                {items.length}
              </span>
              <span className="ck-spacer" />
              {manager && (
                <button
                  className="ck-icon"
                  data-testid={`column-menu-btn-${slug(col.name)}`}
                  title="Pengaturan status"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenu(menu === col.id ? null : col.id);
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
              )}
              {menu === col.id && (
                <ColumnMenu
                  col={col}
                  project={project}
                  statuses={columns}
                  onChange={setStatuses}
                  onClose={() => setMenu(null)}
                />
              )}
            </header>
            <div className="ck-cards">
              {items.map((t, i) => (
                <React.Fragment key={t.id}>
                  {isOver && over.index === i && drag.id !== t.id && (
                    <div className="ck-drop-line" />
                  )}
                  <TaskCard
                    t={t}
                    statuses={columns}
                    draggable={canEditTask(user, t)}
                    dragging={drag?.id === t.id}
                    onDragStart={setDrag}
                    onDragEnd={end}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!drag) return;
                      const r = e.currentTarget.getBoundingClientRect();
                      const before = e.clientY < r.top + r.height / 2;
                      setOver({ col: col.name, index: before ? i : i + 1 });
                    }}
                    onOpen={onOpen}
                  />
                </React.Fragment>
              ))}
              {isOver && over.index >= items.length && (
                <div className="ck-drop-line" />
              )}
              {!items.length && !isOver && (
                <p className="ck-empty">Belum ada task</p>
              )}
            </div>
            {manager && (
              <QuickAdd project={project} status={col.name} onAdded={onAdded} />
            )}
          </section>
        );
      })}
      {manager && <AddColumn project={project} onChange={setStatuses} />}
    </div>
  );
};
