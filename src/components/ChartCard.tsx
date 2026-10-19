import type { ReactNode } from 'react'

type Props = {
  title: string
  value: string
  note?: string
  loading?: boolean
  error?: Error | null
  children: ReactNode
}

/**
 * One card = one question. The number is the finding; the chart is the evidence.
 * Keep the title as a statement, not a label ("Which boards reach a human").
 */
export function ChartCard({ title, value, note, loading, error, children }: Props) {
  return (
    <section className="card">
      <header>
        <h2>{title}</h2>
        {loading && <p className="note">loading…</p>}
        {error && <p className="note error">{error.message}</p>}
        {!loading && !error && (
          <>
            <p className="big">{value}</p>
            {note && <p className="note">{note}</p>}
          </>
        )}
      </header>
      <div className="chart">{children}</div>
    </section>
  )
}
