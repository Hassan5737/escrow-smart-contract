import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { NetworkGuard } from './components/NetworkGuard'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { config, queryClient } from './config/wagmi'
import { env } from './config/env'
import { HomePage } from './pages/HomePage'
import { LabPage } from './pages/LabPage'

export default function App() {
  return (
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <div className="app">
            <SiteHeader />
            <NetworkGuard />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                {env.enableLab && <Route path="/lab" element={<LabPage />} />}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <SiteFooter />
          </div>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  )
}
