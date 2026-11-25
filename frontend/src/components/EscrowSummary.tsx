import type { Address } from 'viem'
import type { EscrowRead } from '../hooks/useEscrow'
import { chainLabel } from '../lib/chains'
import { formatEth } from '../lib/format'
import { RoleHolderRow } from './RoleHolderRow'
import type { Role, RoleSet } from '../types'

interface EscrowSummaryProps {
  read: EscrowRead
  balance: bigint | undefined
  roleList: readonly Role[]
  roles: RoleSet
  connected: boolean
  chainId: number
  blockNumber: bigint | undefined
}

const roleLabels: Record<Role, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  arbiter: 'Arbiter',
}

const roleCapabilities: Record<Role, string> = {
  buyer: 'Approve the deal or raise a dispute.',
  seller: 'Approve the deal or raise a dispute.',
  arbiter: 'Resolve a dispute once one is raised.',
}

export function EscrowSummary({
  read,
  balance,
  roleList,
  roles,
  connected,
  chainId,
  blockNumber,
}: EscrowSummaryProps) {
  const amount = read.amount ?? 0n
  const held = balance ?? 0n

  const roleCopy = roleList.length === 0 ? 'Visitor' : roleList.map((role) => roleLabels[role]).join(' · ')
  const capabilities = [...new Set(roleList.map((role) => roleCapabilities[role]))]

  const roleDetail =
    roleList.length === 0
      ? 'Read only.'
      : capabilities.join(' ')

  const participants: ReadonlyArray<{ role: Role; label: string; address: Address | undefined }> = [
    { role: 'buyer', label: 'Buyer', address: read.buyer },
    { role: 'seller', label: 'Seller', address: read.seller },
    { role: 'arbiter', label: 'Arbiter', address: read.arbiter },
  ]

  return (
    <div className="read-details">
      <div className="role-banner">
        <p className="detail-label">Your position</p>
        <p className="role-title">{roleCopy}</p>
        <p className="role-detail">{roleDetail}</p>
        {!connected && (
          <p className="role-detail">Connect a wallet to see whether you hold a role.</p>
        )}
      </div>

      <div className="read-grid">
        <div>
          <p className="detail-label">Original deposit</p>
          <p className="detail-value">{formatEth(amount)} ETH</p>
        </div>
        <div>
          <p className="detail-label">Vault balance</p>
          <p className="detail-value">{formatEth(held)} ETH</p>
        </div>
        <div>
          <p className="detail-label">Buyer approval</p>
          <p className="detail-value">{read.buyerApproved === true ? 'Recorded' : 'Not yet'}</p>
        </div>
        <div>
          <p className="detail-label">Seller approval</p>
          <p className="detail-value">{read.sellerApproved === true ? 'Recorded' : 'Not yet'}</p>
        </div>
        <div>
          <p className="detail-label">Dispute flag</p>
          <p className="detail-value">{read.isDisputeRaised === true ? 'Raised' : 'Not raised'}</p>
        </div>
        <div>
          <p className="detail-label">Network</p>
          <p className="detail-value">{chainLabel(chainId)}</p>
        </div>
        <div>
          <p className="detail-label">Latest block</p>
          <p className="detail-value mono">{blockNumber?.toString() ?? '—'}</p>
        </div>
      </div>

      <div className="participants">
        <p className="detail-label">Role holders</p>
        {participants.map(({ role, label, address }) => (
          <RoleHolderRow
            key={role}
            label={label}
            address={address}
            chainId={chainId}
            isYou={connected && roles[role]}
          />
        ))}
      </div>
    </div>
  )
}
