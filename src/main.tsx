import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter"
import { WalletModalProvider, TipLinkWalletAutoConnectV2 } from '@tiplink/wallet-adapter-react-ui'
import App from './App.tsx'
import './index.css'
import '@solana/wallet-adapter-react-ui/styles.css'

const wallets = [
  new TipLinkWalletAdapter({
    title: "SICK",
    clientId: "cb46c2b5-91cb-4078-9543-7fcace89b15a",
    theme: "dark"
  }),
]

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider wallets={wallets} >
      <TipLinkWalletAutoConnectV2 isReady query={new URLSearchParams(window.location.search)}>
        <WalletModalProvider>
          <App/>
        </WalletModalProvider>
      </TipLinkWalletAutoConnectV2>
    </WalletProvider>
  </StrictMode>,
)
