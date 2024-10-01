import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PublicKey, Connection, VersionedTransaction } from '@solana/web3.js';
import { QuoteResponse } from '@jup-ag/api';
import { Buffer } from 'buffer';
import Sidebar from '../../components/ui/sidebar.tsx';
import SideBarPhone from '../../components/ui/sidebarPhone.tsx';
import BuySellSection from '../../components/chart/BuySellSection';
import ReturnCalculator from '../../components/chart/ReturnCalculator';
import TokenSplit from '../../components/chart/TokenSplit';
import BackendApi from '../../constants/api.ts';
import { createJupiterApiClient } from '@jup-ag/api';
import tokenData from '../../pages/createcrate/tokens.json';

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// chart.js imports
import CombinedPriceChart from './CombinedPriceChart.tsx';
import CrateValueDisplay from './CombinedTokenPrice.tsx';
//recharts imports
import truncate from '../../constants/truncate.ts';




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

// const calculateTokenAmount = (totalAmount: number, tokenQuantity: number, totalQuantity: number, inputDecimals = 6, outputDecimals = 6) => {
//   const percentage = tokenQuantity / totalQuantity;
//   const rawAmount = totalAmount * percentage;
//   const scaleFactor = Math.pow(10, outputDecimals - inputDecimals);
//   const adjustedAmount = rawAmount * scaleFactor;
//   return Math.round(adjustedAmount);
// };

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

interface Token {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  createdAt: string;
  crateId: string;
}

