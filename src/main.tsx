import { createRoot } from 'react-dom/client';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { createPhantom } from "@phantom/wallet-sdk";
import { useState } from 'react';
import App from './App';
import './App.css';
import '@solana/wallet-adapter-react-ui/styles.css';

const Navbar = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);

  const steps = [
    "Create your own custom crypto portfolio (Crate) by selecting tokens and their allocations",
    "Share your Crate with the community and discover Crates from other users",
    "Analyze performance metrics and track your investments over time",
    "Use our JUP.ag integration to efficiently swap SOL or USDC for tokens in Crates",
    "Earn platform rewards by creating popular Crates that others invest in"
  ];

  return (
    <>
      <nav className="fixed w-full z-50  backdrop-blur-md bg-opacity-70" >
        <div className="container mx-auto px-6 pt-2">
          <div className="flex justify-between items-center">
            <a href="/" className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(202,255,86)] to-[#29d004] text-5xl pl-8 pt-2 md:pl-12 md:pt-3" style={{fontFamily: "'Jersey 10', serif", fontWeight: '100'}}>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');
              </style>
              Ape Crate
            </a>
          
            <div className="flex items-center space-x-4   md:space-x-4  md:pr-20">
              <a href="/cratecreator" className="text-lime-200 hover:text-gray-300 jersey-10-regular underline px-6 text-2xl md:text-4xl"> 
              
              Create Crate</a>
              <a href="https://x.com/SICKonSolana" className="text-white hover:text-gray-300">X</a>
              <button onClick={() => setShowAboutModal(true)} className="text-white hover:text-gray-300">About</button>
            </div>
          </div>
        </div>
      </nav>

      {showAboutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-lime-200 mb-6">How Ape Crate Works</h2>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-lime-200 text-gray-900 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-white">{step}</p>
                </li>
              ))}
            </ol>
            <button 
              onClick={() => setShowAboutModal(false)}
              className="mt-6 px-4 py-2 bg-lime-200 text-gray-900 rounded hover:bg-lime-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

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
    <>
      <Navbar />
      <App wallets={[]} />
    </>
  </WalletProvider>
);