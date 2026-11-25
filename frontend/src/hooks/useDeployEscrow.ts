import { useCallback, useEffect, useRef, useState } from 'react'
import { encodeDeployData, type Address, type Hash } from 'viem'
import { useAccount, useDeployContract, usePublicClient, useWaitForTransactionReceipt } from 'wagmi'
import { targetChain } from '../config/wagmi'
import { escrowAbi } from '../contracts/escrowAbi'
import { escrowBytecode } from '../contracts/escrowBytecode'
import { describeContractError } from '../lib/errors'
import type { TxPhase } from './useEscrowWrite'

export interface DeployParams {
  buyer: Address
  seller: Address
  arbiter: Address
  amount: bigint
}

interface DeploymentState {
  phase: TxPhase
  hash: Hash | undefined
  error: string | null
  deployedAddress: Address | undefined
}

const idleState: DeploymentState = {
  phase: 'idle',
  hash: undefined,
  error: null,
  deployedAddress: undefined,
}

function sameAddress(left: Address, right: Address): boolean {
  return left.toLowerCase() === right.toLowerCase()
}

export function useDeployEscrow() {
  const { address: deployer, chainId: walletChainId } = useAccount()
  const publicClient = usePublicClient({ chainId: targetChain.id })
  const { deployContractAsync } = useDeployContract()
  const [tx, setTx] = useState<DeploymentState>(idleState)

  const receipt = useWaitForTransactionReceipt({
    hash: tx.hash,
    chainId: targetChain.id,
    query: { enabled: tx.hash !== undefined, retry: false },
  })

  const verifiedHash = useRef<Hash | undefined>(undefined)
  const submitted = useRef<DeployParams | undefined>(undefined)

  useEffect(() => {
    if (!tx.hash || verifiedHash.current === tx.hash || !receipt.isSuccess) return
    if (!publicClient || !submitted.current) return

    verifiedHash.current = tx.hash
    const deployedAddress = receipt.data.contractAddress
    const params = submitted.current

    if (!deployedAddress) {
      setTx({
        phase: 'failed',
        hash: tx.hash,
        error: 'The deployment did not return a contract address.',
        deployedAddress: undefined,
      })
      return
    }

    void (async () => {
      try {
        const [buyer, seller, arbiter, amount] = await Promise.all([
          publicClient.readContract({ address: deployedAddress, abi: escrowAbi, functionName: 'buyer' }),
          publicClient.readContract({ address: deployedAddress, abi: escrowAbi, functionName: 'seller' }),
          publicClient.readContract({ address: deployedAddress, abi: escrowAbi, functionName: 'arbiter' }),
          publicClient.readContract({ address: deployedAddress, abi: escrowAbi, functionName: 'amount' }),
        ])

        const matches =
          sameAddress(buyer as Address, params.buyer) &&
          sameAddress(seller as Address, params.seller) &&
          sameAddress(arbiter as Address, params.arbiter) &&
          (amount as bigint) === params.amount

        if (!matches) {
          setTx({
            phase: 'failed',
            hash: tx.hash,
            error: 'The deployed contract did not match the reviewed roles and amount.',
            deployedAddress: undefined,
          })
          return
        }

        setTx({ phase: 'confirmed', hash: tx.hash, error: null, deployedAddress })
      } catch (reason) {
        setTx({
          phase: 'failed',
          hash: tx.hash,
          error: `The deployment confirmed, but the contract could not be verified: ${describeContractError(reason)}`,
          deployedAddress: undefined,
        })
      }
    })()
  }, [publicClient, receipt.data, receipt.isSuccess, tx.hash])

  const phase: TxPhase =
    tx.hash !== undefined && receipt.isError ? 'failed' : tx.phase

  const error = tx.error ?? (receipt.error ? describeContractError(receipt.error) : null)
  const busy = phase === 'simulating' || phase === 'waitingWallet' || phase === 'pending'

  const reset = useCallback(() => {
    verifiedHash.current = undefined
    submitted.current = undefined
    setTx(idleState)
  }, [])

  const submit = useCallback(
    async (params: DeployParams) => {
      if (!publicClient || !deployer) {
        setTx({
          ...idleState,
          phase: 'failed',
          error: 'Connect a wallet before deploying.',
        })
        return
      }
      if (walletChainId !== targetChain.id) {
        setTx({
          ...idleState,
          phase: 'failed',
          error: 'You are on the wrong network. Switch networks and try again.',
        })
        return
      }

      verifiedHash.current = undefined
      submitted.current = params
      setTx({ ...idleState, phase: 'simulating' })

      try {
        const data = encodeDeployData({
          abi: escrowAbi,
          bytecode: escrowBytecode,
          args: [params.buyer, params.seller, params.arbiter],
        })

        await publicClient.estimateGas({
          account: deployer,
          data,
          value: params.amount,
        })

        setTx({ ...idleState, phase: 'waitingWallet' })
        const hash = await deployContractAsync({
          abi: escrowAbi,
          bytecode: escrowBytecode,
          args: [params.buyer, params.seller, params.arbiter],
          value: params.amount,
          account: deployer,
          chainId: targetChain.id as 11155111 | 31337,
        })
        setTx({ phase: 'pending', hash, error: null, deployedAddress: undefined })
      } catch (reason) {
        setTx({
          ...idleState,
          phase: 'failed',
          error: describeContractError(reason),
        })
      }
    },
    [deployContractAsync, deployer, publicClient, walletChainId],
  )

  return {
    phase,
    hash: tx.hash,
    error,
    busy,
    deployedAddress: tx.deployedAddress,
    reset,
    submit,
  }
}
