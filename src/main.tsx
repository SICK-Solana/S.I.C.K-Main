import { createRoot } from 'react-dom/client';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@tiplink/wallet-adapter-react-ui';
import { createPhantom } from "@phantom/wallet-sdk";
import App from './App';
import './index.css';
import '@solana/wallet-adapter-react-ui/styles.css';

// Initialize Phantom embedded wallet
if (typeof window !== 'undefined') {
  createPhantom({
    zIndex: 10000,
    colorScheme: 'light',
    hideLauncherBeforeOnboarded: false,
    paddingRight: 20,
    paddingBottom: 20
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (error) => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <WalletProvider wallets={[]} autoConnect>
    <WalletModalProvider>
      <App wallets={[]} />
    </WalletModalProvider>
  </WalletProvider>
);