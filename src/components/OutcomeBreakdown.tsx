import { useMemo } from 'react'
import { barX, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { fetchOutcomes } from '../api'
import { useFetch } from '../hooks/useFetch'
import { ChartCard } from './ChartCard'

const COLOUR: Record<string, string> = {
  pending: 'var(--c-pending)',
  rejected: 'var(--c-rejected)',
  ghosted: 'var(--c-ghosted)',
  closed: 'var(--c-closed)',
  offer: 'var(--c-offer)',
  invalid: 'var(--c-invalid)',
}

/**
 * Twelve bars, one per status code. If @tanstack/charts exports `barX`, swap the
 * mark for horizontal bars — the long labels read better that way.
 */
export function OutcomeBreakdown() {
  const { data, error, loading } = useFetch(fetchOutcomes)

  const chart = useMemo(() => {
    if (!data?.length) return null
    return defineChart({
      // barX = horizontal bars; twelve outcome labels need the vertical room
      marks: [barX(data, { y: 'short', x: 'n' })],
      scales: {
        y: { scale: () => scaleBand().padding(0.2) },
        x: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'applications' } },
      },
      tooltip,
    })
  }, [data])

  const awaiting = data?.find((d) => d.status_code === 10)
  const families = useMemo(() => {
    const seen = new Map<string, number>()
    for (const r of data ?? []) seen.set(r.family, (seen.get(r.family) ?? 0) + r.n)
    return [...seen.entries()]
  }, [data])

  return (
    <ChartCard
      title="What actually happened"
      value={awaiting ? `${awaiting.pct}% still waiting` : '—'}
      note="every application, by coded outcome — the vocabulary is numeric, so bands are filterable"
      loading={loading}
      error={error}
    >
      <ul className="legend">
        {families.map(([family, n]) => (
          <li key={family}>
            <span className="dot" style={{ background: COLOUR[family] ?? 'var(--c-invalid)' }} />
            {family} · {n}
          </li>
        ))}
      </ul>
      {chart && <Chart definition={chart} height={340} ariaLabel="Outcome breakdown" />}
    </ChartCard>
  )
}
