import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useConnect, useConnectors } from 'wagmi'
import { describeWalletError } from '../lib/errors'

interface WalletModalProps {
  open: boolean
  onClose: () => void
}

type WalletConnector = ReturnType<typeof useConnectors>[number]

export function WalletModal({ open, onClose }: WalletModalProps) {
  const connectors = useConnectors()
  const { connectAsync } = useConnect()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const wallets = useMemo(() => {
    const seen = new Set<string>()
    return connectors.filter((connector) => {
      const key = connector.name.trim().toLowerCase()
      if (key.length === 0 || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [connectors])

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    const focusables = dialog
      ? Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        )
      : []

    focusables[0]?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [open, onClose])

  async function connect(connector: WalletConnector) {
    setError(null)
    setPendingId(connector.id)
    try {
      await connectAsync({ connector })
      onClose()
    } catch (cause) {
      setError(describeWalletError(cause))
    } finally {
      setPendingId(null)
    }
  }

  const backdropTransition = reducedMotion ? { duration: 0 } : { duration: 0.24 }
  const panelTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={dialogRef}
            className="wallet-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-modal-title"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
            transition={panelTransition}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">Wallet</p>
                <h2 id="wallet-modal-title">Choose a key</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="Close wallet list"
                onClick={onClose}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <p className="modal-note">
              Wallets found on this device are listed below. Nothing is shared until you approve.
            </p>

            <div className="wallet-list">
              {wallets.map((connector) => {
                const isPending = pendingId === connector.id
                return (
                  <button
                    type="button"
                    className="wallet-option"
                    key={`${connector.id}-${connector.name}`}
                    disabled={isPending}
                    onClick={() => void connect(connector)}
                  >
                    {connector.icon ? (
                      <img
                        className="wallet-icon"
                        src={connector.icon}
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="wallet-icon wallet-icon--fallback" aria-hidden="true">
                        {connector.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span className="wallet-option-name">{connector.name}</span>
                    <span className="wallet-option-state" aria-live="polite">
                      {isPending ? 'Opening…' : 'Connect'}
                    </span>
                  </button>
                )
              })}
              {wallets.length === 0 && (
                <p className="modal-empty">
                  No injected wallet detected. Install MetaMask, Rabby or Coinbase Wallet.
                </p>
              )}
            </div>

            {error && (
              <p className="modal-error" role="alert">
                {error}
              </p>
            )}

            <p className="modal-foot">
              WalletConnect appears here when a project id is configured.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
