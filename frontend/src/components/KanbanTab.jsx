import React, { useEffect, useState } from "react";
import { api, useData } from "../lib/api";
import { Loading, ErrorState } from "./Common";
import { KanbanBoard } from "./KanbanBoard";
export const KanbanTab = ({ p, user }) => {
  const { data, loading, error, reload } = useData(`/projects/${p.id}/tasks`),
    [team, setTeam] = useState([]);
  useEffect(() => {
    if (["Admin", "Admin Project"].includes(user.role))
      api
        .get("/team")
        .then((r) => setTeam(r.data.filter((d) => p.assigned_to.includes(d.id))))
        .catch(() => {});
  }, [user.role, p]);
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Kanban project</h2>
          <p>
            {data.length} task · geser kartu antar kolom untuk mengubah status
          </p>
        </div>
      </div>
      <KanbanBoard
        tasks={data}
        user={user}
        reload={reload}
        teamFor={() => team}
        projectId={p.id}
      />
    </>
  );
};
