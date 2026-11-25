import type { Hash } from 'viem'
import { targetChain } from '../config/wagmi'
import { chainLabel } from '../lib/chains'
import { txUrl } from '../lib/explorer'
import { truncateHash } from '../lib/format'
import type { TxPhase } from '../hooks/useEscrowWrite'

interface TransactionStatusProps {
  phase: TxPhase
  hash: Hash | undefined
  error: string | null
  actionLabel: string
  onRetry: () => void
  onDismiss: () => void
}

const phaseCopy: Record<TxPhase, { title: string; detail: string }> = {
  idle: { title: '', detail: '' },
  simulating: {
    title: 'Simulating transaction',
    detail: 'Checking that this action will succeed before asking your wallet.',
  },
  waitingWallet: {
    title: 'Waiting for wallet',
    detail: 'Approve the request in your wallet. Nothing is sent until you confirm there.',
  },
  pending: {
    title: 'Transaction pending',
    detail: 'The transaction has been sent and is waiting for confirmation.',
  },
  confirmed: {
    title: 'Confirmed',
    detail: 'The vault state has been refreshed.',
  },
  failed: {
    title: 'Transaction failed',
    detail: 'The vault is unchanged.',
  },
}

export function TransactionStatus({
  phase,
  hash,
  error,
  actionLabel,
  onRetry,
  onDismiss,
}: TransactionStatusProps) {
  const copy = phaseCopy[phase]
  const href = hash ? txUrl(hash, targetChain.id) : undefined

  return (
    <div
      className={`tx-status tx-status--${phase}`}
      role={phase === 'failed' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <p className="detail-label">{actionLabel}</p>
      <p className="tx-title">{copy.title}</p>
      <p className="tx-detail">{phase === 'failed' && error ? error : copy.detail}</p>

      {hash && (
        <div className="tx-hash">
          <span className="detail-label">Transaction</span>
          <span className="mono" title={hash}>
            {truncateHash(hash)}
          </span>
          {href ? (
            <a className="status-link" href={href} target="_blank" rel="noreferrer">
              View transaction <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="tx-note">
              No explorer on {chainLabel(targetChain.id)}. The transaction was submitted locally.
            </span>
          )}
        </div>
      )}

      {(phase === 'confirmed' || phase === 'failed') && (
        <div className="tx-actions">
          {phase === 'failed' && (
            <button type="button" className="button button--small" onClick={onRetry}>
              Try again
            </button>
          )}
          <button type="button" className="button button--small" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
