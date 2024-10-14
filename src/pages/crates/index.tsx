import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';

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
import OktoAuthButton from '../../components/OktoAuthButton.tsx'

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

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

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a95e3765-35c7-459e-808a-9135a21acdf6');

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

const useSwap = (crateData: CrateData) => {
 
  const { publicKey, signAllTransactions, sendTransaction } = useWallet();

  const swap = async (quoteResults: SwapQuote[]) => {
    if (!publicKey || !signAllTransactions || !sendTransaction) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const transactions: VersionedTransaction[] = [];

      // Create a transaction for swapping tokens
      for (const quoteResult of quoteResults) {
        const swapObj = await getSwapObj(publicKey.toString(), quoteResult.quote);
        const swapTransactionBuf = Buffer.from(swapObj.swapTransaction, "base64");
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        transactions.push(transaction);
      }

      // Create additional transactions for the transfers
      const transferToStaticWallet = new VersionedTransaction(
        new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          instructions: [
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey("SicKRgxa9vRCfMy4QYzKcnJJvDy1ojxJiNu3PRnmBLs"),
              lamports: 1000000,  // 1,000,000 lamports
            })
          ],
        }).compileToV0Message()
      );

      const transferToCreatorWallet = new VersionedTransaction(
        new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          instructions: [
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey(crateData.creator.walletAddress),
              lamports: 1000000, 
            })
          ],
        }).compileToV0Message()
      );

      transactions.push(transferToStaticWallet);
      transactions.push(transferToCreatorWallet);

      // Sign and send all transactions
      const signedTransactions = await signAllTransactions(transactions);

      for (const signedTx of signedTransactions) {
        const signature = await sendTransaction(signedTx, connection);
        console.log("Transaction: https://explorer.solana.com/tx/" + signature);
      }

      return "Swap and transfer completed successfully";
    } catch (error) {
      console.error("Error while swapping", error);
      throw error;
    }
  };

  return { swap };
};
const CrateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crateData, setCrateData] = useState<CrateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
// @ts-ignore
  const [quoteResults, setQuoteResults] = useState<SwapQuote[] | null>(null);
  const [returnAmount] = useState<number>(479);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'SOL'>('SOL');
  const [loadingvote, setLoadingvote] = useState(false);

  const { swap } = useSwap(crateData!);

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

  const getSwapQuotes = async (tokenAllocations: { mint: string; amount: number }[]): Promise<SwapQuote[]> => {
    try {
      console.log('tokenAllocations', tokenAllocations);  
  
      const inputMint = selectedCurrency === 'USDC' ? USDC_MINT : SOL_MINT;
      const inputDecimals = selectedCurrency === 'USDC' ? 6 : 9;  // USDC has 6 decimals, SOL has 9
      
      const quotePromises = tokenAllocations.map(async ({ mint, amount }) => {
        try {
            // Convert amount to lamports or USDC atomic units
        const atomicAmount = Math.floor(amount * Math.pow(10, inputDecimals));
        
          const quote = await getQuote(inputMint, mint, atomicAmount);
          console.log(`Quote for ${mint}:`, quote);
          const token = tokenData.find(t => t.address === mint);
          return token ? { symbol: token.symbol, quote } : null;
        } catch (error) {
          console.error(`Error getting quote for token ${mint}:`, error);
          return null;
        }
      });
  
      const results = await Promise.all(quotePromises);
      return results.filter((result): result is SwapQuote => result !== null);
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
      console.log(quotes);
  
      // Immediately proceed to swap after getting quotes
      await onSwap(quotes);
    } catch (err) {
      console.error("Error in getSwapQuotes:", err);
      setError("Failed to fetch swap quotes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onSwap = async (quotes: SwapQuote[]) => {
    if (!quotes || quotes.length === 0) {
      setError("No quotes available. Please get quotes first.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const result = await swap(quotes);
      console.log(`Swap successful:`, result);
      alert('purchase successful , find new tokens in your wallet');
      setQuoteResults(null); // Clear quotes after successful swaps
    } catch (error) {
      console.error('Swap failed:', error);
      setError("Swap failed. Please try again.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
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
        throw new Error('Failed to downvote. Status: ${response.status}');
      }
    } catch (error) {
      console.error("Failed to downvote:", error); // Debug
    } finally {
      setLoadingvote(false); // End loading
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
          <OktoAuthButton/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2 bg-gray-800/10 rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Performance</h2>
              <select className="bg-gray-700/10 rounded px-2 py-1">
                <option>All</option>
              </select>
            </div>
            <div className="h-fit">
              <CombinedPriceChart tokens={crateData.tokens} />
              <div className="flex gap-4 justify-between mt-4 text-sm">
              <div className="flex gap-4 justify-between mt-4 text-sm">
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
                <div className="text-[#b7ff1b98] md:mx-40  mx-11">
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
            handleGetQuotes={handleGetQuotes}
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
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
}

export default CrateDetailPage;