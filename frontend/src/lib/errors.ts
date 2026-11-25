export function describeWalletError(error: unknown): string {
  if (!(error instanceof Error)) return 'Something went wrong. Try again.'

  const message = error.message

  if (/user rejected|user denied|rejected the request|action rejected/i.test(message)) {
    return 'You declined the request in your wallet.'
  }
  if (/already connected/i.test(message)) {
    return 'That wallet is already connected.'
  }
  if (/no provider|not detected|not found|unsupported chain/i.test(message)) {
    return 'Wallet not available. Try another one.'
  }
  if (/insufficient funds/i.test(message)) {
    return 'Not enough ETH for this transaction.'
  }
  if (/network|rpc|request failed|timeout/i.test(message)) {
    return 'The network did not respond. Try again.'
  }

  return message.length > 180 ? `${message.slice(0, 177)}…` : message
}
