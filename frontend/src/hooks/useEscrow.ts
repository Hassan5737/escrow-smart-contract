import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { isAddress, type Address } from 'viem'
import { useBalance, useBlockNumber, usePublicClient, useReadContracts } from 'wagmi'
import { targetChain } from '../config/wagmi'
import { escrowAbi } from '../contracts/escrowAbi'
import type { EscrowSnapshot } from '../types'

export interface EscrowRead {
  buyer: Address | undefined
  seller: Address | undefined
  arbiter: Address | undefined
  amount: bigint | undefined
  buyerApproved: boolean | undefined
  sellerApproved: boolean | undefined
  isDisputeRaised: boolean | undefined
}

interface CallResult {
  status: 'success' | 'failure'
  result?: unknown
}

function resultAt<T>(items: readonly CallResult[] | undefined, index: number): T | undefined {
  const item = items?.[index]
  if (!item || item.status !== 'success' || item.result === undefined) return undefined
  return item.result as T
}

export function useEscrow(address: Address | undefined) {
  const valid = address !== undefined && isAddress(address)
  const chainId = targetChain.id
  const publicClient = usePublicClient({ chainId })

  const contracts = useMemo(
    () =>
      [
        { address, abi: escrowAbi, functionName: 'buyer' },
        { address, abi: escrowAbi, functionName: 'seller' },
        { address, abi: escrowAbi, functionName: 'arbiter' },
        { address, abi: escrowAbi, functionName: 'amount' },
        { address, abi: escrowAbi, functionName: 'buyerApproved' },
        { address, abi: escrowAbi, functionName: 'sellerApproved' },
        { address, abi: escrowAbi, functionName: 'isDisputeRaised' },
      ] as const,
    [address],
  )

  const reads = useReadContracts({
    contracts,
    query: { enabled: valid },
  })

  const balance = useBalance({
    address: valid ? address : undefined,
    chainId,
    query: { enabled: valid },
  })

  const code = useQuery({
    queryKey: ['escrow-code', address, chainId],
    enabled: valid && publicClient !== undefined,
    queryFn: async () => {
      if (!address || !publicClient) return undefined
      return publicClient.getBytecode({ address })
    },
  })

  const blockNumber = useBlockNumber({ watch: true, chainId })

  async function refetch() {
    await Promise.all([reads.refetch(), balance.refetch(), code.refetch()])
  }

  const refetchRef = useRef(refetch)
  refetchRef.current = refetch

  useEffect(() => {
    if (!valid || blockNumber.data === undefined) return
    void refetchRef.current()
  }, [blockNumber.data, valid, address])

  const exists = code.data !== undefined && code.data !== '0x'
  const checking =
    valid &&
    publicClient !== undefined &&
    code.data === undefined &&
    code.error === null &&
    (code.isPending || code.isFetching)

  const read = useMemo<EscrowRead>(() => {
    if (!valid || !exists) {
      return {
        buyer: undefined,
        seller: undefined,
        arbiter: undefined,
        amount: undefined,
        buyerApproved: undefined,
        sellerApproved: undefined,
        isDisputeRaised: undefined,
      }
    }

    return {
      buyer: resultAt<Address>(reads.data, 0),
      seller: resultAt<Address>(reads.data, 1),
      arbiter: resultAt<Address>(reads.data, 2),
      amount: resultAt<bigint>(reads.data, 3),
      buyerApproved: resultAt<boolean>(reads.data, 4),
      sellerApproved: resultAt<boolean>(reads.data, 5),
      isDisputeRaised: resultAt<boolean>(reads.data, 6),
    }
  }, [valid, exists, reads.data])

  const snapshot = useMemo<EscrowSnapshot | undefined>(() => {
    if (
      !valid ||
      !exists ||
      read.amount === undefined ||
      balance.data?.value === undefined ||
      read.buyerApproved === undefined ||
      read.sellerApproved === undefined ||
      read.isDisputeRaised === undefined
    ) {
      return undefined
    }

    return {
      amount: read.amount,
      balance: balance.data.value,
      buyerApproved: read.buyerApproved,
      sellerApproved: read.sellerApproved,
      isDisputeRaised: read.isDisputeRaised,
    }
  }, [valid, exists, read, balance.data])

  const error = reads.error ?? balance.error ?? code.error

  return {
    valid,
    ready: valid && publicClient !== undefined,
    exists,
    checking,
    read,
    snapshot,
    balance: balance.data?.value,
    isError: reads.isError || balance.isError || code.isError,
    errorMessage: error?.message ?? null,
    refetch,
  }
}
