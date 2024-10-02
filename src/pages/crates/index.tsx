import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {  Connection, VersionedTransaction } from '@solana/web3.js';
// wallet 
import { useWallet } from '@solana/wallet-adapter-react';
import { QuoteResponse } from '@jup-ag/api';
import { Buffer } from 'buffer';
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
import { FaChevronLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';


// import handleSwap from './handleSwap.tsx';
const USDC_MINT = 'So11111111111111111111111111111111111111112';

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
  const wallet = useWallet();
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

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to the previous route
  };

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

  const handleSwap = async (quote: QuoteResponse, wallet: any) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      console.error('Wallet not connected');
      return;
    }

    try {
      console.log('Swapping:', quote);

      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=a95e3765-35c7-459e-808a-9135a21acdf6');

      // Prepare the swap request
      const swapRequestBody = {
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toString(),
        wrapUnwrapSOL: true
      };
//       const quoteResponse = await (
//         await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50')
//       ).json();
// console.log(quoteResponse);
      console.log('Swap Request Body:', swapRequestBody);

      const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(swapRequestBody)
      });

      if (!swapResponse.ok) {
        const errorText = await swapResponse.text();
        throw new Error(`Swap API error: ${swapResponse.status} ${errorText}`);
      }

      const swapResponseJson = await swapResponse.json();
      console.log('Swap Response:', swapResponseJson);

      if (!swapResponseJson.swapTransaction) {
        throw new Error('Swap transaction is missing from the response');
      }

      const swapTransactionBuf = Buffer.from(swapResponseJson.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      console.log('Deserialized transaction:', transaction);

      const signedTransaction = await wallet.signTransaction(transaction);

      const rawTransaction = signedTransaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
      });

      console.log('Transaction sent:', txid);
      await connection.confirmTransaction(txid);
      console.log('Transaction confirmed:', txid);

      return txid;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  };
  const getSwapQuotes = async (tokenAllocations: { mint: string; amount: number }[]) => {
    try {
      console.log('tokenAllocations', tokenAllocations);

      const quotePromises = tokenAllocations.map(async ({ mint, amount }) => {
        try {
          const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${USDC_MINT}&outputMint=${mint}&amount=${Math.floor(amount * 1000000)}&slippageBps=50`;
          const response = await fetch(quoteUrl);
          const quote: QuoteResponse = await response.json();
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
      console.log(quotes);
    } catch (err) {
      console.error("Error in getSwapQuotes:", err);
      setError("Failed to fetch swap quotes. Please try again later.");
      
    } finally {
      setLoading(false);
    }
  };

  const onSwap = async () => {
    if (!quoteResults || quoteResults.length === 0) {
      setError("No quotes available. Please get quotes first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (const result of quoteResults) {
        const txid = await handleSwap(result.quote, wallet);
        console.log(`Swap successful for ${result.mint}, transaction ID:`, txid);
      }
      // Update UI or state as needed after all swaps are complete
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#0A1019] to-[#02050A] text-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 md:pl-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className='flex items-center gap-2'>
          <FaChevronLeft onClick={handleBack} className='cursor-pointer h-5'/>
          <h1 className="text-2xl md:text-3xl font-bold text-lime-400 mb-4 md:mb-0">{crateData.name}</h1>
          </div>
          
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
              <div className='flex gap-2 p-2 rounded-full border items-center border-white/20 bg-gradient-to-b from-[#ffffff]/[10%] to-[#999999]/[10%]'>
              <div className="cursor-pointer pr-1 border-r border-gray-600"> <img src="/upvote.png" className='h-6' alt="" /></div>
              <div className='font-medium px-1 text-[#B6FF1B]'>{crateData.upvotes - crateData.downvotes}</div>
              <div className="cursor-pointer pl-1 border-l border-gray-600"> <img src="/downvote.png" className='h-6' alt="" /> </div>
              </div>
              <span className="text-[#b7ff1b98]">Created by: <a href="" className='underline text-medium text-[#B6FF1B]'>{truncate(crateData.creator.name, 10)}</a></span>
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
              swapQuotes={[]}
              handleSwap={onSwap}
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
              onClick={()=>{console.log('close')}} 
              className="mt-4 bg-lime-500 text-black px-4 py-2 rounded hover:bg-lime-600 transition-colors"
            >
              Close
            </button>
            <button 
  onClick={onSwap} 
  className="mt-4 bg-lime-500 text-black px-4 py-2 rounded hover:bg-lime-600 transition-colors"
>
  Swap
</button>
          </div>
        </div>
      )}
    </div>
  

  );
}


export default CrateDetailPage;