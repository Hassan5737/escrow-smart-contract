import { Link } from 'react-router-dom'
import { env } from '../config/env'
import { truncateAddress } from '../lib/format'
import { deriveStatus } from '../lib/status'
import { escrowContractAddress } from '../contracts/escrow'
import { StatusLine } from './StatusLine'
import { VaultGlyph } from './VaultGlyph'

const status = deriveStatus({
  amount: 10n ** 18n,
  balance: 10n ** 18n,
  buyerApproved: false,
  sellerApproved: false,
  isDisputeRaised: false,
})

export function HomePlaceholder() {
  return (
    <section className="home">
      <div className="home-copy">
        <p className="eyebrow">Phase 01 / Shell</p>
        <h1 className="display">
          Three keys.
          <br />
          One quiet vault.
        </h1>
        <p className="lede">
          The interface is being assembled. Wallet discovery, network guard and the vault
          language are in place. Contract reading arrives next.
        </p>
        <StatusLine status={status} />
        <dl className="meta-list">
          <div>
            <dt>Contract</dt>
            <dd className="mono">{truncateAddress(escrowContractAddress, 8, 6)}</dd>
          </div>
          <div>
            <dt>Local node</dt>
            <dd>{env.enableLocal ? 'Anvil enabled' : 'Sepolia default'}</dd>
          </div>
        </dl>
        {env.enableLab && (
          <Link className="text-link" to="/lab">
            Open design lab
          </Link>
        )}
      </div>

      <div className="home-visual">
        <VaultGlyph
          buyerApproved={false}
          sellerApproved={false}
          disputed={false}
          settled={false}
        />
      </div>
    </section>
  )
}
