import React, { useState, useEffect } from 'react';
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
import CombinedPriceChart from './CombinedPriceChart.tsx';
import CrateValueDisplay from './CombinedTokenPrice.tsx';
import truncate from '../../constants/truncate.ts';

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

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
  coingeckoId: string;  
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
  const [quoteResults, setQuoteResults] = useState<any>(null);
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
    setInputAmount(e.target.value);
  };

  const getSwapQuotes = async (tokenAllocations: { mint: string; amount: number }[]) => {
    try {
      const jupiterApi = await createJupiterApiClient();

      const quotePromises = tokenAllocations.map(async ({ mint, amount }) => {
        try {
          const quote = await jupiterApi.quoteGet({
            inputMint: USDC_MINT,
            outputMint: mint,
            amount: Math.floor(amount * 1000000),
          });
          console.log(`Quote for ${mint}:`, quote);
          return { mint, quote };
        } catch (error) {
          console.error(`Error getting quote for token ${mint}:`, error);
          return null;
        }
      });

      const results = await Promise.all(quotePromises);
      return results.filter(result => result !== null);
    } catch (error) {
      console.error("Error fetching swap quotes:", error);
      throw error;
    }
  };

  const handleGetQuotes = async () => {
    if (!crateData || !inputAmount) return;

    setError(null);
    setLoading(true);

    const totalAmount = parseFloat(inputAmount);
    const tokenAllocations = crateData.tokens.map(token => ({
      mint: tokenData.find(t => t.symbol === token.symbol)?.address || '',
      amount: (totalAmount * token.quantity) / 100
    }));

    try {
      const quotes = await getSwapQuotes(tokenAllocations);
      setQuoteResults(quotes);
    } catch (err) {
      console.error("Error in getSwapQuotes:", err);
      setError("Failed to fetch swap quotes. Please try again later.");
    } finally {
      setLoading(false);
    }
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

  if (loading) return <div className='bg-black'>Loading... <Sidebar/> <SideBarPhone/></div>;
  if (error) return <div>Error: {error}</div>;
  if (!crateData) return <div>No crate data found</div>;

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
              <CombinedPriceChart tokens={crateData.tokens} />
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span>↑ {crateData.upvotes}</span>
              <span>↓ {crateData.downvotes}</span>
              <span>Created by: {truncate(crateData.creator.name, 10)}</span>
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
              swapQuotes={[]}
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
      {quoteResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-lime-400">Quote Results</h2>
            <ul className="space-y-4">
              {quoteResults.map(({ mint, quote }: { mint: string; quote: any }, index: number) => {
                const token = tokenData.find(t => t.address === mint);
                return (
                  <li key={index} className="bg-gray-700/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-lg flex items-center">
                        <img src={token?.logoURI} alt={token?.name} className="w-6 h-6 mr-2" />
                        {token?.symbol}
                      </strong>
                      <span className="text-lg text-lime-400">For {(quote.inAmount / 1e6).toFixed(2)} USDC</span>
                    </div>
                    <div className="text-xl font-bold text-green-400">
                       {(quote.outAmount / Math.pow(10, token?.decimals || 1)).toFixed(6)} {token?.symbol}
                    </div>
                  </li>
                );
              })}
            </ul>
            <button 
              onClick={() => setQuoteResults(null)} 
              className="mt-4 bg-lime-500 text-black px-4 py-2 rounded hover:bg-lime-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  

  );
}


export default CrateDetailPage;