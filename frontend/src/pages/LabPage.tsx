import { motion, useReducedMotion } from 'framer-motion'
import { StatusLine } from '../components/StatusLine'
import { VaultGlyph } from '../components/VaultGlyph'
import { deriveStatus } from '../lib/status'
import type { EscrowSnapshot } from '../types'

interface Scenario {
  id: string
  label: string
  snapshot: EscrowSnapshot
}

function scenario(
  id: string,
  label: string,
  amount: bigint,
  balance: bigint,
  buyerApproved: boolean,
  sellerApproved: boolean,
  isDisputeRaised: boolean,
): Scenario {
  return {
    id,
    label,
    snapshot: { amount, balance, buyerApproved, sellerApproved, isDisputeRaised },
  }
}

const scenarios: Scenario[] = [
  scenario('awaiting', '01 — Awaiting both approvals', 10n ** 16n, 10n ** 16n, false, false, false),
  scenario('buyer', '02 — Buyer approved', 10n ** 18n, 10n ** 18n, true, false, false),
  scenario('seller', '03 — Seller approved', 5n * 10n ** 17n, 5n * 10n ** 17n, false, true, false),
  scenario('disputed', '04 — Disputed, awaiting arbiter', 2n * 10n ** 18n, 2n * 10n ** 18n, true, false, true),
  scenario('released', '05 — Released to the seller', 10n ** 16n, 0n, true, true, false),
  scenario('arbiter', '06 — Resolved by the arbiter', 3n * 10n ** 17n, 0n, true, false, true),
  scenario('settled', '07 — Settled, route unknown', 4n * 10n ** 18n, 0n, true, true, true),
]

export function LabPage() {
  const reducedMotion = useReducedMotion()

  return (
    <section className="lab">
      <header className="lab-head">
        <p className="eyebrow">Design preview</p>
        <h1 className="display display--small">All states, one vault.</h1>
        <p className="lede">
          Static props only. This page is not connected to a chain and is hidden unless{' '}
          <code className="mono">VITE_ENABLE_LAB=true</code>.
        </p>
      </header>

      <div className="lab-list">
        {scenarios.map((scenarioItem, index) => {
          const status = deriveStatus(scenarioItem.snapshot)
          const settled =
            scenarioItem.snapshot.amount > 0n && scenarioItem.snapshot.balance === 0n

          return (
            <motion.article
              className={`lab-row lab-row--${status.kind}`}
              key={scenarioItem.id}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.6,
                delay: reducedMotion ? 0 : index * 0.06,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            >
              <div className="lab-copy">
                <p className="lab-label">{scenarioItem.label}</p>
                <StatusLine status={status} preview />
              </div>
              <div className="lab-visual">
                <VaultGlyph
                  amount={scenarioItem.snapshot.amount}
                  buyerApproved={scenarioItem.snapshot.buyerApproved}
                  sellerApproved={scenarioItem.snapshot.sellerApproved}
                  disputed={scenarioItem.snapshot.isDisputeRaised}
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
