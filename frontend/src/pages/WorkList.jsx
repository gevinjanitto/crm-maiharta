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
    [filter, setFilter] = useState("Semua");
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const revision = kind === "revisions",
    rows = data.filter(
      (r) =>
        (r.title + " " + r.project_name)
          .toLowerCase()
          .includes(search.toLowerCase()) &&
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
          {["Semua", "Terbuka", "Dikerjakan", "Selesai"].map((t) => (
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
