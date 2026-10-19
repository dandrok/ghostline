// Dashboard endpoints. Mount in server/index.mjs, after `const app` and `const pool`:
//
//   import { registerDashboardRoutes } from './routes.mjs'
//   registerDashboardRoutes(app, pool)
//
// Every query reads jobdb.v_* views and filters is_primary, so the 11 duplicate
// applications never reach a chart. Board/role cuts keep the n>=10 rule baked into
// the view: a 100% rate off three rows is not a finding.

const SHORT_BOARD = `
  case
    when board like 'Employer ATS%' then 'ATS'
    when board = 'NoFluffJobs'       then 'NoFluffJobs'
    when board = 'JustJoin.it'       then 'JustJoin'
    when board = 'TheSmartJobs'      then 'SmartJobs'
    when board = 'pracuj.pl'         then 'pracuj'
    else board
  end`

export function registerDashboardRoutes(app, pool) {
  const route = (sql) => async (_req, res) => {
    try {
      const { rows } = await pool.query(sql)
      res.json(rows)
    } catch (err) {
      console.error('[api]', err.message)
      res.status(500).json({ error: err.message })
    }
  }

  app.get(
    '/api/reply-by-board',
    route(`
      select board, n, reply_pct, reached_human,
             ${SHORT_BOARD} as short
      from jobdb.v_reply_rate_by_board
      order by reply_pct desc`)
  )

  app.get(
    '/api/reply-by-role',
    route(`
      select role_family, n, reply_pct
      from jobdb.v_reply_rate_by_role_family
      order by n desc`)
  )

  app.get(
    '/api/outcomes',
    route(`
      select status_code,
             status        as label,
             status_family as family,
             count(*)::int as n,
             round(100.0 * count(*) / sum(count(*)) over (), 1)::float8 as pct,
             case status_code
               when 10 then 'awaiting'
               when 11 then 'ack'
               when 12 then 'in progress'
               when 20 then 'auto-reject'
               when 21 then 'rej. screen'
               when 22 then 'rej. tech'
               when 23 then 'rej. manager'
               when 24 then 'rej. final'
               when 30 then 'ghosted'
               when 32 then 'cancelled'
               when 50 then 'offer'
               else 'not real'
             end as short
      from jobdb.v_application
      where is_primary
      group by 1, 2, 3
      order by 1`)
  )

  app.get(
    '/api/funnel',
    route(`
      select stage, n from (
        select 1 as ord, 'applied'   as stage,
               count(*)::int as n from jobdb.v_application where is_primary
        union all
        select 2, 'replied', count(*)::int from jobdb.v_application
          where is_primary and status_code <> 10
        union all
        select 3, 'screening', count(*)::int from jobdb.v_application
          where is_primary and stage_reached >= 2
        union all
        select 4, 'technical', count(*)::int from jobdb.v_application
          where is_primary and stage_reached >= 3
        union all
        select 5, 'manager', count(*)::int from jobdb.v_application
          where is_primary and stage_reached >= 4
        union all
        select 6, 'offer', count(*)::int from jobdb.v_application
          where is_primary and status_code between 50 and 52
      ) t
      order by ord`)
  )

  // Sankey: which board produces which outcome. source/target are display labels;
  // the component namespaces them into node ids so a board and an outcome can
  // never collide.
  app.get(
    '/api/flow',
    route(`
      select source, target, count(*)::int as value
      from (
        select ${SHORT_BOARD} as source, status_family as target
        from jobdb.v_application
        where is_primary
      ) t
      group by 1, 2
      order by 3 desc`)
  )

  app.get(
    '/api/timeline',
    route(`
      select to_char(applied_on, 'YYYY-MM') as month,
             status_family                  as family,
             count(*)::int                  as n
      from jobdb.v_application
      where is_primary and applied_on is not null
      group by 1, 2
      order by 1, 2`)
  )

  app.get(
    '/api/silence',
    route(`
      select board, silent_over_30d, avg_days_waiting, longest_wait_days,
             ${SHORT_BOARD} as short
      from jobdb.v_silence
      order by silent_over_30d desc`)
  )
}
