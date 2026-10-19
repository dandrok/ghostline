import { useMemo } from 'react'
import { fetchTimeline } from '../api'
import { useFetch } from '../hooks/useFetch'
import { ChartCard } from './ChartCard'

const ORDER = ['pending', 'rejected', 'ghosted', 'closed', 'offer', 'invalid'] as const

/**
 * Deliberately not a library chart: this is the one element that will get motion
 * later (dots flying in month by month), and plain markup is the cheapest thing
 * to animate. Swap to the chart lib only if you want axes.
 */
export function TimelineChart() {
  const { data, error, loading } = useFetch(fetchTimeline)

  const months = useMemo(() => {
    const byMonth = new Map<string, Record<string, number>>()
    for (const row of data ?? []) {
      const bucket = byMonth.get(row.month) ?? {}
      bucket[row.family] = (bucket[row.family] ?? 0) + row.n
      byMonth.set(row.month, bucket)
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, families]) => ({
        month,
        families,
        total: Object.values(families).reduce((s, n) => s + n, 0),
      }))
  }, [data])

  const busiest = useMemo(
    () => [...months].sort((a, b) => b.total - a.total)[0],
    [months]
  )
  const peak = busiest?.total ?? 1

  return (
    <ChartCard
      title="The pipeline, month by month"
      value={busiest ? `${busiest.total} in ${busiest.month}` : '—'}
      note="one row per month, every application coloured by what happened to it"
      loading={loading}
      error={error}
    >
      <div className="timeline">
        {months.map(({ month, families, total }) => (
          <div className="tl-row" key={month}>
            <span className="tl-month">{month}</span>
            <span className="tl-bars" style={{ width: `${(total / peak) * 100}%` }}>
              {ORDER.filter((f) => families[f]).map((f) => (
                <span
                  key={f}
                  className={`tl-seg c-${f}`}
                  style={{ flexGrow: families[f] }}
                  title={`${f}: ${families[f]}`}
                />
              ))}
            </span>
            <span className="tl-total">{total}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
