import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { addressUrl } from '../lib/explorer'
import { truncateAddress } from '../lib/format'

type CopyState = 'idle' | 'copied' | 'failed'

interface RoleHolderRowProps {
  label: string
  address: Address | undefined
  chainId: number
  isYou: boolean
}

export function RoleHolderRow({ label, address, chainId, isYou }: RoleHolderRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 1400)
    return () => window.clearTimeout(timer)
  }, [copyState])

  if (!address) {
    return (
      <div className="participant-row participant-row--holder">
        <span className="participant-role">{label}</span>
        <span className="detail-value--mono">unknown</span>
      </div>
    )
  }

  const href = addressUrl(address, chainId)

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address as Address)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className="participant-row participant-row--holder">
      <span className="participant-role">{label}</span>
      <span className="detail-value--mono" title={address}>
        {expanded ? address : truncateAddress(address, 8, 6)}
      </span>
      {isYou && <span className="you-tag">you</span>}
      <div className="participant-actions">
        <button
          type="button"
          className="button button--small"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
        <button type="button" className="button button--small" onClick={() => void copyAddress()}>
          {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy'}
        </button>
        {href ? (
          <a className="status-link" href={href} target="_blank" rel="noreferrer">
            Explorer <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="participant-note">No explorer on this network</span>
        )}
      </div>
    </div>
  )
}
