import React, { useEffect, useState } from "react";
import { api, useData } from "../lib/api";
import { Loading, ErrorState } from "./Common";
import { KanbanBoard } from "./KanbanBoard";
export const KanbanTab = ({ p, user }) => {
<<<<<<< HEAD
  const tasks = useData(`/projects/${p.id}/tasks`),
    statuses = useData(`/projects/${p.id}/statuses`),
=======
  const { data, loading, error, reload } = useData(`/projects/${p.id}/tasks`),
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
    [team, setTeam] = useState([]);
  useEffect(() => {
    if (["Admin", "Admin Project"].includes(user.role))
      api
        .get("/team")
        .then((r) => setTeam(r.data.filter((d) => p.assigned_to.includes(d.id))))
        .catch(() => {});
  }, [user.role, p]);
<<<<<<< HEAD
  if (tasks.loading || statuses.loading) return <Loading />;
  if (tasks.error || statuses.error)
    return (
      <ErrorState
        error={tasks.error || statuses.error}
        reload={() => {
          tasks.reload();
          statuses.reload();
        }}
      />
    );
  return (
    <KanbanBoard
      project={p}
      tasks={tasks.data}
      setTasks={tasks.setData}
      statuses={statuses.data}
      setStatuses={statuses.setData}
      user={user}
      team={team}
      reload={tasks.reload}
    />
=======
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
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
  );
};
