import { useMemo, useState } from 'react'
import type { Address } from 'viem'
import { useAccount } from 'wagmi'
import { AddressField } from '../components/AddressField'
import { EscrowSummary } from '../components/EscrowSummary'
import { RecentList } from '../components/RecentList'
import { StatusLine } from '../components/StatusLine'
import { VaultGlyph } from '../components/VaultGlyph'
import { chainLabel } from '../lib/chains'
import { targetChain } from '../config/wagmi'
import { escrowContractAddress } from '../contracts/escrow'
import { useEscrow } from '../hooks/useEscrow'
import { useEscrowStatus } from '../hooks/useEscrowStatus'
import { useRecent } from '../hooks/useRecent'
import { useRole } from '../hooks/useRole'
import { internalTxUrl } from '../lib/explorer'
import { isSettled, needsInternalTxLink } from '../lib/status'

export function HomePage() {
  const [address, setAddress] = useState<Address>(escrowContractAddress)
  const { recent, remember, clear } = useRecent()
  const { isConnected } = useAccount()

  const escrow = useEscrow(address)
  const role = useRole(escrow.read)
  const status = useEscrowStatus(escrow.snapshot)

  const explorerHref = useMemo(() => {
    if (!status || !needsInternalTxLink(status.kind)) return undefined
    return internalTxUrl(address, targetChain.id)
  }, [status, address])

  function selectAddress(next: Address) {
    setAddress(next)
    remember(next)
  }

  const { read, snapshot } = escrow

  return (
    <section className="read-view">
      <div className="read-copy">
        <p className="eyebrow">Read-only view</p>
        <h1 className="display display--small">Inspect the vault.</h1>
        <p className="lede">
          Enter an escrow address to read its state. This phase derives meaning from contract
          data and sends no transactions.
        </p>

        <AddressField address={address} onSubmit={selectAddress} />
        <RecentList items={recent} active={address} onSelect={selectAddress} onClear={clear} />

        {!escrow.ready ? (
          <div className="read-state">
            <p className="read-state-title">Public RPC unavailable</p>
            <p className="read-note">
              No client is available for {chainLabel(targetChain.id)}. Check the dev server and
              retry.
            </p>
          </div>
        ) : escrow.isError ? (
          <div className="read-state" role="alert">
            <p className="read-state-title">Could not read this address</p>
            <p className="read-note">{escrow.errorMessage ?? 'The RPC request failed.'}</p>
            <div className="read-actions">
              <button
                type="button"
                className="button button--small"
                onClick={() => void escrow.refetch()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : escrow.checking ? (
          <div className="read-state" aria-live="polite">
            <p className="read-state-title">Checking address…</p>
            <p className="read-note">Looking for deployed bytecode on {chainLabel(targetChain.id)}.</p>
          </div>
        ) : !escrow.exists ? (
          <div className="read-state">
            <p className="read-state-title">No contract at this address</p>
            <p className="read-note">
              The address may be an account, or it may not exist on {chainLabel(targetChain.id)}.
            </p>
          </div>
        ) : !snapshot || !status || !read ? (
          <div className="read-state" aria-live="polite">
            <p className="read-state-title">Reading contract state…</p>
            <p className="read-note">Amount, balance, approvals and dispute flag are loading.</p>
          </div>
        ) : (
          <div className="read-result">
            <EscrowSummary
              read={read}
              balance={escrow.balance}
              roleList={role.list}
              roles={role.roles}
              connected={isConnected}
            />
            <div className="read-actions">
              <button
                type="button"
                className="button button--small"
                onClick={() => void escrow.refetch()}
              >
                Refresh state
              </button>
              <span className="read-note">Updates on every new block.</span>
            </div>
            <p className="read-note read-note--quiet">
              Approval, dispute and resolution controls belong to a later phase.
            </p>
          </div>
        )}
      </div>

      <div className="read-visual">
        {snapshot && status ? (
          <>
            <VaultGlyph
              amount={snapshot.amount}
              buyerApproved={snapshot.buyerApproved}
              sellerApproved={snapshot.sellerApproved}
              disputed={snapshot.isDisputeRaised}
              settled={isSettled(snapshot)}
            />
            <StatusLine status={status} explorerHref={explorerHref} />
          </>
        ) : (
          <div className="read-placeholder" aria-hidden="true">
            <span className="read-placeholder-ring" />
            <p>Waiting for state</p>
          </div>
        )}
      </div>
    </section>
  )
}
