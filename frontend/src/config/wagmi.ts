import { QueryClient } from '@tanstack/react-query'
import { defineChain, type Chain } from 'viem'
import { createConfig, fallback, http, type Transport } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { env } from './env'

export const anvil = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
})

export const targetChain: Chain = env.enableLocal ? anvil : sepolia
export const supportedChainIds: readonly number[] = env.enableLocal
  ? [anvil.id]
  : [sepolia.id]

const chains: readonly [Chain, ...Chain[]] = env.enableLocal
  ? [sepolia, anvil]
  : [sepolia]

// Public endpoints used when no private RPC URL is configured. They are
// rate-limited and can change; set VITE_SEPOLIA_RPC_URL in production.
export const publicSepoliaRpcUrls: readonly string[] = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://sepolia.gateway.tenderly.co',
  'https://rpc.sepolia.ethpandaops.io',
]

const sepoliaTransport: Transport = env.sepoliaRpcUrl
  ? http(env.sepoliaRpcUrl)
  : fallback(publicSepoliaRpcUrls.map((url) => http(url)))

const transports: Record<number, Transport> = {
  [sepolia.id]: sepoliaTransport,
}
if (env.enableLocal) {
  transports[anvil.id] = http(anvil.rpcUrls.default.http[0] ?? 'http://127.0.0.1:8545')
}

const injectedConnector = injected({ shimDisconnect: true })
const connectors = env.walletConnectProjectId
  ? [
      injectedConnector,
      walletConnect({
        projectId: env.walletConnectProjectId,
        showQrModal: true,
      }),
    ]
  : [injectedConnector]

export const config = createConfig({
  chains,
  connectors,
  transports,
  multiInjectedProviderDiscovery: true,
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 4_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
