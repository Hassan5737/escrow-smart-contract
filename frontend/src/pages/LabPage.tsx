import { motion, useReducedMotion } from 'framer-motion'
import { StatusLine } from '../components/StatusLine'
import { VaultGlyph } from '../components/VaultGlyph'
import { deriveStatus } from '../lib/status'
import type { EscrowSnapshot } from '../types'

const ONE = 10n ** 18n

interface Scenario {
  id: string
  label: string
  snapshot: EscrowSnapshot
}

const scenarios: Scenario[] = [
  {
    id: 'awaiting',
    label: '01 — Awaiting both approvals',
    snapshot: {
      amount: ONE,
      balance: ONE,
      buyerApproved: false,
      sellerApproved: false,
      isDisputeRaised: false,
    },
  },
  {
    id: 'buyer',
    label: '02 — Buyer approved',
    snapshot: {
      amount: ONE,
      balance: ONE,
      buyerApproved: true,
      sellerApproved: false,
      isDisputeRaised: false,
    },
  },
  {
    id: 'seller',
    label: '03 — Seller approved',
    snapshot: {
      amount: ONE,
      balance: ONE,
      buyerApproved: false,
      sellerApproved: true,
      isDisputeRaised: false,
    },
  },
  {
    id: 'disputed',
    label: '04 — Disputed, awaiting arbiter',
    snapshot: {
      amount: ONE,
      balance: ONE,
      buyerApproved: true,
      sellerApproved: false,
      isDisputeRaised: true,
    },
  },
  {
    id: 'released',
    label: '05 — Released to the seller',
    snapshot: {
      amount: ONE,
      balance: 0n,
      buyerApproved: true,
      sellerApproved: true,
      isDisputeRaised: false,
    },
  },
  {
    id: 'arbiter',
    label: '06 — Resolved by the arbiter',
    snapshot: {
      amount: ONE,
      balance: 0n,
      buyerApproved: true,
      sellerApproved: false,
      isDisputeRaised: true,
    },
  },
  {
    id: 'settled',
    label: '07 — Settled, route unknown',
    snapshot: {
      amount: ONE,
      balance: 0n,
      buyerApproved: true,
      sellerApproved: true,
      isDisputeRaised: true,
    },
  },
]

export function LabPage() {
  const reducedMotion = useReducedMotion()

  return (
    <section className="lab">
      <header className="lab-head">
        <p className="eyebrow">Design preview</p>
        <h1 className="display display--small">Five states, one vault.</h1>
        <p className="lede">
          Static props only. This page is not connected to a chain and is hidden unless{' '}
          <code className="mono">VITE_ENABLE_LAB=true</code>.
        </p>
      </header>

      <div className="lab-list">
        {scenarios.map((scenario, index) => {
          const status = deriveStatus(scenario.snapshot)
          const settled =
            scenario.snapshot.amount > 0n && scenario.snapshot.balance === 0n

          return (
            <motion.article
              className={`lab-row lab-row--${status.kind}`}
              key={scenario.id}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.6,
                delay: reducedMotion ? 0 : index * 0.06,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              <div className="lab-copy">
                <p className="lab-label">{scenario.label}</p>
                <StatusLine status={status} preview />
              </div>
              <div className="lab-visual">
                <VaultGlyph
                  buyerApproved={scenario.snapshot.buyerApproved}
                  sellerApproved={scenario.snapshot.sellerApproved}
                  disputed={scenario.snapshot.isDisputeRaised}
                  settled={settled}
                />
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
