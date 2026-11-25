# Three Key Vault frontend

A static React app for reading and acting on the three-key Escrow contract. It can also deploy a fresh escrow from a connected wallet on the selected network.

## Run locally

Requires Node.js 20+ and npm.

```bash
cd frontend
npm install
npm run dev
```

The app is served at `http://localhost:5173`.

For local chain work, start Anvil on `http://127.0.0.1:8545` (chain ID `31337`) and set `VITE_ENABLE_LOCAL=true` in `frontend/.env.local`. Use only Anvil's public development accounts. Do not put a real private key in the frontend or in any `VITE_*` variable.

Two checks are useful before committing frontend changes:

```bash
npm run typecheck
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local`. Every `VITE_*` value is inlined into the browser bundle by Vite and is therefore **public**. Never put private keys, RPC API keys, or other secrets here.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_ESCROW_ADDRESS` | `0x87Be26BfA7714A1E50aAF60C712f7b3dc3Bc809D` | Address loaded on the home page when no deep link is present. Invalid values fall back to the default. |
| `VITE_SEPOLIA_RPC_URL` | empty | Sepolia JSON-RPC endpoint. When empty, the public fallbacks below are used. |
| `VITE_WALLETCONNECT_ID` | empty | WalletConnect Cloud project ID. When empty, only injected wallets are offered. Public by design. |
| `VITE_ENABLE_LOCAL` | `false` | Dev only. `true` targets local Anvil (`31337`) instead of Sepolia. Forced off in production builds. |
| `VITE_ENABLE_LAB` | `false` | Dev only. `true` reveals `/lab` and its navigation link. Forced off in production builds. |

### Public Sepolia RPC fallbacks

Used in order when `VITE_SEPOLIA_RPC_URL` is empty. These public endpoints are rate-limited and may change, so configure a dedicated RPC URL for a real deployment.

1. `https://ethereum-sepolia-rpc.publicnode.com`
2. `https://sepolia.gateway.tenderly.co`
3. `https://rpc.sepolia.ethpandaops.io`

### Production profile

Production builds (`npm run build`) are Sepolia-only. `VITE_ENABLE_LOCAL` and `VITE_ENABLE_LAB` are ignored even if they were set in the build environment, so Anvil cannot be selected and `/lab` is unreachable (the route and nav link are not rendered). The Lab is a static design preview intended for local development only.

## Routes

- `/` — vault inspector, onboarding copy, recent addresses, and actions for the connected role.
- `/create` — final review, gas estimation, wallet deploy, receipt verification, and a shareable link.
- `/escrow/:address` — deep link that loads a specific escrow directly. Invalid addresses show a clear error.
- `/lab` — static design preview, development builds only.

The deployer wallet pays the deposit and the gas. The deposit is not necessarily paid by the buyer role. Creation bytecode is bundled in `src/contracts/escrowBytecode.ts`; after the receipt, the app reads back buyer, seller, arbiter, and amount before saving the vault and navigating to it.

## Static hosting on Vercel

SPA rewrites are declared in `vercel.json`, so deep links such as `/escrow/0x…` resolve to `index.html`. A Netlify-style `public/_redirects` is also included for hosts that use that convention.

Use these exact project settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

Environment variables to set in Vercel:

- `VITE_ESCROW_ADDRESS` — the address shown by default.
- `VITE_SEPOLIA_RPC_URL` — recommended; a dedicated Sepolia RPC endpoint.
- `VITE_WALLETCONNECT_ID` — optional; only if WalletConnect is wanted.

Do **not** set `VITE_ENABLE_LOCAL` or `VITE_ENABLE_LAB` in production. They are ignored by production builds regardless.

After deployment, open the site root and a `/escrow/<address>` URL directly to confirm the SPA fallback works.

## Local Anvil test flow

1. Start Anvil: `anvil --chain-id 31337`.
2. In `frontend/.env.local`, set `VITE_ENABLE_LOCAL=true`. Leave `VITE_ENABLE_LAB` as needed for design work.
3. Run `npm run dev` and connect an injected wallet to Anvil using one of the printed development accounts.
4. Open `/create`, fill in checksummed buyer, seller, and arbiter addresses plus a non-zero amount, review the details, then confirm in the wallet.
5. The app estimates gas before the wallet prompt, waits for the receipt, verifies the stored roles and amount, adds the address to the recent list, and navigates to `/escrow/<address>`.
6. Reload that URL or paste it into a new tab to confirm the deep link loads directly. Use the share button to copy the link.

Never use this flow to send writes or deployments to Sepolia while testing; point the wallet only at local Anvil.