interface CrateData {
  creator: any;
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

export type { SwapQuote };

const CrateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crateData, setCrateData] = useState<CrateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [swapQuotes] = useState<SwapQuote[]>([]);
  const [returnAmount] = useState<number>(479);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(1);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleInputChange');
    setInputAmount(e.target.value);
  };

  //   const simulateAndExecuteSwap = async (inputMint: string, outputMint: string, amount: number, userPublicKey: PublicKey) => {
  //   const jupiterApi = await createJupiterApiClient();

  //   try {
  //     const swapRequest: SwapPostRequest = {
  //       inputMint,
  //       outputMint,
  //       amount: amount.toString(),
  //       slippageBps: 50,
  //       feeBps: 4,
  //       asLegacyTransaction: false,
  //       userPublicKey: userPublicKey.toBase58(),
  //     };

  //     const { swapTransaction } = await jupiterApi.swapPost(swapRequest);

  //     const transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));

  //     const connection = new Connection('https://api.mainnet-beta.solana.com');
  //     const simulationResult = await connection.simulateTransaction(transaction);

  //     return {
  //       transaction,
  //       simulationLogs: simulationResult.value.logs,
  //     };
  //   } catch (error) {
  //     console.error('Error in simulateAndExecuteSwap:', error);
  //     throw error;
  //   }
  // };

  // const getSwapQuotes = async (amount: number) => {
  //   if (!crateData || !amount) {
  //     console.error('Missing required data for swap quotes');
  //     return;
  //   }

  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const jupiterApi = await createJupiterApiClient();
  //     const totalQuantity = crateData.tokens.reduce((sum, token) => sum + token.quantity, 0);

  //     const quotePromises = crateData.tokens.map(async (token) => {
  //       const tokenAmount = calculateTokenAmount(amount, token.quantity, totalQuantity);
  //       const mint = getTokenMintAddress(token.symbol);

  //       try {
  //         const quote = await jupiterApi.quoteGet({
  //           inputMint: USDC_MINT,
  //           outputMint: mint,
  //           amount: tokenAmount.toString(),
  //           slippageBps: 50,
  //         });

  //         if (!userPublicKey) {
  //           throw new Error('Public key is missing');
  //         }

  //         const { transaction, simulationLogs } = await simulateAndExecuteSwap(
  //           USDC_MINT,
  //           mint,
  //           tokenAmount,
  //           userPublicKey
  //         );

  //         return {
  //           symbol: token.symbol,
  //           quote,
  //           transaction,
  //           simulationLogs
  //         };
  //       } catch (error) {
  //         console.error(`Error getting quote for token ${token.symbol}:`, error);
  //         return null;
  //       }
  //     });

  //     const results = await Promise.all(quotePromises);

  //     const filteredResults = results.filter((result): result is SwapQuote => result !== null);

  //     if (filteredResults.length === 0) {
  //       throw new Error('No valid quotes received');
  //     }

  //     setSwapQuotes(filteredResults);
  //   } catch (error) {
  //     console.error("Error fetching swap quotes:", error);
  //     setError(error instanceof Error ? error.message : 'An unknown error occurred');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleGetQuotes = () => {
  //   getSwapQuotes(parseFloat(inputAmount));
  // };

  const handleGetQuotes = async () => {
    const jupiterApi = await createJupiterApiClient();
    const quote = await jupiterApi.quoteGet({
      inputMint: USDC_MINT,
      outputMint: getTokenMintAddress('SOL'),
      amount: parseFloat(inputAmount),
    });
    return quote;
  };

  const handleSwap = async (quote: SwapQuote) => {
    if (!userPublicKey) {
      console.error('Public key is missing');
      return;
    }

    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');

      const signedTransaction = await connection.sendRawTransaction(quote.transaction.serialize());

      console.log('Transaction sent:', signedTransaction);
    } catch (error) {
      console.error('Failed to send transaction:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!crateData) return <div>No crate data found</div>;


  // const chartData = [
  //   { name: 'Jan', value: 4000 },
  //   { name: 'Feb', value: 3000 },
  //   { name: 'Mar', value: 5000 },
  //   { name: 'Apr', value: 4500 },
  //   { name: 'May', value: 6000 },
  //   { name: 'Jun', value: 5500 },
  // ];

  // const pieData = {
  //   labels: crateData.tokens.map(token => token.name),
  //   datasets: [
  //     {
  //       data: crateData.tokens.map(token => token.quantity),
  //       backgroundColor: crateData.tokens.map((_, index) => `hsl(${50 + index * 80 / crateData.tokens.length}, 70%, ${50 + index * 10 / crateData.tokens.length}%)`),
  //       borderColor: '#228B22', // Forest Green for borders
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  // const pieOptions = {
  //   cutout: '50%', // Makes it a donut chart
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       display: false,
  //     },
  //     tooltip: {
  //       callbacks: {
  //         label: (context: any) => {
  //           const token = crateData.tokens[context.dataIndex];
  //           return `${token.name}: ${token.quantity}%`;
  //         },
  //       },
  //     },
  //   },
  //   elements: {
  //     arc: {
  //       borderWidth: 0,
  //     },
  //   },
  // };

  // const renderTokenIcons = () => {
  //   return crateData.tokens.map((token, index) => {
  //     const angle = (index / crateData.tokens.length) * 2 * Math.PI - Math.PI / 2;
  //     const radius = 80; // Adjust this value to position icons
  //     const x = Math.cos(angle) * radius + 100; // 100 is half of chart size
  //     const y = Math.sin(angle) * radius + 100;

  //     return (
  //       <img
  //         key={token.id}
  //         src={tokenData.find(t => t.symbol === token.symbol)?.logoURI || `/path/to/${token.symbol}-icon.png`}
  //         alt={token.name}
  //         className="absolute w-8 h-8 rounded-full"
  //         style={{
  //           left: `${x}px`,
  //           top: `${y}px`,
  //           transform: 'translate(-50%, -50%)',
  //         }}
  //       />
  //     );
  //   });
  // };

  // const pieOptions = {
  //   cutout: '50%', // Makes it a donut chart
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       display: false,
  //     },
  //   },
  // };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#0A1019] to-[#02050A] text-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 md:pl-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-lime-400 mb-4 md:mb-0">{crateData.name}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2 bg-gray-800/10 rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Performance</h2>
              <select className="bg-gray-700/10 rounded px-2 py-1">
                <option>All</option>
              </select>
            </div>
            <div className="h-64 md:h-80">
              {/* <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              */}
              <CombinedPriceChart tokens={crateData.tokens} />
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span>↑ {crateData.upvotes}</span>
              <span>↓ {crateData.downvotes}</span>
              <span>Created by: {truncate(crateData.creator.name , 10)}</span>
            </div>
          </div>
          <div className="space-y-8">
          <div>
<CrateValueDisplay crateData={crateData} />

          </div> 
            <BuySellSection
              inputAmount={inputAmount}
              handleInputChange={handleInputChange}
              handleGetQuotes={handleGetQuotes}
              swapQuotes={swapQuotes}
              handleSwap={handleSwap}
            />
            <ReturnCalculator
              returnAmount={returnAmount}
              investmentPeriod={investmentPeriod}
              setInvestmentPeriod={setInvestmentPeriod}
            />
          </div>
        </div>
        <div className='md:mb-0 mb-20'>
        <TokenSplit crateData={crateData} />
        </div>
      </div>
      <SideBarPhone />
    </div>
  );
};

export default CrateDetailPage;