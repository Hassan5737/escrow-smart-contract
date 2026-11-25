import { getAddress, isAddress, parseEther, zeroAddress, type Address } from 'viem'

export interface CreateFields {
  buyer: string
  seller: string
  arbiter: string
  amount: string
}

export interface CreateValues {
  buyer: Address
  seller: Address
  arbiter: Address
  amount: bigint
}

export type CreateFieldErrors = Partial<Record<keyof CreateFields, string>>

export interface CreateValidation {
  values: CreateValues | undefined
  errors: CreateFieldErrors
  warnings: string[]
}

function sameAddress(left: Address, right: Address): boolean {
  return left.toLowerCase() === right.toLowerCase()
}

function readAddress(
  raw: string,
  key: 'buyer' | 'seller' | 'arbiter',
  errors: CreateFieldErrors,
): Address | undefined {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    errors[key] = `Enter the ${key} address.`
    return undefined
  }
  if (!isAddress(trimmed, { strict: true })) {
    errors[key] = `Enter a valid checksummed ${key} address.`
    return undefined
  }

  const address = getAddress(trimmed)
  if (address !== trimmed) {
    errors[key] = `Use the checksummed ${key} address: ${address}`
    return undefined
  }
  if (address === zeroAddress) {
    errors[key] = `The ${key} address cannot be zero.`
    return undefined
  }
  return address
}

function readAmount(raw: string, errors: CreateFieldErrors): bigint | undefined {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    errors.amount = 'Enter the deposit amount in ETH.'
    return undefined
  }
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    errors.amount = 'Use a plain amount, like 0.01.'
    return undefined
  }

  try {
    const amount = parseEther(trimmed)
    if (amount === 0n) {
      errors.amount = 'The deposit must be greater than zero.'
      return undefined
    }
    return amount
  } catch {
    errors.amount = 'That amount is too small or has too many decimals.'
    return undefined
  }
}

function collectWarnings(
  buyer: Address | undefined,
  seller: Address | undefined,
  arbiter: Address | undefined,
  deployer: Address | undefined,
): string[] {
  if (!buyer || !seller || !arbiter) return []

  const warnings: string[] = []
  const pairs: ReadonlyArray<[string, Address, Address]> = [
    ['Buyer and seller', buyer, seller],
    ['Buyer and arbiter', buyer, arbiter],
    ['Seller and arbiter', seller, arbiter],
  ]

  for (const [label, left, right] of pairs) {
    if (sameAddress(left, right)) {
      warnings.push(`${label} share the same address. One wallet will hold both roles.`)
    }
  }

  if (sameAddress(buyer, seller) && sameAddress(buyer, arbiter)) {
    warnings.push(
      'All three roles are the same address. This removes the separation the vault is designed around.',
    )
  }

  if (deployer) {
    const overlaps: string[] = []
    if (sameAddress(buyer, deployer)) overlaps.push('buyer')
    if (sameAddress(seller, deployer)) overlaps.push('seller')
    if (sameAddress(arbiter, deployer)) overlaps.push('arbiter')
    if (overlaps.length > 0) {
      warnings.push(
        `Your connected deployer is also the ${overlaps.join(' and ')}. You will fund this vault and hold that role.`,
      )
    }
  }

  return warnings
}

export function validateCreateFields(
  fields: CreateFields,
  deployer: Address | undefined,
): CreateValidation {
  const errors: CreateFieldErrors = {}
  const buyer = readAddress(fields.buyer, 'buyer', errors)
  const seller = readAddress(fields.seller, 'seller', errors)
  const arbiter = readAddress(fields.arbiter, 'arbiter', errors)
  const amount = readAmount(fields.amount, errors)
  const warnings = collectWarnings(buyer, seller, arbiter, deployer)

  const values =
    buyer && seller && arbiter && amount !== undefined
      ? { buyer, seller, arbiter, amount }
      : undefined

  return { values, errors, warnings }
}
