import { useMemo } from 'react'
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { fetchFunnel } from '../api'
import { useFetch } from '../hooks/useFetch'
import { ChartCard } from './ChartCard'

/**
 * Cumulative, not exclusive: "screening 35" means 35 applications reached at least
 * a screening. Each bar is a subset of the one before it.
 */
export function FunnelChart() {
  const { data, error, loading } = useFetch(fetchFunnel)

  const chart = useMemo(() => {
    if (!data?.length) return null
    return defineChart({
      marks: [barY(data, { x: 'stage', y: 'n' })],
      scales: {
        x: { scale: () => scaleBand().padding(0.25) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'applications' } },
      },
      tooltip,
    })
  }, [data])

  const applied = data?.[0]?.n ?? 0
  const offers = data?.find((d) => d.stage === 'offer')?.n ?? 0

  return (
    <ChartCard
      title="From sent to offer"
      value={applied ? `1 offer from ${applied}` : '—'}
      note="each stage counts every application that reached it, so bars are nested, not exclusive"
      loading={loading}
      error={error}
    >
      {chart && (
        <Chart definition={chart} height={320} ariaLabel="Application funnel" />
      )}
      <p className="note">
        {data?.map((d) => `${d.stage} ${d.n}`).join(' → ')}
        {offers ? '' : ' · no offers yet'}
      </p>
    </ChartCard>
  )
}
