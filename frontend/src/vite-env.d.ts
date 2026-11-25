/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ESCROW_ADDRESS?: string
  readonly VITE_SEPOLIA_RPC_URL?: string
  readonly VITE_WALLETCONNECT_ID?: string
  readonly VITE_ENABLE_LOCAL?: string
  readonly VITE_ENABLE_LAB?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
