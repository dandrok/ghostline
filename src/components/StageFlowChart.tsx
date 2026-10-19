import { useMemo } from 'react'
import { fetchFunnel } from '../api'
import { useFetch } from '../hooks/useFetch'
import { ChartCard } from './ChartCard'

const LABEL: Record<string, string> = {
  applied: 'applied',
  replied: 'any reply',
  screening: 'screening',
  technical: 'technical',
  manager: 'hiring manager',
  offer: 'offer',
}

/**
 * Conversion flow: each stage keeps what survived it, and the arrow to the next
 * stage carries what fell out (count + share). Cumulative data from /api/funnel.
 *
 * Plain markup rather than a chart lib: the shape is a sequence of blocks, not a
 * coordinate system, and this is the element that gets motion later.
 */
export function StageFlowChart() {
  const { data, error, loading } = useFetch(fetchFunnel)

  const steps = useMemo(() => {
    if (!data?.length) return []
    return data.map((stage, i) => {
      const prev = i > 0 ? data[i - 1].n : null
      const lost = prev === null ? null : prev - stage.n
      const lostPct = prev ? Math.round((lost! / prev) * 100) : null
      const kept = prev ? Math.round((stage.n / prev) * 100) : 100
      return { ...stage, label: LABEL[stage.stage] ?? stage.stage, lost, lostPct, kept }
    })
  }, [data])

  const applied = steps[0]?.n ?? 0
  const offer = steps[steps.length - 1]?.n ?? 0
  const endToEnd = applied ? ((offer / applied) * 100).toFixed(1) : '0'

  return (
    <ChartCard
      title="From sent to offer"
      value={applied ? `${endToEnd}% end to end` : '—'}
      note="each block keeps only what survived the previous stage; the arrow carries what fell out"
      loading={loading}
      error={error}
    >
      <div className="flow">
        {steps.map((s, i) => (
          <div className="flow-part" key={s.stage}>
            {i > 0 && (
              <div className="flow-arrow" title={`${s.lost} dropped (${s.lostPct}%)`}>
                <span className="flow-drop">−{s.lostPct}%</span>
                <span className="flow-line" aria-hidden="true">
                  →
                </span>
                <span className="flow-lost">{s.lost} lost</span>
              </div>
            )}
            <div className={`flow-step ${s.stage === 'offer' ? 'is-offer' : ''}`}>
              <span className="flow-count">{s.n}</span>
              <span className="flow-label">{s.label}</span>
              {i > 0 && <span className="flow-kept">{s.kept}% carried on</span>}
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
