import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Buffer } from 'buffer';
import useTokenSwap from './useTokenSwap.ts';
import {
  createJupiterApiClient,
  QuoteGetRequest,
  QuoteResponse,
} from "@jup-ag/api";

import Sidebar from '../../components/ui/sidebar.tsx';
import SideBarPhone from '../../components/ui/sidebarPhone.tsx';
import BuySellSection from '../../components/chart/BuySellSection';
import ReturnCalculator from '../../components/chart/ReturnCalculator';
import TokenSplit from '../../components/chart/TokenSplit';
import BackendApi from '../../constants/api.ts';
import tokenData from '../../pages/createcrate/tokens.json';
import CombinedPriceChart from './CombinedPriceChart.tsx';
import CrateValueDisplay from './CombinedTokenPrice.tsx';
import truncate from '../../constants/truncate.ts';
import Loader from '../../components/Loading.tsx';
import { BiArrowBack } from "react-icons/bi";
// import OktoAuthButton from '../../components/OktoAuthButton.tsx'

// const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
// const SOL_MINT = 'So11111111111111111111111111111111111111112';

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
};


const jupiterQuoteApi = createJupiterApiClient();

export async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number
) {
  const params: QuoteGetRequest = {
    inputMint: inputMint,
    outputMint: outputMint,
    amount: amount,
    autoSlippage: true,
    autoSlippageCollisionUsdValue: 1_000,
    maxAutoSlippageBps: 1000,
    minimizeSlippage: true,
    onlyDirectRoutes: false,
    asLegacyTransaction: false,
  };
  const quote = await jupiterQuoteApi.quoteGet(params);
  if (!quote) {
    throw new Error("unable to quote");
  }
  return quote;
}

export async function getSwapObj(wallet: string, quote: QuoteResponse) {
 
  const swapObj = await jupiterQuoteApi.swapPost({
    swapRequest: {
      quoteResponse: quote,
      userPublicKey: wallet,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    },
  });
 
  return swapObj;
}


const CrateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crateData, setCrateData] = useState<CrateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
// @ts-ignore
  const [quoteResults, setQuoteResults] = useState<SwapQuote[] | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'SOL'>('SOL');
  const [loadingvote, setLoadingvote] = useState(false);
  const { bulkSwap } = useTokenSwap();



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

  

 
  
  if (loading) return <div className=' h-screen'> <div className='mt-72'><Loader /></div>  <Sidebar/> <SideBarPhone/></div>;
  if (error) return <div>Error: {error}</div>;
  if (!crateData) return <div>No crate data found</div>;

  const userId = "cm1ispv1h0001aafmawouos0i";
  const handleUpvote = async () => {
    setLoadingvote(true); // Start loading
    console.log("Upvoting crate:", id, "by user:", userId); // Debug
    try {
      const response = await fetch(
        `https://sickb.vercel.app/api/crates/${id}/upvote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userId, // Passing the user ID in the body
          }),
        }
      );
      if (response.ok) {
        console.log("Upvote successful"); // Debug
        setCrateData((prevState: any) => ({
          ...prevState,
          upvotes: prevState.upvotes + 1,
        }));
      } else {
        throw new Error('Failed to upvote. Status: ${response.status}');
      }
    } catch (error) {
      console.error("Failed to upvote:", error); // Debug
    } finally {
      setLoadingvote(false); // End loading
    }
  };
  const handleDownvote = async () => {
    setLoadingvote(true);
    console.log("Downvoting crate:", id, "by user:", userId); // Debug
    try {
      const response = await fetch(
        `https://sickb.vercel.app/api/crates/${id}/downvote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userId, // Passing the user ID in the body
          }),
        }
      );
      if (response.ok) {
        console.log("Downvote successful"); // Debug
        setCrateData((prevState: any) => ({
          ...prevState,
          downvotes: prevState.downvotes + 1,
        }));
      } else {
        throw new Error(`Failed to downvote. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to downvote:", error); // Debug
    } finally {
      setLoadingvote(false); // End loading
    }
  };

      


  const handleSwap = async () => {
    const swapOptions = {
      tokens: crateData.tokens.map(token => ({
        symbol: token.symbol,
        mint: tokenData.find(t => t.symbol === token.symbol)?.address || '',
        quantity: token.quantity
      })),
      inputAmount: parseFloat(inputAmount),
      inputCurrency: selectedCurrency
    };
  
    try {
      const results = await bulkSwap(swapOptions);
      console.log('Swap results:', results);
      alert('purchase successful , find new tokens in your wallet');
    } catch (error) {
      // Handle swap error
      alert('purchase failed');
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#0A1019] to-[#02050A] text-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 md:pl-24">
        <div className="relative flex items-center mb-8">
          <div onClick={() => { window.history.back() }} className="">
            <BiArrowBack size={20} className='cursor-pointer' />
          </div>
          <h1 className="text-2xl flex justify-center items-center gap-2 md:text-3xl font-bold text-lime-400 mx-auto">
            <div className='w-10 rounded-full h-10'>
              <img className='rounded-full' src={crateData.image} alt="icon" />
            </div>
            {crateData.name}
          </h1>
</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2 bg-gray-600/10 rounded-xl p-4 md:p-6">
           <div className="flex flex-col justify-between gap-20 max-sm:gap-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Performance</h2>
              <select className="bg-gray-700/10 rounded px-2 py-1">
                <option>All</option>
              </select>
            </div>
            <div className="h-fit">
              <CombinedPriceChart tokens={crateData.tokens} />
              
            </div>
            <div className="flex gap-4 w-full mt-4 text-sm">
              <div className="flex gap-4 justify-between items-center w-full mt-4 text-sm">
                <div className="flex gap-3 p-2 min-w-[120px] rounded-full border items-center border-white/20 bg-gradient-to-b from-[#ffffff]/[10%] to-[#999999]/[10%]">
                  {loadingvote ? (
                    <div className="flex justify-center items-center max-h-[20px] w-full">
                      <div className="newtons-cradle">
                        <div className="newtons-cradle__dot"></div>
                        <div className="newtons-cradle__dot"></div>
                        <div className="newtons-cradle__dot"></div>
                        <div className="newtons-cradle__dot"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="cursor-pointer space-x-2 pr-1 flex flex-row"
                        onClick={handleUpvote}
                      >
                        <img src="/upvote.png" className="h-6" alt="Upvote" />
                        <div className="font-medium text-[#B6FF1B] text-center">
                          {crateData.upvotes}
                        </div>
                      </div>
                      <div
                        className="cursor-pointer space-x-2 pl-1 border-l border-gray-600 flex flex-row"
                        onClick={handleDownvote}
                      >
                        <img
                          src="/downvote.png"
                          className="h-6"
                          alt="Downvote"
                        />
                        <div className="font-medium text-[#FF4B4B] text-center">
                          {crateData.downvotes}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-[#b7ff1b98]">
                  Created by:{" "}
                  <a href="" className="underline text-medium text-[#B6FF1B]">
                    {truncate(crateData.creator.name, 10)}
                  </a>
                </div>
                </div>
              </div>
           </div> 
          </div>
          <div className="space-y-8">
            <div>
              <CrateValueDisplay crateData={crateData} />
            </div> 
            <BuySellSection
            inputAmount={inputAmount}
            handleInputChange={handleInputChange}
            handleGetQuotes={handleSwap}
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
          />
            <ReturnCalculator
              crateData={crateData}
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
}

export default CrateDetailPage;
