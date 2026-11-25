import type { Address } from 'viem'

export function internalTxUrl(address: Address, chainId: number): string | undefined {
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/address/${address}#internaltx`
  }
  return undefined
}
