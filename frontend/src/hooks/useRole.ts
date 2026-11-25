import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'
import type { Role, RoleSet } from '../types'
import type { EscrowRead } from './useEscrow'

const roleOrder: readonly Role[] = ['buyer', 'seller', 'arbiter']

export function useRole(escrow: EscrowRead | undefined) {
  const { address } = useAccount()

  return useMemo(() => {
    const roles: RoleSet = { buyer: false, seller: false, arbiter: false }

    if (address && escrow) {
      if (escrow.buyer && isAddressEqual(address, escrow.buyer)) roles.buyer = true
      if (escrow.seller && isAddressEqual(address, escrow.seller)) roles.seller = true
      if (escrow.arbiter && isAddressEqual(address, escrow.arbiter)) roles.arbiter = true
    }

    const list = roleOrder.filter((role) => roles[role])
    return { roles, list, isVisitor: list.length === 0 }
  }, [address, escrow])
}
