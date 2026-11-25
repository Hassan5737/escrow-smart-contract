import { useState } from 'react'
import type { Address } from 'viem'
import { useAccount, useSwitchChain } from 'wagmi'
import { targetChain } from '../config/wagmi'
import { chainLabel } from '../lib/chains'
import { useEscrowWrite } from '../hooks/useEscrowWrite'
import { ConfirmDialog } from './ConfirmDialog'
import { TransactionStatus } from './TransactionStatus'
import type { ActionState } from '../types'

interface ActionPanelProps {
  address: Address
  actions: readonly ActionState[]
  onConfirmed: () => void | Promise<void>
}

export function ActionPanel({ address, actions, onConfirmed }: ActionPanelProps) {
  const { isConnected, chainId } = useAccount()
  const { switchChain, isPending: switching } = useSwitchChain()
  const write = useEscrowWrite(address, onConfirmed)
  const [openAction, setOpenAction] = useState<ActionState | null>(null)
  const [lastAction, setLastAction] = useState<ActionState | null>(null)

  const wrongNetwork = isConnected && chainId !== targetChain.id

  function reasonFor(action: ActionState): string | null {
    if (wrongNetwork) return `Switch to ${chainLabel(targetChain.id)} before acting.`
    if (switching) return 'Switching networks.'
    if (write.busy) return 'A transaction is already in progress.'
    return action.reason
  }

  function openConfirmation(action: ActionState) {
    write.reset()
    setLastAction(action)
    setOpenAction(action)
  }

  function confirm() {
    if (!openAction) return
    const action = openAction
    setOpenAction(null)
    void write.submit(action.kind)
  }

  function retry() {
    if (!lastAction) return
    write.reset()
    setOpenAction(lastAction)
  }

  function dismiss() {
    write.reset()
    setLastAction(null)
  }

  return (
    <section className="action-panel" aria-labelledby="action-title">
      <div className="action-head">
        <p className="detail-label">Vault actions</p>
        <h2 className="action-title" id="action-title">
          Act on this vault.
        </h2>
        <p className="action-lede">
          Every action is simulated first. Your wallet is asked to sign only if the simulation
          succeeds.
        </p>
      </div>

      {wrongNetwork && (
        <div className="action-network" role="alert">
          <p>
            Your wallet is on {chainLabel(chainId)}. This vault uses {chainLabel(targetChain.id)}.
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

      {!isConnected ? (
        <p className="action-empty">Connect a wallet to act on this vault.</p>
      ) : actions.length === 0 ? (
        <p className="action-empty">This wallet is a visitor. Read only.</p>
      ) : (
        <div className="action-list">
          {actions.map((action) => {
            const reason = reasonFor(action)
            return (
              <div className="action-item" key={action.kind}>
                <button
                  type="button"
                  className={`button button--small${action.kind === 'raiseDispute' ? ' button--quiet' : ''}`}
                  disabled={reason !== null}
                  title={reason ?? undefined}
                  onClick={() => openConfirmation(action)}
                >
                  {action.label}
                </button>
                {reason && <p className="action-reason">{reason}</p>}
              </div>
            )
          })}
        </div>
      )}

      {write.phase !== 'idle' && lastAction && (
        <TransactionStatus
          phase={write.phase}
          hash={write.hash}
          error={write.error}
          actionLabel={lastAction.label}
          onRetry={retry}
          onDismiss={dismiss}
        />
      )}

      {openAction && (
        <ConfirmDialog
          action={openAction}
          chainId={targetChain.id}
          onCancel={() => setOpenAction(null)}
          onConfirm={confirm}
        />
      )}
    </section>
  )
}
