export type Role = 'buyer' | 'seller' | 'arbiter'

export interface RoleSet {
  buyer: boolean
  seller: boolean
  arbiter: boolean
}

export type EscrowStatusKind =
  | 'awaiting'
  | 'buyerApproved'
  | 'sellerApproved'
  | 'disputed'
  | 'releasedToSeller'
  | 'resolvedByArbiter'
  | 'settledUnknown'

export type EscrowAction =
  | 'approveBuyer'
  | 'approveSeller'
  | 'raiseDispute'
  | 'paySeller'
  | 'refundBuyer'

export interface ActionState {
  kind: EscrowAction
  label: string
  enabled: boolean
  reason: string | null
}

export interface EscrowSnapshot {
  amount: bigint
  balance: bigint
  buyerApproved: boolean
  sellerApproved: boolean
  isDisputeRaised: boolean
}

export interface EscrowStatus {
  kind: EscrowStatusKind
  title: string
  detail: string
}
