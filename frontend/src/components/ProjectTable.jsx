import React from "react";
<<<<<<< HEAD
import { motion } from "framer-motion";
=======
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
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
<<<<<<< HEAD
              <motion.tr
                key={p.id}
                data-testid={`project-row-${p.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
              >
=======
              <tr key={p.id} data-testid={`project-row-${p.id}`}>
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
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
<<<<<<< HEAD
                        {p.code} · {(p.platforms || [p.category]).join(", ")}
=======
                        {p.code} · {p.category}
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
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
<<<<<<< HEAD
              </motion.tr>
=======
              </tr>
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
            );
          })}
        </tbody>
      </table>
    )}
  </div>
);
