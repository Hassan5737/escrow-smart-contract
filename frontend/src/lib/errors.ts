import { decodeErrorResult, type Hex } from 'viem'
import { escrowAbi } from '../contracts/escrowAbi'

const customErrorMessages: Readonly<Record<string, string>> = {
  Escrow_onlyBuyer: 'Only the buyer can approve this deal.',
  Escrow_onlySeller: 'Only the seller can approve this deal.',
  Escrow_onlyBuyerOrSeller: 'Only the buyer or seller can raise a dispute.',
  Escrow_onlyArbiter: 'Only the arbiter can resolve this dispute.',
  Escrow_NoDisputeRaised: 'No dispute has been raised yet.',
  Escrow_TransferFailed: 'The ETH transfer failed. The vault is unchanged.',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function matchErrorName(text: string): string | null {
  for (const name of Object.keys(customErrorMessages)) {
    if (text.includes(name)) return customErrorMessages[name] ?? null
  }
  return null
}

function findErrorName(value: unknown, depth = 0): string | null {
  if (!isRecord(value) || depth > 8) return null

  for (const key of ['name', 'shortMessage', 'message'] as const) {
    const candidate = value[key]
    if (typeof candidate === 'string') {
      const match = matchErrorName(candidate)
      if (match) return match
    }
  }

  return findErrorName(value['cause'], depth + 1) ?? findErrorName(value['data'], depth + 1)
}

function findRevertData(value: unknown, depth = 0): Hex | undefined {
  if (!isRecord(value) || depth > 8) return undefined

  const direct = value['data']
  if (typeof direct === 'string' && direct.startsWith('0x') && direct.length >= 10) {
    return direct as Hex
  }

  return (
    findRevertData(value['cause'], depth + 1) ??
    (isRecord(direct) ? findRevertData(direct, depth + 1) : undefined)
  )
}

function decodeCustomError(error: unknown): string | null {
  const named = findErrorName(error)
  if (named) return named

  const data = findRevertData(error)
  if (!data) return null

  try {
    const decoded = decodeErrorResult({ abi: escrowAbi, data })
    return customErrorMessages[decoded.errorName] ?? null
  } catch {
    return null
  }
}

export function describeWalletError(error: unknown): string {
  if (!(error instanceof Error)) return 'Something went wrong. Try again.'

  const message = error.message

  if (/wrong network|chain mismatch|unsupported chain|chain id/i.test(message)) {
    return 'You are on the wrong network. Switch networks and try again.'
  }
  if (/user rejected|user denied|rejected the request|action rejected/i.test(message)) {
    return 'You declined the request in your wallet.'
  }
  if (/already connected/i.test(message)) {
    return 'That wallet is already connected.'
  }
  if (/no provider|not detected|not found/i.test(message)) {
    return 'Wallet not available. Try another one.'
  }
  if (/insufficient funds|not enough.*gas|intrinsic transaction cost/i.test(message)) {
    return 'Not enough ETH to pay for this transaction.'
  }
  if (/rpc|network|request failed|timeout|failed to fetch/i.test(message)) {
    return 'The network did not respond. Try again.'
  }
  if (/revert/i.test(message)) {
    return 'The transaction would revert. The vault is unchanged.'
  }

  return message.length > 180 ? `${message.slice(0, 177)}…` : message
}

export function describeContractError(error: unknown): string {
  return decodeCustomError(error) ?? describeWalletError(error)
}
