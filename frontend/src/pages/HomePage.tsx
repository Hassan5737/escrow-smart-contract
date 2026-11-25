import { useEffect, useMemo, useState } from 'react'
import { getAddress, isAddress, type Address } from 'viem'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ActionPanel } from '../components/ActionPanel'
import { AddressField } from '../components/AddressField'
import { EscrowSummary } from '../components/EscrowSummary'
import { IconButton } from '../components/IconButton'
import { RecentList } from '../components/RecentList'
import { StatusLine } from '../components/StatusLine'
import { VaultGlyph } from '../components/VaultGlyph'
import { CheckIcon, CopyIcon } from '../components/icons'
import { chainLabel } from '../lib/chains'
import { targetChain } from '../config/wagmi'
import { escrowContractAddress } from '../contracts/escrow'
import { listActions } from '../lib/actions'
import { useCopy } from '../hooks/useCopy'
import { useEscrow } from '../hooks/useEscrow'
import { useEscrowStatus } from '../hooks/useEscrowStatus'
import { useRecent } from '../hooks/useRecent'
import { useRole } from '../hooks/useRole'
import { internalTxUrl } from '../lib/explorer'
import { isSettled, needsInternalTxLink } from '../lib/status'

export function HomePage() {
  const { address: routeParam } = useParams<{ address: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { recent, remember, clear } = useRecent()
  const { isConnected } = useAccount()
  const { copied, copy } = useCopy()

  const route = useMemo(() => {
    if (routeParam === undefined) return { address: escrowContractAddress, invalid: false }
    if (!isAddress(routeParam, { strict: false })) {
      return { address: escrowContractAddress, invalid: true }
    }
    return { address: getAddress(routeParam), invalid: false }
  }, [routeParam])

  const [address, setAddress] = useState<Address>(route.address)

  useEffect(() => {
    setAddress(route.address)
  }, [route.address])

  const escrow = useEscrow(address)
  const role = useRole(escrow.read)
  const status = useEscrowStatus(escrow.snapshot)

  const actions = useMemo(
    () => (escrow.snapshot ? listActions(escrow.snapshot, role.roles, isConnected) : []),
    [escrow.snapshot, role.roles, isConnected],
  )

  const explorerHref = useMemo(() => {
    if (!status || !needsInternalTxLink(status.kind)) return undefined
    return internalTxUrl(address, targetChain.id)
  }, [status, address])

  const shareUrl = `${window.location.origin}/escrow/${address}`
  const justCreated = (location.state as { created?: boolean } | null)?.created === true

  function selectAddress(next: Address) {
    setAddress(next)
    remember(next)
    navigate(`/escrow/${next}`)
  }

  const { read, snapshot } = escrow

  return (
    <section className="read-view">
      <div className="read-copy">
        <p className="eyebrow">Vault inspector</p>
        <h1 className="display display--small">Inspect the vault.</h1>
        <p className="lede">
          Enter an escrow address to read its state and act when your role allows.
        </p>
        <div className="read-actions hero-actions">
          <Link className="button button--brass button--small" to="/create">
            Create a vault
          </Link>
          <span className="read-note">Deploy a fresh escrow from your wallet.</span>
        </div>

        <AddressField address={address} onSubmit={selectAddress} />
        <RecentList items={recent} active={address} onSelect={selectAddress} onClear={clear} />

        {route.invalid ? (
          <div className="read-state" role="alert">
            <p className="read-state-title">Invalid escrow link</p>
            <p className="read-note">
              The address in this link is not a valid Ethereum address. Enter one above to continue.
            </p>
          </div>
        ) : !escrow.ready ? (
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
            {justCreated && (
              <p className="create-success" role="status">
                Escrow created and verified on chain.
              </p>
            )}
            <div className="share-row">
              <span className="detail-label">Share this vault</span>
              <span className="share-url mono" title={shareUrl}>
                {shareUrl}
              </span>
              <IconButton
                label={copied ? 'Link copied' : 'Copy shareable link'}
                onClick={() => void copy(shareUrl)}
                success={copied}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            </div>
            <EscrowSummary
              read={read}
              balance={escrow.balance}
              roleList={role.list}
              roles={role.roles}
              connected={isConnected}
              chainId={targetChain.id}
              blockNumber={escrow.blockNumber}
            />
            <ActionPanel
              address={address}
              actions={actions}
              onConfirmed={() => void escrow.refetch()}
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
              statusKind={status.kind}
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
