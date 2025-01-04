import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Buffer } from 'buffer';
import useTokenSwap from './useTokenSwap.ts';
import {
  createJupiterApiClient,
  QuoteGetRequest,
  QuoteResponse,
} from "@jup-ag/api";
import { BiArrowBack } from "react-icons/bi";
import BuySellSection from '../../components/chart/BuySellSection';
import TokenSplit from '../../components/chart/TokenSplit';
import BackendApi from '../../constants/api.ts';
import tokenData from '../../pages/createcrate/tokens.json';
import CombinedPriceChart from './CombinedPriceChart.tsx';
// import CrateValueDisplay from './CombinedTokenPrice.tsx';
import truncate from '../../constants/truncate.ts';

// Types and interfaces
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
};

// Buffer setup for window
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const jupiterQuoteApi = createJupiterApiClient();

// API functions
export async function getQuote(inputMint: string, outputMint: string, amount: number) {
  const params: QuoteGetRequest = {
    inputMint,
    outputMint,
    amount,
    autoSlippage: true,
    autoSlippageCollisionUsdValue: 1_000,
    maxAutoSlippageBps: 1000,
    minimizeSlippage: true,
    onlyDirectRoutes: false,
    asLegacyTransaction: false,
  };
  
  const quote = await jupiterQuoteApi.quoteGet(params);
  if (!quote) throw new Error("unable to quote");
  return quote;
}

export async function getSwapObj(wallet: string, quote: QuoteResponse) {
  return await jupiterQuoteApi.swapPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: wallet,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    },
  });
}

const CrateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crateData, setCrateData] = useState<CrateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [quoteResults, setQuoteResults] = useState<SwapQuote[] | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'SOL'>('SOL');
  const { bulkSwap } = useTokenSwap();

  useEffect(() => {
    const fetchCrateData = async () => {
      try {
        const response = await fetch(`${BackendApi}/crates/${id}`);
        if (!response.ok) throw new Error('Failed to fetch crate data');
        const data: CrateData = await response.json();
        setCrateData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCrateData();
  }, [id]);

  const handleSwap = async () => {
    const swapOptions = {
      tokens: crateData?.tokens.map(token => ({
        symbol: token.symbol,
        mint: tokenData.find(t => t.symbol === token.symbol)?.address || '',
        quantity: token.quantity
      })),
      inputAmount: parseFloat(inputAmount),
      inputCurrency: selectedCurrency
    };
  
    try {
      await bulkSwap(swapOptions);
    } catch (error) {
      alert('Purchase failed');
    }
  };

  if (loading) return <div className="h-screen" />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  
  if (!crateData) return <div className="text-gray-400">No crate data found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1019] to-[#02050A] text-white">
    <div className="flex-1 p-4 md:p-8">
      {/* Header */}
      <header className="flex md:pr-[900px] mb-8">
        <button 
          onClick={() => window.history.back()} 
          className="hover:opacity-80 transition-opacity"
        >
          <BiArrowBack size={20} className="cursor-pointer" />
        </button>
        
        <h1 className="flex items-center gap-2 mx-auto text-2xl md:text-3xl font-bold text-lime-400">
          <div className="w-10 h-10 overflow-hidden rounded-full">
            <img 
              src={crateData.image} 
              alt={`${crateData.name} icon`}
              className="w-full h-full object-cover"
            />
          </div>
          {crateData.name}
        </h1>

        <a href="" className="text-white font-bold text-xl pr-12">
          Share on X
        </a>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
        {/* Left Column - now spans 4 columns out of 7 */}
        <div className="md:col-span-4 bg-gray-600/10 rounded-xl p-4 md:p-16">
          <div className="flex flex-col justify-between gap-4 md:gap-12">
            {/* Chart Controls */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-semibold">Performance</h2>
              <select className="bg-gray-100/90 text-black rounded px-3 py-1.5">
                {['1 hr', '6 hr', '24 hr', '7 day'].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Chart */}
            <div className="w-full h-48">
              <CombinedPriceChart tokens={crateData.tokens} />
            </div>

            {/* Creator Info */}
            <div className="flex justify-end items-center text-sm">
              <span className="text-lime-400/60">
                Created by:{' '}
                <a href="#" className="underline font-medium text-lime-400 hover:text-lime-300">
                  {truncate(crateData.creator.name, 10)}
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - now spans 3 columns out of 7 */}
        <div className="md:col-span-3 space-y-8">
          <BuySellSection
            inputAmount={inputAmount}
            handleInputChange={(e) => setInputAmount(e.target.value)}
            handleGetQuotes={handleSwap}
          />
          <TokenSplit crateData={crateData} />
        </div>
      </div>
    </div>
  </div>

  );
}

export default CrateDetailPage;