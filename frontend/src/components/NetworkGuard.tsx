import { useAccount, useSwitchChain } from 'wagmi'
import { targetChain } from '../config/wagmi'
import { chainLabel } from '../lib/chains'
import { describeWalletError } from '../lib/errors'

export function NetworkGuard() {
  const { chainId, isConnected } = useAccount()
  const { switchChain, isPending, error } = useSwitchChain()

  const wrongNetwork = isConnected && chainId !== undefined && chainId !== targetChain.id
  if (!wrongNetwork) return null

  return (
    <div className="network-guard" role="alert">
      <div>
        <p className="network-guard-title">
          You are on {chainLabel(chainId)}. This vault uses {chainLabel(targetChain.id)}.
        </p>
        <p className="network-guard-detail">
          Switch networks to continue. No action is sent until you are on the right chain.
        </p>
        {error && <p className="network-guard-error">{describeWalletError(error)}</p>}
      </div>
      <button
        type="button"
        className="button button--brass button--small"
        disabled={isPending}
        onClick={() => switchChain({ chainId: targetChain.id })}
      >
        {isPending ? 'Switching…' : `Switch to ${chainLabel(targetChain.id)}`}
      </button>
    </div>
  )
}
