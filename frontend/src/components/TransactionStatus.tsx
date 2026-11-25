import type { Hash } from 'viem'
import { targetChain } from '../config/wagmi'
import { useCopy } from '../hooks/useCopy'
import type { TxPhase } from '../hooks/useEscrowWrite'
import { txUrl } from '../lib/explorer'
import { truncateHash } from '../lib/format'
import { IconButton } from './IconButton'
import { CheckIcon, CopyIcon, ExternalIcon } from './icons'

interface TransactionStatusProps {
  phase: TxPhase
  hash: Hash | undefined
  error: string | null
  actionLabel: string
  chainId?: number
  confirmedDetail?: string
  hashLabel?: string
  onRetry?: () => void
  onDismiss?: () => void
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
    detail: 'The transaction has been confirmed.',
  },
  failed: {
    title: 'Transaction failed',
    detail: 'The transaction did not complete.',
  },
}

export function TransactionStatus({
  phase,
  hash,
  error,
  actionLabel,
  chainId = targetChain.id,
  confirmedDetail,
  hashLabel = 'Transaction',
  onRetry,
  onDismiss,
}: TransactionStatusProps) {
  const { copied, failed, copy: copyHash } = useCopy()
  const phaseText = phaseCopy[phase]
  const href = hash ? txUrl(hash, chainId) : undefined
  const detail = phase === 'confirmed' && confirmedDetail ? confirmedDetail : phaseText.detail
  const hashCopyLabel = copied ? 'Hash copied' : failed ? 'Copy failed' : 'Copy transaction hash'

  return (
    <div
      className={`tx-status tx-status--${phase}`}
      role={phase === 'failed' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <p className="detail-label">{actionLabel}</p>
      <p className="tx-title">{phaseText.title}</p>
      <p className="tx-detail">{phase === 'failed' && error ? error : detail}</p>

      {hash && (
        <div className="tx-hash">
          <span className="detail-label">{hashLabel}</span>
          <span className="tx-hash-value mono" title={hash}>
            {truncateHash(hash)}
          </span>
          <IconButton label={hashCopyLabel} onClick={() => void copyHash(hash)} success={copied}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </IconButton>
          {href && (
            <a className="status-link" href={href} target="_blank" rel="noreferrer">
              View transaction <ExternalIcon />
            </a>
          )}
        </div>
      )}

      {(onRetry || onDismiss) && (phase === 'confirmed' || phase === 'failed') && (
        <div className="tx-actions">
          {phase === 'failed' && onRetry && (
            <button type="button" className="button button--small" onClick={onRetry}>
              Try again
            </button>
          )}
          {onDismiss && (
            <button type="button" className="button button--small" onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  )
}
