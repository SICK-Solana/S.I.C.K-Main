import  { useState } from 'react';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Buffer } from 'buffer';
const SwapComponent = () => {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState('');
  const [error, setError] = useState('');

  const connection = new Connection('https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/');

  const handleSwap = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxId('');

    try {
      // Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
      const quoteResponse = await (
        await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50')
      ).json();
console.log(quoteResponse);
      const { swapTransaction } = await (
        await fetch('https://quote-api.jup.ag/v6/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey: wallet.publicKey.toString(),
            wrapAndUnwrapSol: true,
          })
        })
      ).json();

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const signedTransaction = await wallet.signTransaction(transaction);

      const rawTransaction = signedTransaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
      });

      await connection.confirmTransaction(txid);
      setTxId(txid);
    } catch (err) {
      console.error(err);
      setError('Swap failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Solana Swap</h2>
      {!wallet.connected ? (
        <WalletMultiButton className="mb-4" />
      ) : (
        <button 
          onClick={handleSwap} 
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Swapping...' : 'Swap 0.1 SOL to USDC'}
        </button>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {txId && (
        <p className="text-green-500 mt-2">
          Swap successful! <a href={`https://solscan.io/tx/${txId}`} target="_blank" rel="noopener noreferrer" className="underline">View transaction</a>
        </p>
      )}
    </div>
  );
};

export default SwapComponent;