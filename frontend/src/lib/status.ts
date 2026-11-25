import type { EscrowSnapshot, EscrowStatus } from '../types'

export function isSettled(snapshot: EscrowSnapshot): boolean {
  return snapshot.amount > 0n && snapshot.balance === 0n
}

export function deriveStatus(snapshot: EscrowSnapshot): EscrowStatus {
  const settled = isSettled(snapshot)
  const bothApproved = snapshot.buyerApproved && snapshot.sellerApproved

  if (settled && !bothApproved) {
    return {
      kind: 'resolvedByArbiter',
      title: 'Resolved by the arbiter',
      detail: 'The deposit has left the vault. The contract does not record who received it.',
    }
  }

  if (settled && bothApproved && !snapshot.isDisputeRaised) {
    return {
      kind: 'releasedToSeller',
      title: 'Released to the seller',
      detail: 'Both parties approved and the deposit was sent to the seller.',
    }
  }

  if (settled && bothApproved && snapshot.isDisputeRaised) {
    return {
      kind: 'settledUnknown',
      title: 'Settled',
      detail: 'A dispute flag exists. The payout route cannot be read from contract state.',
    }
  }

  if (snapshot.isDisputeRaised) {
    return {
      kind: 'disputed',
      title: 'Disputed',
      detail: 'Approvals can no longer release the deposit. The arbiter must decide.',
    }
  }

  if (snapshot.buyerApproved) {
    return {
      kind: 'buyerApproved',
      title: 'Buyer approved',
      detail: 'Waiting for the seller to approve.',
    }
  }

  if (snapshot.sellerApproved) {
    return {
      kind: 'sellerApproved',
      title: 'Seller approved',
      detail: 'Waiting for the buyer to approve.',
    }
  }

  return {
    kind: 'awaiting',
    title: 'Awaiting both approvals',
    detail: 'The deposit is locked until both parties approve.',
  }
}

export function needsInternalTxLink(kind: EscrowStatus['kind']): boolean {
  return kind === 'resolvedByArbiter' || kind === 'settledUnknown'
}
