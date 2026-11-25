import { chainLabel } from '../lib/chains'
import { targetChain } from '../config/wagmi'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>One contract. One deal.</span>
      <span>{chainLabel(targetChain.id)}</span>
    </footer>
  )
}
