import { useMemo } from 'react'
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { fetchBoardReply } from '../api'
import { useFetch } from '../hooks/useFetch'
import { ChartCard } from './ChartCard'

export function BoardReplyChart() {
  const { data, error, loading } = useFetch(fetchBoardReply)

  const chart = useMemo(() => {
    if (!data?.length) return null
    return defineChart({
      marks: [barY(data, { x: 'short', y: 'reply_pct' })],
      scales: {
        x: { scale: () => scaleBand().padding(0.25) },
        y: { scale: scaleLinear, nice: true, grid: true, axis: { label: 'Reply %' } },
      },
      tooltip,
    })
  }, [data])

  const best = data?.[0]

  return (
    <ChartCard
      title="Which boards reach a human"
      value={best ? `${best.reply_pct}%` : '—'}
      note={
        best
          ? `${best.board} · n=${best.n} · 30-day window, boards with n≥10`
          : undefined
      }
      loading={loading}
      error={error}
    >
      {chart && (
        <Chart definition={chart} height={320} ariaLabel="Reply rate by job board" />
      )}
    </ChartCard>
  )
}
