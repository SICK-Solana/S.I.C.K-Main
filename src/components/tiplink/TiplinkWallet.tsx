import  { useMemo } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";
import { WalletModalProvider, WalletMultiButton, TipLinkWalletAutoConnectV2 } from '@tiplink/wallet-adapter-react-ui';

const TipLinkWalletIntegration = () => {
  const wallets = useMemo(
    () => [
      new TipLinkWalletAdapter({
        title: "Your Dapp Name", // Replace with your dApp name
        clientId: "your-client-id-here", // Replace with the client ID provided by TipLink
        theme: "dark" // Choose between "dark", "light", or "system"
      }),
    ],
    []
  );

  // Function to get search params, compatible with both old and new Next.js versions
  const getSearchParams = () => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  };

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <TipLinkWalletAutoConnectV2 isReady query={getSearchParams()}>
        <WalletModalProvider>
          <div className="flex justify-center items-center h-screen">
            <WalletMultiButton />
          </div>
        </WalletModalProvider>
      </TipLinkWalletAutoConnectV2>
    </WalletProvider>
  );
};

export default TipLinkWalletIntegration;