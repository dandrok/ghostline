import { useEffect, useState } from 'react'

/**
 * Minimal async state. Pass a *stable* function (one imported from api.ts),
 * never an inline arrow — an inline fn changes identity every render and the
 * effect loops forever.
 */
export function useFetch<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    fn()
      .then((d) => alive && setData(d))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e : new Error(String(e))))
    return () => {
      alive = false
    }
  }, [fn])

  return { data, error, loading: !data && !error }
}
