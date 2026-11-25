import { QueryClient } from '@tanstack/react-query'
import { defineChain, type Chain } from 'viem'
import { createConfig, http } from 'wagmi'
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

const transports: Record<number, ReturnType<typeof http>> = {
  [sepolia.id]: http(env.sepoliaRpcUrl),
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
