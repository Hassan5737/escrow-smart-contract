import { useCallback, useEffect, useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'failed'

export function useCopy() {
  const [state, setState] = useState<CopyState>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const timer = window.setTimeout(() => setState('idle'), 1400)
    return () => window.clearTimeout(timer)
  }, [state])

  const copy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
    } catch {
      setState('failed')
    }
  }, [])

  return { state, copy, copied: state === 'copied', failed: state === 'failed' }
}
