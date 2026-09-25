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
    } catch (e) {
      toast.error(errorText(e));
    }
  };
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
  );
};
