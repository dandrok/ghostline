import { useMemo } from 'react'
import { defineChart, link, rect, text } from '@tanstack/charts'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
import { Chart } from '@tanstack/charts/react'
import { fetchFlow } from '../api'
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

/** Boards below this are dropped: their ribbons would be hairlines next to pracuj. */
const MIN_APPS = 20

/**
 * Normalised alluvial: every board is drawn at the same height, and the ribbons
 * show its *composition* of outcomes, not its volume. Absolute ribbons failed
 * here — "no reply yet" is ~74% of every board, so one grey mass swallowed the
 * picture. The application count stays in the board label.
 */
export function SankeyFlow() {
  const { data, error, loading } = useFetch(fetchFlow)

  const { nodes, links, dropped } = useMemo(() => {
    const rows = data ?? []
    const totals = new Map<string, number>()
    for (const r of rows) totals.set(r.source, (totals.get(r.source) ?? 0) + r.value)

    const kept = [...totals.entries()].filter(([, n]) => n >= MIN_APPS)
    const keptNames = new Set(kept.map(([s]) => s))
    const dropped = [...totals.keys()].filter((s) => !keptNames.has(s)).length

    const shares = rows
      .filter((r) => keptNames.has(r.source))
      .map((r) => ({
        source: `s:${r.source}`,
        target: `t:${r.target}`,
        value: (r.value / (totals.get(r.source) as number)) * 100,
        count: r.value,
      }))

    const targets = [...new Set(shares.map((s) => s.target))]

    return {
      nodes: [
        ...kept.map(([s, n]) => ({ id: `s:${s}`, label: `${s} · ${n}` })),
        ...targets.map((t) => ({ id: t, label: t.slice(2) })),
      ],
      links: shares,
      dropped,
    }
  }, [data])

  const chart = useMemo(() => {
    if (!links.length) return null

    const family = (id: string) => COLOUR[id.slice(2)] ?? 'var(--c-pending)'

    return defineChart({
      marks: [
        sankeyDiagram({
          nodes,
          links,
          nodeKey: 'id',
          source: 'source',
          target: 'target',
          value: 'value',
          align: 'left',
          nodeWidth: 5,
          nodePadding: 9,
          inset: { left: 0, right: 104, top: 26, bottom: 6 },
          marks: ({ nodes: layoutNodes, links: layoutLinks }) => [
            link(layoutLinks, {
              x1: 'x1',
              y1: 'y1',
              x2: 'x2',
              y2: 'y2',
              key: 'key',
              strokeWidth: (flow) => Math.max(0.5, flow.width),
              stroke: (flow) => {
                const target = (flow as { data?: { target?: string } }).data?.target ?? ''
                return family(target)
              },
              strokeOpacity: 0.55,
              lineCap: 'butt',
            }),
            rect(layoutNodes, {
              x1: 'x0',
              x2: 'x1',
              y1: 'y0',
              y2: 'y1',
              key: 'key',
              inset: 0,
              // rect.fill is a constant in this API, not a channel: nodes stay ink,
              // the ribbons carry the outcome colour.
              fill: 'var(--ink)',
            }),
            text(layoutNodes, {
              x: 'x',
              y: (node) => node.y0 - 5,
              text: (node) => node.data.label,
              key: 'key',
              fill: 'currentColor',
              fontSize: 11,
            }),
          ] as const,
        }),
      ],
      scales: { x: null, y: null },
      guides: false,
      margin: 0,
    })
  }, [nodes, links])

  return (
    <ChartCard
      title="What each board is made of"
      value={`${nodes.length - new Set(links.map((l) => l.target)).size} boards`}
      note={`every board drawn at the same height, so ribbons are shares, not volumes${
        dropped ? ` · ${dropped} boards under ${MIN_APPS} applications hidden` : ''
      }`}
      loading={loading}
      error={error}
    >
      {chart && (
        <Chart definition={chart} height={380} ariaLabel="Outcome composition by job board" />
      )}
    </ChartCard>
  )
}
