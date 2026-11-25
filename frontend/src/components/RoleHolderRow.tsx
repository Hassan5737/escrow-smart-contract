import { useState } from 'react'
import type { Address } from 'viem'
import { addressUrl } from '../lib/explorer'
import { truncateAddress } from '../lib/format'
import { useCopy } from '../hooks/useCopy'
import { IconButton } from './IconButton'
import { CheckIcon, CollapseIcon, CopyIcon, ExpandIcon } from './icons'

interface RoleHolderRowProps {
  label: string
  address: Address | undefined
  chainId: number
  isYou: boolean
}

export function RoleHolderRow({ label, address, chainId, isYou }: RoleHolderRowProps) {
  const [expanded, setExpanded] = useState(false)
  const { copied, failed, copy } = useCopy()

  if (!address) {
    return (
      <div className="participant-row participant-row--holder">
        <span className="participant-role">{label}</span>
        <span className="detail-value--mono">unknown</span>
      </div>
    )
  }

  const href = addressUrl(address, chainId)
  const display = expanded ? address : truncateAddress(address, 10, 8)
  const copyLabel = copied ? 'Address copied' : failed ? 'Copy failed' : 'Copy address'

  const addressNode = href ? (
    <a className="participant-address detail-value--mono" href={href} target="_blank" rel="noreferrer" title={address}>
      {display}
    </a>
  ) : (
    <span className="participant-address detail-value--mono" title={address}>
      {display}
    </span>
  )

  return (
    <div className="participant-row participant-row--holder">
      <span className="participant-role">{label}</span>
      {addressNode}
      {isYou && <span className="you-tag">you</span>}
      <div className="participant-actions">
        <IconButton label={copyLabel} onClick={() => void copy(address)} success={copied}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </IconButton>
        <IconButton
          label={expanded ? 'Collapse address' : 'Expand address'}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </div>
    </div>
  )
}
