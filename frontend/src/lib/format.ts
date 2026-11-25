import { formatEther, type Address, type Hex } from 'viem'

export function truncateAddress(address: Address, lead = 6, tail = 4): string {
  return truncateHex(address, lead, tail)
}

export function truncateHash(hash: Hex, lead = 10, tail = 8): string {
  return truncateHex(hash, lead, tail)
}

function truncateHex(value: Hex, lead: number, tail: number): string {
  if (value.length <= lead + tail + 1) return value
  return `${value.slice(0, lead)}…${value.slice(-tail)}`
}

export function formatEth(value: bigint, maxFractionDigits = 4): string {
  const parts = formatEther(value).split('.')
  const whole = parts[0] ?? '0'
  const fraction = parts[1] ?? ''
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, '')
  return trimmed.length === 0 ? whole : `${whole}.${trimmed}`
}
