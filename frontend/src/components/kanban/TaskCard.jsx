import React from "react";
import {
  Flag,
  CalendarDays,
  MessageSquare,
  Paperclip,
  CheckSquare,
  Clock,
  Server,
} from "lucide-react";
import { initials } from "../../lib/api";
import {
  PRIORITY_COLOR,
  SOURCE_LABEL,
  isOverdue,
  fmtDuration,
  shortDate,
} from "./helpers";

export const Avatar = ({ name, size = 26 }) =>
  name ? (
    <span
      className="ck-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={name}
    >
      {initials(name)}
    </span>
  ) : (
    <span
      className="ck-avatar empty"
      style={{ width: size, height: size }}
      title="Belum ditugaskan"
    />
  );

export const TaskCard = ({
  t,
  statuses,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onOpen,
}) => {
  const subs = t.subtasks || [],
    done = subs.filter((s) => s.done).length,
    overdue = isOverdue(statuses, t);
  return (
    <article
      className={`ck-card ${dragging ? "dragging" : ""}`}
      data-testid={`task-card-${t.id}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(t);
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onClick={() => onOpen(t.id)}
    >
      {t.source !== "manual" && (
        <span className={`ck-source src-${t.source}`}>
          {SOURCE_LABEL[t.source]}
        </span>
      )}
      <h4 className="ck-card-title">{t.title}</h4>
      {t.tags?.length > 0 && (
        <div className="ck-tags">
          {t.tags.map((g) => (
            <span className="ck-tag" key={g}>
              {g}
            </span>
          ))}
        </div>
      )}
      <div className="ck-card-foot">
        <Avatar name={t.assigned_name} />
        <span
          className="ck-flag"
          title={`Prioritas ${t.priority}`}
          style={{ color: PRIORITY_COLOR[t.priority] }}
        >
          <Flag size={14} fill="currentColor" />
        </span>
        {t.due_date && (
          <span
            className={`ck-meta ${overdue ? "overdue" : ""}`}
            data-testid={`task-due-${t.id}`}
          >
            <CalendarDays size={13} /> {shortDate(t.due_date)}
          </span>
        )}
        {t.server !== "Belum Naik" && (
          <span className={`ck-meta srv-${t.server === "Production" ? "prod" : "dev"}`}>
            <Server size={12} /> {t.server === "Production" ? "Prod" : "Dev"}
          </span>
        )}
        <span className="ck-spacer" />
        {subs.length > 0 && (
          <span
            className={`ck-meta ${done === subs.length ? "ok" : ""}`}
            data-testid={`task-subtasks-${t.id}`}
          >
            <CheckSquare size={13} /> {done}/{subs.length}
          </span>
        )}
        {t.comment_count > 0 && (
          <span className="ck-meta">
            <MessageSquare size={13} /> {t.comment_count}
          </span>
        )}
        {t.document_count > 0 && (
          <span className="ck-meta">
            <Paperclip size={13} /> {t.document_count}
          </span>
        )}
        {(t.time_total > 0 || t.running_count > 0) && (
          <span className={`ck-meta ${t.running_count ? "running" : ""}`}>
            <Clock size={13} /> {fmtDuration(t.time_total)}
          </span>
        )}
      </div>
    </article>
  );
};
