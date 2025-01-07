// @ts-nocheck
import { createRoot } from 'react-dom/client';
import { 
  WalletProvider,
  ConnectionProvider 
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { createPhantom } from "@phantom/wallet-sdk";
import { useState, useMemo } from 'react';
import App from './App';
import './App.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Menu, X, Twitter } from 'lucide-react';

const Navbar = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const steps = [
    "Create your own custom crypto portfolio (Crate) by selecting tokens and their allocations",
    "Share your Crate with the community and discover Crates from other users",
    "Analyze performance metrics and track your investments over time",
    "Use our JUP.ag integration to efficiently swap SOL or USDC for tokens in Crates",
    "Earn platform rewards by creating popular Crates that others invest in"
  ];

  return (
    <>
      <nav className="fixed w-full z-50 backdrop-blur-md bg-opacity-70">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <a 
              href="/" 
              className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(202,255,86)] to-[#29d004] text-3xl md:text-5xl"
              style={{fontFamily: "'Jersey 10', serif", fontWeight: '100'}}
            >
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');
              </style>
              Ape Crate
            </a>

            {/* Hamburger menu button for mobile */}
            <button 
              className="md:hidden text-lime-200 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4 md:space-x-4 md:pr-20">
              <NavLinks 
                setShowAboutModal={setShowAboutModal} 
                className="text-lime-200 hover:text-gray-300 jersey-10-regular underline px-6 text-xl md:text-2xl"
              />
              <WalletButton />
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-4">
                <NavLinks 
                  setShowAboutModal={setShowAboutModal}
                  className="text-lime-200 hover:text-gray-300 jersey-10-regular underline px-2 text-2xl"
                />
                <div className="px-2">
                  <WalletButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* About Modal */}
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
// Separate component for nav links to avoid repetition
const NavLinks = ({ setShowAboutModal, className }) => (
  <>
    <a href="/cratecreator" className={className}>
      Create
    </a>
    <a href="/" className={className}>
      Explore
    </a>
    <a href="/sai" className={className}>
      Agent
    </a>
    <a href="https://x.com/SICKonSolana" className={className}>
      <Twitter className="inline-block" size={24} />
    </a>
    <button 
      onClick={() => setShowAboutModal(true)} 
      className={className}
    >
      About
    </button>
  </>
);

// Separate component for wallet button to avoid repetition
const WalletButton = () => (
  <WalletMultiButton
    style={{
      background: "#A9F605",
      color: "black",
      borderRadius: "180px",
    }}
  />
);
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

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (error) => {
        console.log('ServiceWorker registration failed: ', error);
      }
    );
  });
}

// Main render function
const Root = () => {
  // Set up network connection
  const endpoint = useMemo(() => "https://api.mainnet-beta.solana.com", []);
  
  // Set up wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Navbar />
          <App wallets={wallets} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

createRoot(document.getElementById('root')!).render(<Root />);