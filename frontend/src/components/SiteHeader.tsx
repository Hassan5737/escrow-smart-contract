import { Link } from 'react-router-dom'
import { env } from '../config/env'
import { WalletButton } from './WalletButton'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Three Key Vault home">
        <svg className="brand-mark" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="18" r="2" />
          <circle cx="19" cy="18" r="2" />
          <path d="M12 7 6 16M12 7l6 9M7 18h10" />
        </svg>
        <span className="brand-text">
          <span className="brand-name">Three Key Vault</span>
          <span className="brand-sub">escrow, quietly</span>
        </span>
      </Link>

      <nav className="site-nav" aria-label="Main">
        {env.enableLab && (
          <Link className="nav-link" to="/lab">
            Lab
          </Link>
        )}
        <WalletButton />
      </nav>
    </header>
  )
}
