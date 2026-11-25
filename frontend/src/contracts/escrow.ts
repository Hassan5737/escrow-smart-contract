import type { Address } from 'viem'
import { env } from '../config/env'

export const escrowContractAddress: Address = env.escrowAddress
export const escrowContractName = 'Escrow' as const
