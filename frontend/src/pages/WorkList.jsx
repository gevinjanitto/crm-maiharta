import React, { useState } from "react";
import { Search, RotateCcw, Wrench, CheckCheck, Clock3 } from "lucide-react";
import { useAuth } from "../App";
import { useData } from "../lib/api";
import { PageHead, AddButton, Loading, ErrorState } from "../components/Common";
import { WorkCards, WorkForm } from "../components/WorkComponents";
export default function WorkList({ kind }) {
  const { user } = useAuth(),
    { data, loading, error, reload } = useData(`/work/${kind}`),
    [show, setShow] = useState(false),
    [search, setSearch] = useState(""),
<<<<<<< HEAD
    [project, setProject] = useState(""),
=======
<<<<<<< HEAD
    [project, setProject] = useState(""),
=======
<<<<<<< HEAD
    [project, setProject] = useState(""),
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
    [filter, setFilter] = useState("Semua");
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const revision = kind === "revisions",
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
    statusTabs = revision
      ? ["Semua", "Terbuka", "Dikerjakan", "Selesai"]
      : ["Semua", "Belum dikerjakan", "Development", "Testing", "Selesai"],
    projects = [...new Map(data.map((r) => [r.project_id, r.project_name])).entries()],
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
    rows = data.filter(
      (r) =>
        (r.title + " " + r.project_name)
          .toLowerCase()
          .includes(search.toLowerCase()) &&
<<<<<<< HEAD
        (!project || r.project_id === project) &&
=======
<<<<<<< HEAD
        (!project || r.project_id === project) &&
=======
<<<<<<< HEAD
        (!project || r.project_id === project) &&
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
        (filter === "Semua" || r.status === filter),
    );
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
      <div className="list-toolbar">
        <div className="filter-tabs">
<<<<<<< HEAD
          {statusTabs.map((t) => (
=======
<<<<<<< HEAD
          {statusTabs.map((t) => (
=======
<<<<<<< HEAD
          {statusTabs.map((t) => (
=======
          {["Semua", "Terbuka", "Dikerjakan", "Selesai"].map((t) => (
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
            <button
              key={t}
              data-testid={`work-filter-${t}`}
              className={`filter-tab ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
        <select
          className="filter-select"
          data-testid="work-project-filter"
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
        <div className="list-search">
          <Search size={15} />
          <input
            data-testid="work-search"
            placeholder="Cari pekerjaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <WorkCards rows={rows} user={user} kind={kind} reload={reload} />
      <WorkForm
        open={show}
        onClose={() => setShow(false)}
        onSaved={reload}
        kind={kind}
      />
    </>
  );
}
