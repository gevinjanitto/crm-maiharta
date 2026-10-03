import React, { useState } from "react";
import { Search, RotateCcw, Wrench, CheckCheck, Clock3, SlidersHorizontal, X } from "lucide-react";
import { useAuth } from "../App";
import { useData, slug } from "../lib/api";
import { PageHead, AddButton, Loading, ErrorState } from "../components/Common";
import { WorkCards, WorkForm } from "../components/WorkComponents";
export default function WorkList({ kind }) {
  const { user } = useAuth(),
    { data, loading, error, reload } = useData(`/work/${kind}`),
    [show, setShow] = useState(false),
    [search, setSearch] = useState(""),
    [project, setProject] = useState(""),
    [filter, setFilter] = useState("Semua");
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const revision = kind === "revisions",
    statusTabs = revision
      ? ["Semua", "Terbuka", "Dikerjakan", "Selesai"]
      : ["Semua", "Belum dikerjakan", "Development", "Testing", "Selesai"],
    projects = [...new Map(data.map((r) => [r.project_id, r.project_name])).entries()],
    matching = data.filter(
      (r) =>
        (r.title + " " + r.project_name)
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (!project || r.project_id === project),
    ),
    rows = matching.filter((r) => filter === "Semua" || r.status === filter),
    hasFilters = Boolean(search || project || filter !== "Semua");
  return (
    <>
      <PageHead
        eyebrow="PROJECT CARE"
        title={revision ? "Revisi" : "Maintenance"}
        description={
          revision
            ? "Setiap masukan menjadi langkah penyempurnaan."
            : "Menjaga performa, merawat pengalaman digital."
        }
      >
        {["Admin", "Admin Project"].includes(user.role) && (
          <AddButton id="add-work" onClick={() => setShow(true)}>
            {revision ? "Revisi baru" : "Maintenance baru"}
          </AddButton>
        )}
      </PageHead>
      <div className="mini-stats">
        {[
          ["Total pekerjaan", data.length, revision ? RotateCcw : Wrench],
          [
            "Sedang aktif",
            data.filter((r) => r.status !== "Selesai").length,
            Clock3,
          ],
          [
            "Terselesaikan",
            data.filter((r) => r.status === "Selesai").length,
            CheckCheck,
          ],
        ].map(([n, v, Icon], i) => (
          <div className="mini-stat" key={n} data-testid={`work-stat-${i}`}>
            <Icon size={24} />
            <div>
              <small>{n}</small>
              <b>{v}</b>
            </div>
          </div>
        ))}
      </div>
      <section className="work-toolbar" aria-label="Filter pekerjaan" data-testid="work-toolbar">
        <div className="work-status-tabs" role="group" aria-label="Status pekerjaan">
          {statusTabs.map((t) => (
            <button
              key={t}
              type="button"
              data-testid={`work-filter-${slug(t)}`}
              className={`work-status-tab ${filter === t ? "active" : ""}`}
              aria-pressed={filter === t}
              onClick={() => setFilter(t)}
            >
              {t}
              <span data-testid={`work-filter-count-${slug(t)}`}>{t === "Semua" ? matching.length : matching.filter((r) => r.status === t).length}</span>
            </button>
          ))}
        </div>
        <div className="work-toolbar-controls">
        <div className="work-project-control">
        <SlidersHorizontal size={15} aria-hidden="true" />
        <select
          className="filter-select"
          data-testid="work-project-filter"
          aria-label="Filter berdasarkan project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          <option value="">Semua project</option>
          {projects.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        </div>
        <div className="list-search work-search">
          <Search size={16} aria-hidden="true" />
          <input
            data-testid="work-search"
            aria-label="Cari pekerjaan"
            placeholder="Cari pekerjaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button type="button" className="work-clear-search" data-testid="work-clear-search" aria-label="Hapus pencarian" onClick={() => setSearch("")}><X size={15} /></button>}
        </div>
        {hasFilters && <button type="button" className="work-reset" data-testid="work-reset-filters" onClick={() => { setSearch(""); setProject(""); setFilter("Semua"); }}><RotateCcw size={14} />Reset filter</button>}
        </div>
      </section>
      <div className="work-results" data-testid="work-results" role="status" aria-live="polite"><span>Menampilkan <b>{rows.length}</b> dari {data.length} pekerjaan</span><span>{revision ? "Daftar revisi" : "Daftar maintenance"}</span></div>
      <WorkCards rows={rows} user={user} kind={kind} reload={reload} filtered={hasFilters} />
      <WorkForm
        open={show}
        onClose={() => setShow(false)}
        onSaved={reload}
        kind={kind}
      />
    </>
  );
}
