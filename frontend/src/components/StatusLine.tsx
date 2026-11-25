import { needsInternalTxLink } from '../lib/status'
import type { EscrowStatus } from '../types'

interface StatusLineProps {
  status: EscrowStatus
  explorerHref?: string
  preview?: boolean
}

export function StatusLine({ status, explorerHref, preview = false }: StatusLineProps) {
  const showLink = needsInternalTxLink(status.kind)

  return (
    <div className={`status-line status-line--${status.kind}`}>
      <span className="status-mark" aria-hidden="true" />
      <div className="status-body">
        <p className="status-title">{status.title}</p>
        <p className="status-detail">{status.detail}</p>
        {showLink &&
          (explorerHref && !preview ? (
            <a
              className="status-link"
              href={explorerHref}
              target="_blank"
              rel="noreferrer"
            >
              View internal transactions
              <span aria-hidden="true"> ↗</span>
            </a>
          ) : (
            <span className="status-link status-link--preview" aria-disabled="true">
              View internal transactions · preview
            </span>
          ))}
      </div>
    </div>
  )
}
