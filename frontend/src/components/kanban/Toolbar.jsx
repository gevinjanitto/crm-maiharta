import React from "react";
import {
  LayoutGrid,
  List as ListIcon,
  CalendarDays,
  BarChart3,
  Search,
  Plus,
  X,
} from "lucide-react";
import { PRIORITIES } from "./helpers";

const VIEWS = [
  ["board", "Board", LayoutGrid],
  ["list", "List", ListIcon],
  ["calendar", "Kalender", CalendarDays],
  ["dashboard", "Dashboard", BarChart3],
];

export const Toolbar = ({
  view,
  setView,
  filters,
  setFilters,
  people,
  tags,
  manager,
  onCreate,
  total,
}) => {
  const set = (k, v) => setFilters({ ...filters, [k]: v });
  const active = Object.values(filters).some(Boolean);
  return (
    <div className="ck-toolbar">
      <div className="ck-views" data-testid="kanban-views">
        {VIEWS.map(([id, label, Icon]) => (
          <button
            key={id}
            data-testid={`kanban-view-${id}`}
            className={`ck-view-btn ${view === id ? "active" : ""}`}
            onClick={() => setView(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
        <span className="ck-total" data-testid="kanban-total">
          {total} task
        </span>
      </div>
      <div className="ck-filters">
        <label className="ck-search">
          <Search size={16} />
          <input
            data-testid="kanban-search"
            placeholder="Cari task..."
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
          />
        </label>
        <select
          className="ck-select"
          data-testid="kanban-assignee-filter"
          value={filters.assignee}
          onChange={(e) => set("assignee", e.target.value)}
        >
          <option value="">Semua PIC</option>
          <option value="none">Belum ditugaskan</option>
          {people.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          className="ck-select"
          data-testid="kanban-priority-filter"
          value={filters.priority}
          onChange={(e) => set("priority", e.target.value)}
        >
          <option value="">Semua prioritas</option>
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        {tags.length > 0 && (
          <select
            className="ck-select"
            data-testid="kanban-tag-filter"
            value={filters.tag}
            onChange={(e) => set("tag", e.target.value)}
          >
            <option value="">Semua tag</option>
            {tags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        )}
        {active && (
          <button
            className="ck-clear"
            data-testid="kanban-clear-filters"
            onClick={() => setFilters({ q: "", assignee: "", priority: "", tag: "" })}
          >
            <X size={14} /> Reset
          </button>
        )}
        {manager && (
          <button
            className="ck-primary"
            data-testid="add-task"
            onClick={onCreate}
          >
            <Plus size={16} /> Task baru
          </button>
        )}
      </div>
    </div>
  );
};
