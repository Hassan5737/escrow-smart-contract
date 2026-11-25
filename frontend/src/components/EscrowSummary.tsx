import type { Address } from 'viem'
import type { EscrowRead } from '../hooks/useEscrow'
import { formatEth, truncateAddress } from '../lib/format'
import type { Role, RoleSet } from '../types'

interface EscrowSummaryProps {
  read: EscrowRead
  balance: bigint | undefined
  roleList: readonly Role[]
  roles: RoleSet
  connected: boolean
}

const roleLabels: Record<Role, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  arbiter: 'Arbiter',
}

export function EscrowSummary({
  read,
  balance,
  roleList,
  roles,
  connected,
}: EscrowSummaryProps) {
  const amount = read.amount ?? 0n
  const held = balance ?? 0n

  const roleCopy = !connected
    ? 'Wallet not connected'
    : roleList.length === 0
      ? 'Visitor'
      : roleList.map((role) => roleLabels[role]).join(' · ')

  const roleDetail = !connected
    ? 'Connect a wallet to see whether you hold a role.'
    : roleList.length === 0
      ? 'This wallet is not one of the three role holders.'
      : 'This wallet holds a role in this vault.'

  const participants: ReadonlyArray<{ role: Role; address: Address | undefined }> = [
    { role: 'buyer', address: read.buyer },
    { role: 'seller', address: read.seller },
    { role: 'arbiter', address: read.arbiter },
  ]

  return (
    <div className="read-details">
      <div className="role-banner">
        <p className="detail-label">Your position</p>
        <p className="role-title">{roleCopy}</p>
        <p className="role-detail">{roleDetail}</p>
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
          <p className="detail-label">Contract checks</p>
          <p className="detail-value">Balance · approvals · flag</p>
        </div>
      </div>

      <div className="participants">
        <p className="detail-label">Role holders</p>
        {participants.map(({ role, address }) => (
          <div className="participant-row" key={role}>
            <span className="participant-role">{roleLabels[role]}</span>
            <span className="detail-value--mono">
              {address ? truncateAddress(address, 8, 6) : 'unknown'}
            </span>
            {connected && roles[role] && <span className="you-tag">you</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
