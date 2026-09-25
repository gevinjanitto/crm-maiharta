<<<<<<< HEAD
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { api, errorText } from "../lib/api";
import { Toolbar } from "./kanban/Toolbar";
import { BoardView } from "./kanban/BoardView";
import { ListView } from "./kanban/ListView";
import { CalendarView } from "./kanban/CalendarView";
import { DashboardView } from "./kanban/DashboardView";
import { TaskDetail } from "./kanban/TaskDetail";
import { TaskForm } from "./TaskModal";
import { isManager } from "./kanban/helpers";

const EMPTY = { q: "", assignee: "", priority: "", tag: "" };

export const KanbanBoard = ({ project, tasks, setTasks, statuses, setStatuses, user, team, reload }) => {
  const [view, setView] = useState(localStorage.getItem("ck-view") || "board"),
    [filters, setFilters] = useState(EMPTY),
    [selected, setSelected] = useState(null),
    [creating, setCreating] = useState(false);
  const manager = isManager(user);
  const changeView = (v) => {
    localStorage.setItem("ck-view", v);
    setView(v);
  };
  const people = useMemo(
    () => [...new Map(tasks.filter((t) => t.assigned_to).map((t) => [t.assigned_to, t.assigned_name])).entries()],
    [tasks],
  );
  const tags = useMemo(() => [...new Set(tasks.flatMap((t) => t.tags || []))].sort(), [tasks]);
  const rows = tasks.filter(
    (t) =>
      (!filters.assignee || (filters.assignee === "none" ? !t.assigned_to : t.assigned_to === filters.assignee)) &&
      (!filters.priority || t.priority === filters.priority) &&
      (!filters.tag || (t.tags || []).includes(filters.tag)) &&
      (t.title + " " + (t.tags || []).join(" ")).toLowerCase().includes(filters.q.toLowerCase()),
  );
  const onLocalUpdate = (t) => setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, ...t } : x)));
  const onAdded = (t) => setTasks((list) => [...list, t]);
  const onDelete = async (t) => {
    try {
      await api.delete(`/projects/${project.id}/tasks/${t.id}`);
      setTasks((list) => list.filter((x) => x.id !== t.id));
      setSelected(null);
      toast.success("Task dihapus");
=======
import React, { useState } from "react";
import {
  Paperclip,
  ListChecks,
  CalendarDays,
  Server,
  LayoutGrid,
  List as ListIcon,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  api,
  errorText,
  dateLabel,
  initials,
  taskStatuses,
  slug,
} from "../lib/api";
import { AddButton, Empty } from "./Common";
import { TaskModal, TaskForm } from "./TaskModal";

const sourceLabel = {
  revision: "Revisi",
  maintenance: "Maintenance",
  ticket: "Tiket",
};
export const ServerTag = ({ value, id }) => (
  <span
    data-testid={id}
    className={`server-tag ${value === "Production" ? "prod" : value === "Dev Server" ? "dev" : ""}`}
  >
    <Server size={10} />
    {value}
  </span>
);
const TaskCard = ({ t, onOpen, draggable, onDrag, showProject }) => {
  const done = (t.subtasks || []).filter((s) => s.done).length,
    overdue =
      t.due_date && t.status !== "Selesai" && new Date(t.due_date) < new Date();
  return (
    <article
      className={`task-card prio-${slug(t.priority)}`}
      data-testid={`task-card-${t.id}`}
      draggable={draggable}
      onDragStart={() => onDrag(t)}
      onDragEnd={() => onDrag(null)}
      onClick={() => onOpen(t.id)}
    >
      {(showProject || sourceLabel[t.source]) && (
        <div className="task-card-top">
          {showProject && <small>{t.project_name}</small>}
          {sourceLabel[t.source] && (
            <span className="source-tag">{sourceLabel[t.source]}</span>
          )}
        </div>
      )}
      <h4>{t.title}</h4>
      <div className="task-tags">
        <ServerTag value={t.server} />
        <span className={`prio-tag ${slug(t.priority)}`}>{t.priority}</span>
      </div>
      <div className="task-card-bottom">
        <div className="task-meta">
          {t.subtasks?.length > 0 && (
            <span data-testid={`task-subtasks-${t.id}`}>
              <ListChecks size={12} /> {done}/{t.subtasks.length}
            </span>
          )}
          {t.document_count > 0 && (
            <span>
              <Paperclip size={12} /> {t.document_count}
            </span>
          )}
          {t.due_date && (
            <span className={overdue ? "overdue" : ""}>
              <CalendarDays size={12} /> {dateLabel(t.due_date)}
            </span>
          )}
        </div>
        {t.assigned_to ? (
          <span className="avatar mini" title={t.assigned_name}>
            {initials(t.assigned_name)}
          </span>
        ) : (
          <span className="avatar mini empty" title="Belum ditugaskan" />
        )}
      </div>
    </article>
  );
};
export const KanbanBoard = ({
  tasks,
  user,
  reload,
  teamFor,
  showProject = false,
  projectId,
}) => {
  const [status, setStatus] = useState(""),
    [assignee, setAssignee] = useState(""),
    [q, setQ] = useState(""),
    [view, setView] = useState("board"),
    [selected, setSelected] = useState(null),
    [creating, setCreating] = useState(false),
    [dragging, setDragging] = useState(null);
  const manager = ["Admin", "Admin Project"].includes(user.role);
  const canMove = (t) =>
    manager ||
    (user.role === "Developer" && ["", user.id].includes(t.assigned_to || ""));
  const people = [
    ...new Map(
      tasks.filter((t) => t.assigned_to).map((t) => [t.assigned_to, t.assigned_name]),
    ).entries(),
  ];
  const rows = tasks.filter(
    (t) =>
      (!status || t.status === status) &&
      (!assignee ||
        (assignee === "none" ? !t.assigned_to : t.assigned_to === assignee)) &&
      (t.title + " " + (t.project_name || ""))
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const move = async (t, s) => {
    if (!t || t.status === s || !canMove(t)) return;
    try {
      await api.patch(`/projects/${t.project_id}/tasks/${t.id}`, { status: s });
      toast.success(`Dipindahkan ke ${s}`);
      reload();
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
    } catch (e) {
      toast.error(errorText(e));
    }
  };
<<<<<<< HEAD
  const current = selected && tasks.find((t) => t.id === selected);
  const common = { project, tasks: rows, statuses, user, manager, team, onOpen: setSelected, onLocalUpdate, reload };
  return (
    <div className="ck-root">
      <Toolbar
        view={view}
        setView={changeView}
        filters={filters}
        setFilters={setFilters}
        people={people}
        tags={tags}
        manager={manager}
        onCreate={() => setCreating(true)}
        total={rows.length}
      />
      {view === "board" && <BoardView {...common} setStatuses={setStatuses} onAdded={onAdded} />}
      {view === "list" && <ListView {...common} />}
      {view === "calendar" && <CalendarView {...common} />}
      {view === "dashboard" && <DashboardView project={project} />}
      {current && (
        <TaskDetail
          task={current}
          project={project}
          user={user}
          team={team}
          statuses={statuses}
          onClose={() => setSelected(null)}
          onChange={onLocalUpdate}
          onDelete={onDelete}
        />
      )}
      <TaskForm
        open={creating}
        onClose={() => setCreating(false)}
        projectId={project.id}
        team={team}
        statuses={statuses}
        onSaved={(t) => {
          onAdded(t);
          setSelected(t.id);
        }}
      />
    </div>
=======
  const columns = status ? [status] : taskStatuses;
  const current = selected && tasks.find((t) => t.id === selected);
  return (
    <>
      <div className="kanban-toolbar">
        <div className="filter-tabs" data-testid="kanban-status-filter">
          {["", ...taskStatuses].map((s) => (
            <button
              key={s || "all"}
              data-testid={`kanban-filter-${s ? slug(s) : "semua"}`}
              className={`filter-tab ${status === s ? "active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s || "Semua"}
              <span>
                {s ? tasks.filter((t) => t.status === s).length : tasks.length}
              </span>
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <div className="list-search">
            <Search size={15} />
            <input
              data-testid="kanban-search"
              placeholder="Cari task..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            data-testid="kanban-assignee-filter"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Semua PIC</option>
            <option value="none">Belum ditugaskan</option>
            {people.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <div className="view-toggle">
            <button
              data-testid="kanban-view-board"
              className={view === "board" ? "active" : ""}
              onClick={() => setView("board")}
              title="Tampilan board"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              data-testid="kanban-view-list"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
              title="Tampilan list"
            >
              <ListIcon size={15} />
            </button>
          </div>
          {manager && projectId && (
            <AddButton id="add-task" onClick={() => setCreating(true)}>
              Task baru
            </AddButton>
          )}
        </div>
      </div>
      {view === "board" ? (
        <div className="kanban-board" style={{ "--cols": columns.length }}>
          {columns.map((s) => {
            const items = rows.filter((t) => t.status === s);
            return (
              <section
                key={s}
                className={`kanban-column col-${slug(s)} ${dragging ? "droppable" : ""}`}
                data-testid={`kanban-column-${slug(s)}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => move(dragging, s)}
              >
                <header>
                  <i />
                  <b>{s}</b>
                  <span data-testid={`kanban-count-${slug(s)}`}>
                    {items.length}
                  </span>
                </header>
                <div className="kanban-cards">
                  {items.map((t) => (
                    <TaskCard
                      key={t.id}
                      t={t}
                      showProject={showProject}
                      draggable={canMove(t)}
                      onDrag={setDragging}
                      onOpen={setSelected}
                    />
                  ))}
                  {!items.length && (
                    <p className="kanban-empty">Tidak ada task</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="kanban-list">
          {columns.map((s) => {
            const items = rows.filter((t) => t.status === s);
            if (!items.length) return null;
            return (
              <section key={s} className={`kanban-group col-${slug(s)}`}>
                <header>
                  <i />
                  <b>{s}</b>
                  <span>{items.length}</span>
                </header>
                <table className="data-table">
                  <tbody>
                    {items.map((t) => (
                      <tr
                        key={t.id}
                        data-testid={`task-row-${t.id}`}
                        onClick={() => setSelected(t.id)}
                      >
                        <td>
                          <b>{t.title}</b>
                          {showProject && <small> · {t.project_name}</small>}
                        </td>
                        <td className="hide-mobile">
                          <ServerTag value={t.server} />
                        </td>
                        <td className="hide-mobile">
                          <ListChecks size={12} />{" "}
                          {(t.subtasks || []).filter((x) => x.done).length}/
                          {(t.subtasks || []).length}
                        </td>
                        <td>{t.assigned_name || "—"}</td>
                        <td className="hide-mobile">{dateLabel(t.due_date)}</td>
                        <td>
                          <span className={`prio-tag ${slug(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
          {!rows.length && <Empty message="Belum ada task yang sesuai." />}
        </div>
      )}
      {current && (
        <TaskModal
          task={current}
          user={user}
          team={teamFor(current)}
          onClose={() => setSelected(null)}
          reload={reload}
        />
      )}
      {projectId && (
        <TaskForm
          open={creating}
          onClose={() => setCreating(false)}
          projectId={projectId}
          team={teamFor({ project_id: projectId })}
          onSaved={reload}
        />
      )}
    </>
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
  );
};
