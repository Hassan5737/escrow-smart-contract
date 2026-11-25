import { formatEther, type Address } from 'viem'

export function truncateAddress(address: Address, lead = 6, tail = 4): string {
  if (address.length <= lead + tail + 1) return address
  return `${address.slice(0, lead)}…${address.slice(-tail)}`
}

export function formatEth(value: bigint, maxFractionDigits = 4): string {
  const parts = formatEther(value).split('.')
  const whole = parts[0] ?? '0'
  const fraction = parts[1] ?? ''
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, '')
  return trimmed.length === 0 ? whole : `${whole}.${trimmed}`
}
