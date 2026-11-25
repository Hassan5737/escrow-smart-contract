import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useSwitchChain } from 'wagmi'
import { TransactionStatus } from '../components/TransactionStatus'
import { targetChain } from '../config/wagmi'
import { useDeployEscrow } from '../hooks/useDeployEscrow'
import { useRecent } from '../hooks/useRecent'
import { chainLabel } from '../lib/chains'
import { validateCreateFields, type CreateFields } from '../lib/createValidation'
import { formatEth } from '../lib/format'

const emptyFields: CreateFields = { buyer: '', seller: '', arbiter: '', amount: '' }

export function CreatePage() {
  const { address: deployer, chainId, isConnected } = useAccount()
  const { switchChain, isPending: switching } = useSwitchChain()
  const { remember } = useRecent()
  const navigate = useNavigate()
  const deploy = useDeployEscrow()

  const [fields, setFields] = useState<CreateFields>(emptyFields)
  const [showErrors, setShowErrors] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  const validation = useMemo(
    () => validateCreateFields(fields, deployer),
    [deployer, fields],
  )
  const { values, errors, warnings } = validation

  const wrongNetwork = isConnected && chainId !== undefined && chainId !== targetChain.id
  const blockingReason = !isConnected
    ? 'Connect a wallet to deploy.'
    : wrongNetwork
      ? `Switch to ${chainLabel(targetChain.id)} before deploying.`
      : switching
        ? 'Switching networks.'
        : deploy.busy
          ? 'A transaction is already in progress.'
          : null

  useEffect(() => {
    const deployed = deploy.deployedAddress
    if (!deployed) return

    const timer = window.setTimeout(() => {
      remember(deployed)
      navigate(`/escrow/${deployed}`, { state: { created: true } })
    }, 900)
    return () => window.clearTimeout(timer)
  }, [deploy.deployedAddress, navigate, remember])

  function updateField(key: keyof CreateFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  function openReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setShowErrors(true)
    if (values) setReviewing(true)
  }

  function backToForm() {
    deploy.reset()
    setReviewing(false)
  }

  function beginDeployment() {
    if (!values || blockingReason) return
    void deploy.submit(values)
  }

  const field = (key: keyof CreateFields, label: string, placeholder: string) => (
    <div className="create-field">
      <label className="field-label" htmlFor={`create-${key}`}>
        {label}
      </label>
      <input
        id={`create-${key}`}
        className={`address-input mono${showErrors && errors[key] ? ' has-error' : ''}`}
        value={fields[key]}
        onChange={(event) => updateField(key, event.target.value)}
        spellCheck={false}
        autoComplete="off"
        inputMode={key === 'amount' ? 'decimal' : undefined}
        aria-invalid={showErrors && errors[key] ? true : undefined}
        aria-describedby={showErrors && errors[key] ? `create-${key}-error` : undefined}
        placeholder={placeholder}
      />
      {showErrors && errors[key] && (
        <p className="field-error" id={`create-${key}-error`} role="alert">
          {errors[key]}
        </p>
      )}
    </div>
  )

  return (
    <section className="create-page">
      <header className="create-head">
        <p className="eyebrow">New escrow</p>
        <h1 className="display display--small">Create a vault.</h1>
        <p className="lede">
          Set the three key holders and the deposit. The contract is deployed from this browser and
          verified before you are taken to it.
        </p>
      </header>

      <div className="create-grid">
        <div className="create-main">
          <div className="create-funding" role="note">
            <span className="detail-label">Who pays</span>
            <p>The deposit is paid by your connected wallet, not necessarily by the buyer.</p>
            <p className="create-funding-note">
              Your wallet is the deployer and also pays the deployment gas.
            </p>
          </div>

          {!reviewing ? (
            <form className="create-form" onSubmit={openReview} noValidate>
              {field('buyer', 'Buyer', '0x…')}
              {field('seller', 'Seller', '0x…')}
              {field('arbiter', 'Arbiter', '0x…')}
              {field('amount', 'Deposit (ETH)', '0.01')}

              {warnings.length > 0 && (
                <div className="create-warnings" role="note">
                  {warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}

              <div className="create-form-actions">
                <button type="submit" className="button button--brass button--small">
                  Review deployment
                </button>
              </div>
            </form>
          ) : values ? (
            <div className="create-review" aria-live="polite">
              <div className="create-review-head">
                <div>
                  <p className="detail-label">Final review</p>
                  <h2 className="action-title">Check the details.</h2>
                </div>
                <button type="button" className="button button--small" onClick={backToForm}>
                  Edit
                </button>
              </div>

              <dl className="create-summary">
                <div>
                  <dt>Buyer</dt>
                  <dd className="mono">{values.buyer}</dd>
                </div>
                <div>
                  <dt>Seller</dt>
                  <dd className="mono">{values.seller}</dd>
                </div>
                <div>
                  <dt>Arbiter</dt>
                  <dd className="mono">{values.arbiter}</dd>
                </div>
                <div>
                  <dt>Deposit</dt>
                  <dd>{formatEth(values.amount, 18)} ETH</dd>
                </div>
                <div>
                  <dt>Network</dt>
                  <dd>{chainLabel(targetChain.id)}</dd>
                </div>
                <div>
                  <dt>Deployer</dt>
                  <dd className="mono">{deployer ?? 'Not connected'}</dd>
                </div>
              </dl>

              {warnings.length > 0 && (
                <div className="create-warnings" role="note">
                  {warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}

              {wrongNetwork && (
                <div className="action-network" role="alert">
                  <p>
                    Your wallet is on {chainLabel(chainId)}. This deployment uses{' '}
                    {chainLabel(targetChain.id)}.
                  </p>
                  <button
                    type="button"
                    className="button button--small button--brass"
                    disabled={switching}
                    onClick={() => switchChain({ chainId: targetChain.id })}
                  >
                    {switching ? 'Switching…' : `Switch to ${chainLabel(targetChain.id)}`}
                  </button>
                </div>
              )}

              {deploy.phase === 'idle' ? (
                <div className="create-deploy">
                  <button
                    type="button"
                    className="button button--brass button--small"
                    disabled={blockingReason !== null}
                    title={blockingReason ?? undefined}
                    onClick={beginDeployment}
                  >
                    Simulate &amp; deploy
                  </button>
                  {blockingReason && <p className="action-reason">{blockingReason}</p>}
                  <p className="create-note">
                    The deployment is gas-estimated before your wallet is asked to sign.
                  </p>
                </div>
              ) : null}

              {deploy.phase !== 'idle' && (
                <TransactionStatus
                  phase={deploy.phase}
                  hash={deploy.hash}
                  error={deploy.error}
                  actionLabel="Deploy escrow"
                  chainId={targetChain.id}
                  confirmedDetail="Deployment confirmed and verified. Opening the vault…"
                  hashLabel="Deployment transaction"
                  onRetry={deploy.phase === 'failed' ? deploy.reset : undefined}
                  onDismiss={deploy.phase === 'failed' ? deploy.reset : undefined}
                />
              )}
            </div>
          ) : null}
        </div>

        <aside className="create-aside">
          <p className="detail-label">How the keys work</p>
          <p className="aside-copy">
            The buyer and seller each approve the deal when they are satisfied; either may raise a
            dispute if they are not.
          </p>
          <p className="aside-copy">
            The arbiter resolves a raised dispute by paying the seller or refunding the buyer.
          </p>
          <p className="aside-note">
            Addresses must be in checksum form. Repeated roles are allowed with a warning.
          </p>
        </aside>
      </div>
    </section>
  )
}
