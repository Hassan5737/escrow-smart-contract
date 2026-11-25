import { anvil } from '../config/wagmi'
import { sepolia } from 'wagmi/chains'

export function chainLabel(chainId: number | undefined): string {
  if (chainId === sepolia.id) return 'Sepolia'
  if (chainId === anvil.id) return 'Anvil'
  return chainId === undefined ? 'unknown network' : `chain ${chainId}`
}
