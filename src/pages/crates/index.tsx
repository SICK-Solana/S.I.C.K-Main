import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createJupiterApiClient, QuoteResponse } from '@jup-ag/api';
import tokenData from '../createcrate/tokens.json';
import BackendApi from '../../constants/api.ts'
import Sidebar from '../../components/ui/sidebar.tsx';
import SideBarPhone from '../../components/ui/sidebarPhone.tsx';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
import { Buffer } from 'buffer';

// Ensure the global Buffer is available
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

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

type SwapQuote = {
  symbol: string;
  quote: QuoteResponse;
  transaction: VersionedTransaction;
  simulationLogs: string[] | null;
};


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
  if (!crateData || !amount) {
    console.error('Missing required data for swap quotes');
    return;
  }

  setLoading(true); // Add loading state
  setError(null); // Reset error state

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
    
    const filteredResults = results.filter((result): result is SwapQuote => result !== null);

    if (filteredResults.length === 0) {
      throw new Error('No valid quotes received');
    }

    setSwapQuotes(filteredResults);
  } catch (error) {
    console.error("Error fetching swap quotes:", error);
    setError(error instanceof Error ? error.message : 'An unknown error occurred');
  } finally {
    setLoading(false);
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
    <div className="container mx-auto p-8 bg-gray-900 min-h-screen text-gray-100">
      <div className="bg-gray-800 shadow-2xl rounded-3xl mb-12 overflow-hidden">
        <div className="relative h-96">
          <img src={crateData.image} alt={crateData.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-6">
            <h2 className="text-4xl font-bold mb-2 text-white">{crateData.name}</h2>
            <div className="flex justify-between items-center text-sm text-gray-300">
              <p>Created: {new Date(crateData.createdAt).toLocaleDateString()}</p>
              <div className="flex items-center space-x-4">
                <span className="flex items-center"><svg className="w-5 h-5 text-lime-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18l-1.45-1.32C3.53 12.24 0 9.24 0 5.5 0 2.42 2.42 0 5.5 0 7.24 0 8.91.81 10 2.09 11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.74-3.53 6.74-8.55 11.18L10 18z"/></svg>{crateData.upvotes}</span>
                <span className="flex items-center"><svg className="w-5 h-5 text-red-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l-1.45 1.32C3.53 7.76 0 10.76 0 14.5 0 17.58 2.42 20 5.5 20c1.74 0 3.41-.81 4.5-2.09C11.09 19.19 12.76 20 14.5 20 17.58 20 20 17.58 20 14.5c0-3.74-3.53-6.74-8.55-11.18L10 2z"/></svg>{crateData.downvotes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h3 className="text-xl font-bold mb-2">Tokens</h3>
        {crateData.tokens.map((token) => (
          <div key={token.id} className="mb-2">
         
            <TokenBar key={token.id} token={token} />
    
          </div>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-20">
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
          Put Your Life Savings in this Crate 🚀
        </button>

        {swapQuotes.length > 0 && (
          <div className="mt-12">
            <h4 className="text-2xl font-semibold mb-6 text-lime-400">Swap Quotes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swapQuotes.map((quote, index) => (
                <div key={index} className="bg-gray-700 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:bg-gray-600">
                  <p className="font-semibold text-white text-lg mb-2">{quote.symbol}</p>
                  <p className="text-lime-300 mb-4">{quote.quote.outAmount} output tokens</p>
                  <button
                    onClick={() => handleSwap(quote)}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-500 transition duration-300 ease-in-out font-bold"
                  >
                    Swap
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Sidebar/>
      <SideBarPhone/>
    </div>
  );
};

export default CrateDetailPage;
const TokenBar: React.FC<{ token: Token }> = ({ token }) => {
  const barWidth = `${token.quantity}%`;
  const hue = Math.floor(Math.random() * 360); // Generate a random hue for color variety

  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{token.name} ({token.symbol})</span>
        <span className="text-sm font-medium">{token.quantity}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ width: barWidth, backgroundColor: `hsl(${hue}, 70%, 50%)` }}
        ></div>
      </div>
    </div>
  );
};
