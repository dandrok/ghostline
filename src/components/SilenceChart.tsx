import { useMemo } from 'react'
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { fetchSilence } from '../api'
import { useFetch } from '../hooks/useFetch'
import { ChartCard } from './ChartCard'

export function SilenceChart() {
  const { data, error, loading } = useFetch(fetchSilence)

  const rows = useMemo(() => (data ?? []).filter((r) => r.silent_over_30d >= 10), [data])

  const chart = useMemo(() => {
    if (!rows.length) return null
    return defineChart({
      marks: [barY(rows, { x: 'short', y: 'avg_days_waiting' })],
      scales: {
        x: { scale: () => scaleBand().padding(0.25) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'days waiting' } },
      },
      tooltip,
    })
  }, [rows])

  const total = (data ?? []).reduce((sum, r) => sum + r.silent_over_30d, 0)
  const oldest = [...(data ?? [])].sort((a, b) => b.longest_wait_days - a.longest_wait_days)[0]

  return (
    <ChartCard
      title="Silence, measured"
      value={`${total} applications unanswered`}
      note={
        oldest
          ? `longest ${oldest.longest_wait_days} days (${oldest.board}) · boards with n≥10 shown`
          : undefined
      }
      loading={loading}
      error={error}
    >
      {chart && (
        <Chart definition={chart} height={300} ariaLabel="Average days waiting by board" />
      )}
    </ChartCard>
  )
}
