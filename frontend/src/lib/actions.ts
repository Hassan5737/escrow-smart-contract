import { isSettled } from './status'
import type { ActionState, EscrowAction, EscrowSnapshot, RoleSet } from '../types'

export const actionCopy: Record<EscrowAction, { title: string; detail: string }> = {
  approveBuyer: {
    title: 'Confirm buyer approval',
    detail:
      'This records your approval. If the seller has already approved, the deposit will be released to the seller immediately.',
  },
  approveSeller: {
    title: 'Confirm seller approval',
    detail:
      'This records your approval. If the buyer has already approved, the deposit will be released to the seller immediately.',
  },
  raiseDispute: {
    title: 'Confirm dispute',
    detail:
      'This freezes approvals. Only the arbiter can decide where the deposit goes after this point.',
  },
  paySeller: {
    title: 'Confirm payout to the seller',
    detail: 'The arbiter sends the full deposit to the seller. This cannot be undone.',
  },
  refundBuyer: {
    title: 'Confirm refund to the buyer',
    detail: 'The arbiter sends the full deposit back to the buyer. This cannot be undone.',
  },
}

function approveReason(approved: boolean, settled: boolean, disputed: boolean): string | null {
  if (settled) return 'The vault has already settled.'
  if (disputed) return 'A dispute is raised. Approvals can no longer release the deposit.'
  if (approved) return 'Your approval is already recorded.'
  return null
}

function disputeReason(settled: boolean, disputed: boolean): string | null {
  if (settled) return 'The vault has already settled.'
  if (disputed) return 'A dispute is already raised.'
  return null
}

function resolveReason(settled: boolean, disputed: boolean): string | null {
  if (settled) return 'The vault has already settled.'
  if (!disputed) return 'No dispute has been raised yet.'
  return null
}

export function listActions(
  snapshot: EscrowSnapshot,
  roles: RoleSet,
  connected: boolean,
): ActionState[] {
  if (!connected) return []

  const settled = isSettled(snapshot)
  const disputed = snapshot.isDisputeRaised
  const actions: ActionState[] = []

  if (roles.buyer) {
    const reason = approveReason(snapshot.buyerApproved, settled, disputed)
    actions.push({ kind: 'approveBuyer', label: 'Approve as buyer', enabled: reason === null, reason })
  }

  if (roles.seller) {
    const reason = approveReason(snapshot.sellerApproved, settled, disputed)
    actions.push({ kind: 'approveSeller', label: 'Approve as seller', enabled: reason === null, reason })
  }

  if (roles.buyer || roles.seller) {
    const reason = disputeReason(settled, disputed)
    actions.push({ kind: 'raiseDispute', label: 'Raise dispute', enabled: reason === null, reason })
  }

  if (roles.arbiter) {
    const reason = resolveReason(settled, disputed)
    actions.push({ kind: 'paySeller', label: 'Pay seller', enabled: reason === null, reason })
    actions.push({ kind: 'refundBuyer', label: 'Refund buyer', enabled: reason === null, reason })
  }

  return actions
}
