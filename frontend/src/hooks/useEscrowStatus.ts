import { useMemo } from 'react'
import { deriveStatus } from '../lib/status'
import type { EscrowSnapshot } from '../types'

export function useEscrowStatus(snapshot: EscrowSnapshot | undefined) {
  return useMemo(() => (snapshot ? deriveStatus(snapshot) : undefined), [snapshot])
}
