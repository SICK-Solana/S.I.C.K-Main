import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createJupiterApiClient, QuoteResponse } from '@jup-ag/api';
import tokenData from '../createcrate/tokens.json';
import BackendApi from '../../constants/api.ts'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
import { Buffer } from 'buffer';

// Ensure the global Buffer is available
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const getTokenMintAddress = (symbol: string): string => {
  const token = tokenData.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
  if (token) {
    return token.address;
  }
  console.warn(`Token with symbol ${symbol} not found. Using Wrapped SOL address as fallback.`);
  return 'So11111111111111111111111111111111111111112';
};

interface Token {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  createdAt: string;
  crateId: string;
}

interface CrateData {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  totalCost: number;
  creatorId: string;
  upvotes: number;
  downvotes: number;
  tokens: Token[];
}

interface SwapQuote {
  symbol: string;
  quote: {
    inputMint: string;
    inAmount: string;
    outputMint: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    priceImpactPct: number;
  };
  transaction?: VersionedTransaction;
  simulationLogs?: string[];
}

const calculateTokenAmount = (totalAmount: number, tokenQuantity: number, totalQuantity: number, inputDecimals = 6, outputDecimals = 6) => {
  const percentage = tokenQuantity / totalQuantity;
  const rawAmount = totalAmount * percentage;
  const scaleFactor = Math.pow(10, outputDecimals - inputDecimals);
  const adjustedAmount = rawAmount * scaleFactor;
  return Math.round(adjustedAmount);
};

const CrateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crateData, setCrateData] = useState<CrateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [swapQuotes, setSwapQuotes] = useState<SwapQuote[]>([]);

  // Retrieve wallet public key from localStorage (TipLink)
  const publicKeyFromLocalStorage = localStorage.getItem('tipLink_pk_connected');
  const userPublicKey = publicKeyFromLocalStorage ? new PublicKey(publicKeyFromLocalStorage) : null;

  useEffect(() => {
    const fetchCrateData = async () => {
      try {
        const response = await fetch(`${BackendApi}/crates/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch crate data');
        }
        const data: CrateData = await response.json();
        setCrateData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCrateData();
  }, [id]);

  const simulateAndExecuteSwap = async (inputMint: string, outputMint: string, amount: number, userPublicKey: PublicKey) => {
    const jupiterApi = await createJupiterApiClient();
    const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a95e3765-35c7-459e-808a-9135a21acdf6');
  
    const quoteResponse = await jupiterApi.quoteGet({
      inputMint,
      outputMint,
      amount,
      slippageBps: 50,
    });
  
    const swapResponse = await jupiterApi.swapPost({
      swapRequest: {
        quoteResponse,
        userPublicKey: userPublicKey.toString(),
        wrapAndUnwrapSol: true,
      }
    });
  
    const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
  
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.message.recentBlockhash = latestBlockhash.blockhash;
  
    const simulation = await connection.simulateTransaction(transaction);
  
    if (simulation.value.err) {
      console.error('Simulation error:', simulation.value.logs);
      throw new Error('Transaction simulation failed');
    }
  
    return {
      transaction,
      simulationLogs: simulation.value.logs,
    };
  };

  const getSwapQuotes = async (amount: number) => {
    if (!crateData || !amount ) {
      console.error('Missing required data for swap quotes');
      return;
    }
  
    try {
      const jupiterApi = await createJupiterApiClient();
      const totalQuantity = crateData.tokens.reduce((sum, token) => sum + token.quantity, 0);
  
      const quotePromises = crateData.tokens.map(async (token) => {
        const tokenAmount = calculateTokenAmount(amount, token.quantity, totalQuantity);
        const mint = getTokenMintAddress(token.symbol);
  
        try {
          const quote = await jupiterApi.quoteGet({
            inputMint: USDC_MINT,
            outputMint: mint,
            amount: tokenAmount,
          });
          if (!userPublicKey) {
            throw new Error('Public key is missing');
          }
          
  
          const { transaction, simulationLogs } = await simulateAndExecuteSwap(
            USDC_MINT,
            mint,
            tokenAmount,
            userPublicKey
          );
  
          return { 
            symbol: token.symbol, 
            quote,
            transaction,
            simulationLogs
          };
        } catch (error) {
          console.error(`Error getting quote for token ${token.symbol}:`, error);
          return null;
        }
      });
  
      const results = await Promise.all(quotePromises);
// Assuming results is the array you're working with
// const results: ({ symbol: string; quote: QuoteResponse; transaction: VersionedTransaction; simulationLogs: string[] | null; } | null)[] = ...;

// Filter out null values and type assert to SwapQuote[]
const filteredResults = results.filter((result): result is { symbol: string; quote: QuoteResponse; transaction: VersionedTransaction; simulationLogs: string[] | null; } => result !== null);

// Set the state with the filtered results
setSwapQuotes(filteredResults as unknown as SwapQuote[]);

    } catch (error) {
      console.error("Error fetching swap quotes:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAmount(e.target.value);
  };

  const handleGetQuotes = () => {
    getSwapQuotes(parseFloat(inputAmount));
  };

  const handleSwap = async (quote: SwapQuote) => {
    if (!userPublicKey) {
      console.error('Public key is missing');
      return;
    }

    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const signedTransaction = await connection.sendRawTransaction(quote.transaction!.serialize());
      console.log('Transaction sent:', signedTransaction);
    } catch (error) {
      console.error('Failed to send transaction:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!crateData) return <div>No crate data found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h2 className="text-2xl font-bold mb-2">{crateData.name}</h2>
        <img src={crateData.image} alt={crateData.name} className="w-full h-64 object-cover mb-4 rounded" />
        <p>Created: {new Date(crateData.createdAt).toLocaleDateString()}</p>
        <p>Upvotes: {crateData.upvotes} | Downvotes: {crateData.downvotes}</p>
      </div>

      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h3 className="text-xl font-bold mb-2">Tokens</h3>
        {crateData.tokens.map((token) => (
          <div key={token.id} className="mb-2">
            <p>{token.name} ({token.symbol}): {token.quantity}</p>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h3 className="text-xl font-bold mb-2">Buy Crate</h3>
        <input
          type="number"
          value={inputAmount}
          onChange={handleInputChange}
          placeholder="Enter USDC amount"
          className="w-full p-2 border rounded mb-4"
        />
        <button 
          onClick={handleGetQuotes}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Get Quotes
        </button>

        {swapQuotes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Swap Quotes:</h4>
            {swapQuotes.map((quote, index) => (
              <div key={index} className="bg-gray-100 p-3 mb-2 rounded">
                <p>{quote.symbol}: {quote.quote.outAmount} output tokens</p>
                <button
                  onClick={() => handleSwap(quote)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mt-2"
                >
                  Swap
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrateDetailPage;
