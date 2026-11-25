import { useCallback, useEffect, useRef, useState } from 'react'
import type { Address, Hash, PublicClient } from 'viem'
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { targetChain } from '../config/wagmi'
import { escrowAbi } from '../contracts/escrowAbi'
import { describeContractError } from '../lib/errors'
import type { EscrowAction } from '../types'

export type TxPhase = 'idle' | 'simulating' | 'waitingWallet' | 'pending' | 'confirmed' | 'failed'

type ConfirmedCallback = () => void | Promise<void>

interface TxState {
  phase: TxPhase
  hash: Hash | undefined
  error: string | null
}

const idleState: TxState = { phase: 'idle', hash: undefined, error: null }

export function useEscrowWrite(address: Address, onConfirmed: ConfirmedCallback) {
  const { address: account, chainId: walletChainId } = useAccount()
  const publicClient = usePublicClient({ chainId: targetChain.id })
  const { writeContractAsync } = useWriteContract()
  const [tx, setTx] = useState<TxState>(idleState)

  const receipt = useWaitForTransactionReceipt({
    hash: tx.hash,
    chainId: targetChain.id,
    query: { enabled: tx.hash !== undefined, retry: false },
  })

  const confirmedHash = useRef<Hash | undefined>(undefined)
  const onConfirmedRef = useRef(onConfirmed)
  onConfirmedRef.current = onConfirmed

  useEffect(() => {
    if (tx.hash === undefined || confirmedHash.current === tx.hash) return
    if (!receipt.isSuccess) return
    confirmedHash.current = tx.hash
    void onConfirmedRef.current()
  }, [receipt.isSuccess, tx.hash])

  const phase: TxPhase =
    tx.hash !== undefined && receipt.isSuccess
      ? 'confirmed'
      : tx.hash !== undefined && receipt.isError
        ? 'failed'
        : tx.phase

  const error = tx.error ?? (receipt.error ? describeContractError(receipt.error) : null)
  const busy = phase === 'simulating' || phase === 'waitingWallet' || phase === 'pending'

  const reset = useCallback(() => {
    confirmedHash.current = undefined
    setTx(idleState)
  }, [])

  const execute = useCallback(
    async (action: EscrowAction, client: PublicClient, signer: Address, onReady: () => void) => {
      switch (action) {
        case 'approveBuyer': {
          const { request } = await client.simulateContract({
            address,
            abi: escrowAbi,
            account: signer,
            chain: targetChain,
            functionName: 'approveByBuyer',
            args: [],
          })
          onReady()
          return writeContractAsync(request)
        }
        case 'approveSeller': {
          const { request } = await client.simulateContract({
            address,
            abi: escrowAbi,
            account: signer,
            chain: targetChain,
            functionName: 'approveBySeller',
            args: [],
          })
          onReady()
          return writeContractAsync(request)
        }
        case 'raiseDispute': {
          const { request } = await client.simulateContract({
            address,
            abi: escrowAbi,
            account: signer,
            chain: targetChain,
            functionName: 'raiseDispute',
            args: [],
          })
          onReady()
          return writeContractAsync(request)
        }
        case 'paySeller': {
          const { request } = await client.simulateContract({
            address,
            abi: escrowAbi,
            account: signer,
            chain: targetChain,
            functionName: 'resolveDispute',
            args: [true],
          })
          onReady()
          return writeContractAsync(request)
        }
        case 'refundBuyer': {
          const { request } = await client.simulateContract({
            address,
            abi: escrowAbi,
            account: signer,
            chain: targetChain,
            functionName: 'resolveDispute',
            args: [false],
          })
          onReady()
          return writeContractAsync(request)
        }
      }
    },
    [address, writeContractAsync],
  )

  const submit = useCallback(
    async (action: EscrowAction) => {
      if (!publicClient || !account) {
        setTx({ phase: 'failed', hash: undefined, error: 'Connect a wallet before acting.' })
        return
      }
      if (walletChainId !== targetChain.id) {
        setTx({
          phase: 'failed',
          hash: undefined,
          error: 'You are on the wrong network. Switch networks and try again.',
        })
        return
      }

      confirmedHash.current = undefined
      setTx({ phase: 'simulating', hash: undefined, error: null })

      try {
        const hash = await execute(action, publicClient, account, () => {
          setTx({ phase: 'waitingWallet', hash: undefined, error: null })
        })
        setTx({ phase: 'pending', hash, error: null })
      } catch (reason) {
        setTx({ phase: 'failed', hash: undefined, error: describeContractError(reason) })
      }
    },
    [account, execute, publicClient, walletChainId],
  )

  return { phase, hash: tx.hash, error, busy, reset, submit }
}
