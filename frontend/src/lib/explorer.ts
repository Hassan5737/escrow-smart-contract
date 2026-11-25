import type { Address } from 'viem'

export function internalTxUrl(address: Address, chainId: number): string | undefined {
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/address/${address}#internaltx`
  }
  return undefined
}

export function addressUrl(address: Address, chainId: number): string | undefined {
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/address/${address}`
  }
  return undefined
}

export function txUrl(hash: `0x${string}`, chainId: number): string | undefined {
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/tx/${hash}`
  }
  return undefined
}
