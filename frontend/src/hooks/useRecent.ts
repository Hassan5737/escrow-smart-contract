import { useCallback, useEffect, useRef, useState } from 'react'
import { isAddress, type Address } from 'viem'

const STORAGE_KEY = 'escrow.recent.v1'
const MAX_ITEMS = 5

function readRecent(): Address[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is Address => typeof item === 'string' && isAddress(item, { strict: false }))
      .slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

export function useRecent() {
  const [recent, setRecent] = useState<Address[]>(readRecent)
  const latest = useRef(recent)

  useEffect(() => {
    latest.current = recent
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
    } catch {}
  }, [recent])

  const remember = useCallback((address: Address) => {
    const next = [
      address,
      ...latest.current.filter((item) => item.toLowerCase() !== address.toLowerCase()),
    ].slice(0, MAX_ITEMS)
    latest.current = next
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
    setRecent(next)
  }, [])

  const clear = useCallback(() => {
    latest.current = []
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    } catch {}
    setRecent([])
  }, [])

  return { recent, remember, clear }
}
