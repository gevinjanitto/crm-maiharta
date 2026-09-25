import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../App";
import { useData, download, statuses } from "../lib/api";
import { PageHead, AddButton, Loading, ErrorState, ExportButton } from "../components/Common";
=======
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../App";
import { useData, download, statuses } from "../lib/api";
import { PageHead, AddButton, Loading, ErrorState } from "../components/Common";
import { Button } from "../components/ui/button";
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
import { ProjectTable } from "../components/ProjectTable";
import { ProjectForm } from "../components/ProjectForm";
export default function Projects() {
  const { user } = useAuth(),
    { data, loading, error, reload } = useData("/projects"),
    [params] = useSearchParams(),
    navigate = useNavigate();
  const [search, setSearch] = useState(params.get("q") || ""),
    [tab, setTab] = useState("Semua project"),
    [filter, setFilter] = useState(""),
    [page, setPage] = useState(1),
    [show, setShow] = useState(false);
  useEffect(() => setSearch(params.get("q") || ""), [params]);
  useEffect(() => setPage(1), [search, tab, filter]);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const rows = data.filter(
      (p) =>
        (p.name + " " + p.client_name + " " + p.code)
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!filter || p.status === filter) &&
        (tab === "Semua project" ||
          (tab === "Aktif" ? p.status !== "Selesai" : p.status === "Selesai")),
    ),
    pages = Math.max(1, Math.ceil(rows.length / 8));
  return (
    <>
      <PageHead
        eyebrow="PROJECT MANAGEMENT"
        title={user.role === "Client" ? "Project saya" : "Semua project"}
        description={`${data.length} project, berbagai ide hebat. Satu ruang kolaborasi.`}
      >
<<<<<<< HEAD
        <ExportButton
          testid="export-projects"
          onExport={() =>
            download("/reports/projects.xlsx", "laporan-project-maiharta.xlsx")
          }
        >
          Ekspor
        </ExportButton>
=======
        <Button
          className="secondary-button"
          data-testid="export-projects"
          onClick={() =>
            download("/reports/projects.csv", "laporan-project.csv")
          }
        >
          <Download size={15} />
          Ekspor
        </Button>
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
        {["Admin", "Admin Project"].includes(user.role) && (
          <AddButton id="add-project" onClick={() => setShow(true)}>
            Project baru
          </AddButton>
        )}
      </PageHead>
      <div className="list-toolbar">
        <div className="filter-tabs">
          {["Semua project", "Aktif", "Selesai"].map((t) => (
            <button
              key={t}
              data-testid={`projects-tab-${t.replace(" ", "-").toLowerCase()}`}
              className={`filter-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
              <span>
                {t === "Semua project"
                  ? data.length
                  : data.filter((p) =>
                      t === "Aktif"
                        ? p.status !== "Selesai"
                        : p.status === "Selesai",
                    ).length}
              </span>
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <div className="list-search">
            <Search size={15} />
            <input
              data-testid="project-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau client..."
            />
          </div>
          <select
            className="filter-select"
            data-testid="project-status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Semua status</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="panel">
        <ProjectTable projects={rows.slice((page - 1) * 8, page * 8)} />
        <div className="table-footer">
          <span data-testid="projects-count">
            {rows.length ? Math.min((page - 1) * 8 + 1, rows.length) : 0}–
            {Math.min(page * 8, rows.length)} dari {rows.length} project
          </span>
          <div className="pagination">
            <button
              data-testid="projects-prev-page"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              title="Halaman sebelumnya"
            >
              <ChevronLeft size={13} />
            </button>
            <span data-testid="projects-current-page">
              {page} / {pages}
            </span>
            <button
              data-testid="projects-next-page"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              title="Halaman selanjutnya"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
      <ProjectForm
        open={show}
        onClose={() => setShow(false)}
        onSaved={(p) => navigate(`/projects/${p.id}`)}
      />
    </>
  );
}
