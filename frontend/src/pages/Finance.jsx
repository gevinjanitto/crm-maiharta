import React from "react";
import {
<<<<<<< HEAD
=======
  Download,
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
  Wallet,
  Code2,
  Server,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
<<<<<<< HEAD
import { motion } from "framer-motion";
=======
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ChartFrame as ResponsiveContainer } from "../components/ChartFrame";
import { useData, money, compact, download } from "../lib/api";
<<<<<<< HEAD
import { PageHead, Loading, ErrorState, Badge, ExportButton, CountUp } from "../components/Common";
import { CostTypesPanel } from "../components/CostTypes";
=======
import { PageHead, Loading, ErrorState, Badge } from "../components/Common";
import { Button } from "../components/ui/button";
<<<<<<< HEAD
import { CostTypesPanel } from "../components/CostTypes";
=======
<<<<<<< HEAD
import { CostTypesPanel } from "../components/CostTypes";
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
export default function Finance() {
  const { data, loading, error, reload } = useData("/projects");
  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} reload={reload} />;
  const totals = data.reduce(
      (a, p) => ({
        value: a.value + p.value,
        development: a.development + (p.development_cost || 0),
        server: a.server + (p.server_cost || 0),
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
        other: a.other + (p.other_cost || 0),
      }),
      { value: 0, development: 0, server: 0, other: 0 },
    ),
    profit = totals.value - totals.development - totals.server - totals.other;
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
      }),
      { value: 0, development: 0, server: 0 },
    ),
    profit = totals.value - totals.development - totals.server;
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
  return (
    <>
      <PageHead
        eyebrow="FINANCIAL OVERVIEW"
        title="Keuangan"
        description="Setiap angka, perspektif baru untuk bisnis Anda."
      >
<<<<<<< HEAD
        <ExportButton
          testid="export-finance"
          className="primary-button"
          onExport={() =>
            download("/reports/projects.xlsx", "laporan-keuangan-maiharta.xlsx")
          }
        >
          Ekspor laporan
        </ExportButton>
=======
        <Button
          data-testid="export-finance"
          className="primary-button"
          onClick={() =>
            download("/reports/projects.csv", "laporan-keuangan-maiharta.csv")
          }
        >
          <Download size={15} />
          Ekspor laporan
        </Button>
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
      </PageHead>
      <div className="finance-summary">
        {[
          ["Total nilai project", totals.value, Wallet],
          ["Biaya development", totals.development, Code2],
          ["Biaya server", totals.server, Server],
<<<<<<< HEAD
          ["Biaya lainnya", totals.other, Wallet],
          ["Estimasi keuntungan", profit, TrendingUp],
        ].map(([n, v, Icon], i) => (
          <motion.div
            className="finance-card"
            key={n}
            data-testid={`finance-stat-${i}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
=======
<<<<<<< HEAD
          ["Biaya lainnya", totals.other, Wallet],
=======
<<<<<<< HEAD
          ["Biaya lainnya", totals.other, Wallet],
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
          ["Estimasi keuntungan", profit, TrendingUp],
        ].map(([n, v, Icon], i) => (
          <div
            className="finance-card"
            key={n}
            data-testid={`finance-stat-${i}`}
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
          >
            <small>
              <Icon size={15} />
              {n}
            </small>
<<<<<<< HEAD
            <b>
              Rp <CountUp value={v} format={compact} />
            </b>
          </motion.div>
        ))}
      </div>
      <CostTypesPanel />
=======
            <b>Rp {compact(v)}</b>
          </div>
        ))}
      </div>
<<<<<<< HEAD
      <CostTypesPanel />
=======
<<<<<<< HEAD
      <CostTypesPanel />
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
      <div className="panel panel-padding" style={{ marginBottom: 27 }}>
        <div className="section-heading">
          <h2>Nilai & profit per project</h2>
          <div className="chart-legend">
            <span>
              <i />
              Nilai project
            </span>
            <span>
              <i />
              Profit
            </span>
          </div>
        </div>
        <div style={{ height: 245 }} data-testid="finance-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.map((p) => ({
                name: p.code,
                nilai: p.value / 1e6,
                profit:
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
                  (p.value -
                    (p.development_cost || 0) -
                    (p.server_cost || 0) -
                    (p.other_cost || 0)) /
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
                  (p.value - (p.development_cost || 0) - (p.server_cost || 0)) /
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
                  1e6,
              }))}
              barGap={6}
              margin={{ left: -20, top: 15, right: 5, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--line)"
                vertical={false}
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8993a7", fontSize: 9 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8993a7", fontSize: 9 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  fontSize: 11,
                  borderRadius: 6,
                }}
                formatter={(v, n) => [`${v} jt`, n]}
              />
              <Bar
                dataKey="nilai"
                name="Nilai"
                fill="#5984ef"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="profit"
                name="Profit"
                fill="#62b7a6"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel table-wrap">
        <table className="data-table" data-testid="finance-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Nilai project</th>
              <th>Development</th>
              <th>Server</th>
<<<<<<< HEAD
              <th>Lainnya</th>
=======
<<<<<<< HEAD
              <th>Lainnya</th>
=======
<<<<<<< HEAD
              <th>Lainnya</th>
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
              <th>Profit</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
<<<<<<< HEAD
            {data.map((p, i) => {
              const pr =
=======
            {data.map((p) => {
              const pr =
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
                p.value -
                (p.development_cost || 0) -
                (p.server_cost || 0) -
                (p.other_cost || 0);
<<<<<<< HEAD
              return (
                <motion.tr
                  key={p.id}
                  data-testid={`finance-row-${p.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: "easeOut" }}
                >
=======
<<<<<<< HEAD
=======
=======
                p.value - (p.development_cost || 0) - (p.server_cost || 0);
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
              return (
                <tr key={p.id} data-testid={`finance-row-${p.id}`}>
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
                  <td>
                    <Link
                      to={`/projects/${p.id}`}
                      data-testid={`finance-project-${p.id}`}
                    >
                      {p.name}
                      <ArrowUpRight
                        size={12}
                        style={{ display: "inline", marginLeft: 5 }}
                      />
                    </Link>
                  </td>
                  <td>{money(p.value)}</td>
                  <td>{money(p.development_cost)}</td>
                  <td>{money(p.server_cost)}</td>
<<<<<<< HEAD
                  <td>{money(p.other_cost)}</td>
=======
<<<<<<< HEAD
                  <td>{money(p.other_cost)}</td>
=======
<<<<<<< HEAD
                  <td>{money(p.other_cost)}</td>
=======
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
                  <td style={{ color: pr >= 0 ? "#6dc4a2" : "#e48491" }}>
                    {money(pr)}
                  </td>
                  <td>{p.value ? Math.round((pr / p.value) * 100) : 0}%</td>
<<<<<<< HEAD
                </motion.tr>
=======
                </tr>
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
