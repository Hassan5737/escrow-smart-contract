import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { chainLabel } from '../lib/chains'
import { truncateAddress } from '../lib/format'
import { WalletModal } from './WalletModal'

type CopyState = 'idle' | 'copied' | 'failed'

export function WalletButton() {
  const { address, chainId, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const openModal = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])

  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && wrapperRef.current?.contains(target)) return
      setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  async function copyAddress() {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className="wallet-wrap" ref={wrapperRef}>
      <button
        type="button"
        className="wallet-button"
        aria-haspopup={isConnected ? 'menu' : 'dialog'}
        aria-expanded={isConnected ? menuOpen : modalOpen}
        onClick={() =>
          isConnected ? setMenuOpen((value) => !value) : openModal()
        }
      >
        {isConnected && address ? (
          <>
            <span className="wallet-dot" aria-hidden="true" />
            <span className="mono">{truncateAddress(address)}</span>
            <span className="wallet-chain">{chainLabel(chainId)}</span>
          </>
        ) : (
          'Connect wallet'
        )}
      </button>

      {menuOpen && isConnected && (
        <div className="wallet-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => void copyAddress()}
          >
            {copyState === 'copied' ? 'Address copied' : 'Copy address'}
          </button>
          {copyState === 'failed' && (
            <p className="wallet-menu-note">Clipboard unavailable.</p>
          )}
          <button
            type="button"
            role="menuitem"
            className="wallet-menu-danger"
            onClick={() => {
              disconnect()
              setMenuOpen(false)
              setCopyState('idle')
            }}
          >
            Disconnect
          </button>
        </div>
      )}

      <WalletModal open={modalOpen} onClose={closeModal} />
    </div>
  )
}
