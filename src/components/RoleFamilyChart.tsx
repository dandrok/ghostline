import { useMemo } from 'react'
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { fetchRoleReply } from '../api'
import { useFetch } from '../hooks/useFetch'
import { ChartCard } from './ChartCard'

// Long family names get a short axis label; the full name stays in the tooltip.
const SHORT: Record<string, string> = {
  'Frontend + Full-stack': 'FE+FS',
  'Full-stack + AI': 'FS+AI',
  'Frontend + AI': 'FE+AI',
  'Full-stack': 'Full-stack',
  Frontend: 'Frontend',
  Backend: 'Backend',
  'AI / ML': 'AI/ML',
  Unknown: 'unknown',
}

export function RoleFamilyChart() {
  const { data, error, loading } = useFetch(fetchRoleReply)

  const rows = useMemo(
    () => (data ?? []).map((r) => ({ ...r, short: SHORT[r.role_family] ?? r.role_family })),
    [data]
  )

  const chart = useMemo(() => {
    if (!rows.length) return null
    return defineChart({
      marks: [barY(rows, { x: 'short', y: 'reply_pct' })],
      scales: {
        x: { scale: () => scaleBand().padding(0.25) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Reply %' } },
      },
      tooltip,
    })
  }, [rows])

  const fe = rows.find((r) => r.role_family === 'Frontend')
  const fs = rows.find((r) => r.role_family === 'Full-stack')

  return (
    <ChartCard
      title="Frontend is not where the replies are"
      value={fe && fs ? `${fe.reply_pct}% vs ${fs.reply_pct}%` : '—'}
      note={
        fe && fs
          ? `frontend n=${fe.n} · full-stack n=${fs.n} · same person, same CV shape, different roles`
          : undefined
      }
      loading={loading}
      error={error}
    >
      {chart && (
        <Chart definition={chart} height={320} ariaLabel="Reply rate by role family" />
      )}
    </ChartCard>
  )
}
