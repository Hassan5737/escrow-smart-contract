import { useEffect } from 'react'
import { chainLabel } from '../lib/chains'
import { actionCopy } from '../lib/actions'
import { sepolia } from 'wagmi/chains'
import type { ActionState } from '../types'

interface ConfirmDialogProps {
  action: ActionState
  chainId: number
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ action, chainId, onCancel, onConfirm }: ConfirmDialogProps) {
  const copy = actionCopy[action.kind]

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p className="detail-label">Confirm action</p>
            <h2 className="confirm-title" id="confirm-title">
              {copy.title}
            </h2>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onCancel}>
            ×
          </button>
        </div>

        <p className="confirm-detail">{copy.detail}</p>
        <p className="confirm-note">
          The transaction is simulated first. Your wallet is asked to sign only if the simulation
          succeeds.
        </p>
        {chainId === sepolia.id && (
          <p className="confirm-warning" role="note">
            You are acting on Sepolia. This transaction cannot be undone.
          </p>
        )}

        <div className="confirm-actions">
          <button type="button" className="button button--small" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="button button--brass button--small" onClick={onConfirm}>
            Confirm &amp; continue
          </button>
        </div>
        <p className="confirm-foot">Network: {chainLabel(chainId)}</p>
      </div>
    </div>
  )
}
