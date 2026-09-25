import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Globe,
  ShoppingBag,
  PenTool,
  AppWindow,
} from "lucide-react";
import { Badge, Progress, Empty } from "./Common";
import { dateLabel, initials } from "../lib/api";
const icons = [Globe, ShoppingBag, PenTool, AppWindow];
export const ProjectTable = ({ projects, compact = false }) => (
  <div className="table-wrap">
    {!projects.length ? (
      <Empty message="Belum ada project yang sesuai." />
    ) : (
      <table className="data-table" data-testid="projects-table">
        <thead>
          <tr>
            <th>Nama project</th>
            <th className="hide-mobile">Client</th>
            <th>Status</th>
            <th>Progress</th>
            <th className="hide-mobile">Deadline</th>
            <th className="hide-mobile">Tim</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => {
            const Icon = icons[i % 4];
            return (
              <tr key={p.id} data-testid={`project-row-${p.id}`}>
                <td>
                  <Link
                    to={`/projects/${p.id}`}
                    className="table-name"
                    data-testid={`project-link-${p.id}`}
                  >
                    <span className={`project-glyph glyph-${i % 4}`}>
                      <Icon size={16} />
                    </span>
                    <div>
                      <b>{p.name}</b>
                      <small>
<<<<<<< HEAD
                        {p.code} · {(p.platforms || [p.category]).join(", ")}
=======
                        {p.code} · {p.category}
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
                      </small>
                    </div>
                  </Link>
                </td>
                <td className="hide-mobile">{p.client_name}</td>
                <td>
                  <Badge id={`project-status-${p.id}`}>{p.status}</Badge>
                </td>
                <td>
                  <Progress
                    id={`project-progress-${p.id}`}
                    value={p.progress}
                  />
                </td>
                <td className="hide-mobile">{dateLabel(p.due_date)}</td>
                <td className="hide-mobile">
                  <span
                    className="avatar small"
                    title={`${p.assigned_to.length} developer`}
                    data-testid={`project-team-${p.id}`}
                  >
                    {p.assigned_to.length || "—"}
                  </span>
                </td>
                <td>
                  <Link
                    to={`/projects/${p.id}`}
                    className="icon-button"
                    title="Detail project"
                    data-testid={`project-open-${p.id}`}
                  >
                    <ArrowUpRight size={15} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
);
