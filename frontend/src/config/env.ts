import { getAddress, isAddress, type Address } from 'viem'

const FALLBACK_ADDRESS = '0x87Be26BfA7714A1E50aAF60C712f7b3dc3Bc809D' as Address
const configuredAddress = import.meta.env.VITE_ESCROW_ADDRESS?.trim() ?? ''

function resolveAddress(value: string): Address {
  if (value.length === 0) return FALLBACK_ADDRESS
  return isAddress(value, { strict: false }) ? getAddress(value) : FALLBACK_ADDRESS
}

export const env = {
  escrowAddress: resolveAddress(configuredAddress),
  sepoliaRpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL?.trim() || undefined,
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_ID?.trim() || undefined,
  enableLocal: import.meta.env.VITE_ENABLE_LOCAL === 'true',
  enableLab: import.meta.env.VITE_ENABLE_LAB === 'true',
} as const
