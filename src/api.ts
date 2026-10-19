// One file per series: the API is the only place that knows about /api paths.
export type BoardReply = {
  board: string
  short: string
  n: number
  reply_pct: number
  reached_human: number
}

export type RoleReply = {
  role_family: string
  n: number
  reply_pct: number
}

export type Outcome = {
  status_code: number
  label: string
  short: string
  family: string
  n: number
  pct: number
}

export type FunnelStage = { stage: string; n: number }

export type FlowLink = { source: string; target: string; value: number }

export type MonthBucket = { month: string; family: string; n: number }

export type Silence = {
  board: string
  short: string
  silent_over_30d: number
  avg_days_waiting: number
  longest_wait_days: number
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return (await res.json()) as T
}

export const fetchBoardReply = () => get<BoardReply[]>('/api/reply-by-board')
export const fetchRoleReply = () => get<RoleReply[]>('/api/reply-by-role')
export const fetchOutcomes = () => get<Outcome[]>('/api/outcomes')
export const fetchFunnel = () => get<FunnelStage[]>('/api/funnel')
export const fetchFlow = () => get<FlowLink[]>('/api/flow')
export const fetchTimeline = () => get<MonthBucket[]>('/api/timeline')
export const fetchSilence = () => get<Silence[]>('/api/silence')
