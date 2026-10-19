import express from "express";
import pg from "pg";

import { registerDashboardRoutes } from "./routes.mjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
registerDashboardRoutes(app, pool);
app.get("/api/health", async (_req, res) => {
  const { rows } = await pool.query(
    "select count(*)::int as applications from jobdb.fact_application",
  );
  res.json(rows[0]);
});
app.get("/api/reply-by-board", async (_req, res) => {
  const { rows } = await pool.query(`
    select board,
           count(*)::int as n,
           round(100.0 * count(*) filter (where status_code <> 10) / count(*), 1)::float8 as reply_pct
    from jobdb.v_application
    where is_primary
    group by 1
    order by 3 desc`);
  res.json(rows);
});
app.listen(8787, () => console.log("api → http://localhost:8787"));
