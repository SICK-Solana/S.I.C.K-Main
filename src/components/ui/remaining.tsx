import { useState, useEffect } from 'react';
import CrateCard from "../CrateCard";
import { useWallet } from '@solana/wallet-adapter-react';
import fetchUserData from '../../constants/fetchUserData';
import Loader from '../../components/Loading';
import useCrateCharts from '../../pages/explorecrate/useCrateCharts';
import { Connection } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
interface User {
  name: string;
}

interface Token {
  icon: string;
  percentage: number;
  coingeckoId: string;
  id: string;
  symbol: string;
  name: string;
  quantity: number;
}

interface Crate {
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
  creator: { name: string };
}

export default function CryptoDashboard() {
  const [bookmarkedCrates, setBookmarkedCrates] = useState<Crate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOption, setSortOption] = useState<string>('createdAt');
  const { publicKey } = useWallet();
  const { chartsData, weightedPriceChanges } = useCrateCharts(bookmarkedCrates);
  const [solBalance, setSolBalance] = useState<number>(0);

  const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user: User = userData ? JSON.parse(userData) : { name: "User" };
  const truncatedName = user.name.length > 10 ? user.name.substring(0, 10) + "..." : user.name;

  useEffect(() => {
    const fetchAndSetUserData = async () => {
      setLoading(true);
      try {
        const user = await fetchUserData(publicKey?.toString());
        if (user?.id) {
          console.log(user);
          const response = await fetch(`https://sickb.vercel.app/api/crates/${user.id}/bookmark`);
          if (!response.ok) {
            throw new Error('Failed to fetch bookmarked crates');
          }
          const data: Crate[] = await response.json();
          setBookmarkedCrates(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
      if (publicKey) {
        const balance = await connection?.getBalance(publicKey);
        console.log(balance);
        setSolBalance(balance / LAMPORTS_PER_SOL);
      }

    };

    fetchAndSetUserData();
  }, [publicKey]);

  
  const [solPrice, setSolPrice] = useState<number | 1>(1);

      const fetchSolPrice = async () => {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch SOL price");
        }
        const data = await response.json();
        setSolPrice(data.solana.usd);
        return data.solana.usd;
      }

  const handleSort = (option: string) => {
    setSortOption(option);
    const sortedCrates = [...bookmarkedCrates].sort((a, b) => {
      if (option === 'upvotes') return b.upvotes - a.upvotes;
      if (option === 'downvotes') return b.downvotes - a.downvotes;
      if (option === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
    setBookmarkedCrates(sortedCrates);
  };
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=d1ec9af2-889c-4759-88c1-a7ea87b0fc40');


  return (
    <div className="bg-[#0d1117] w-full md:w-[calc(100%-5rem)] min-h-screen p-4 sm:p-6 md:ml-20 font-mono text-white mb-20">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-xl sm:text-2xl bg-gradient-to-b from-[#FFFFFF] to-[#494949] bg-clip-text text-transparent mb-4 sm:mb-0">
          hello_{truncatedName} (&gt;_•)
        </h1>
      </header>


      <div className="bg-gradient-to-b from-[#111817] to-[#070C14] font-mono rounded-xl mb-10 ">
        <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl">
          <div className="border p-4 sm:p-6 border-[rgb(34,49,21)] sm:rounded-l-xl max-sm:rounded-t-xl">
            <p className="text-[#238636] text-sm mb-2">▲ 🚀</p>
            <h2 className="text-4xl sm:text-6xl font-semibold bg-gradient-to-b from-[#B7FC24] to-[#486900] bg-clip-text text-transparent">
              $Sol {solBalance.toFixed(2)}

            </h2>
            <p className='mt-2 text-lg font-semibold text-zinc-300'>$ {solPrice * solBalance} USD</p>
            <p className="text-gray-400 mt-2">current_value</p>
          </div>
          <div className="border p-4 sm:p-6 border-[#223115] text-sm sm:text-md text-center">
            {/* <p className="mb-2 text-gray-400">invested_value: $1800</p> */}
            <p className="mb-2 text-gray-400">
              SOL_balance: <span className="text-[#B6FF1B]">{solBalance.toFixed(2)} SOL</span>
            </p>
            <p className="text-gray-400">
            $ {solPrice * solBalance} USD
            </p>
          </div>
          <div className="text-right p-4 sm:p-6 border border-[#223115] max-sm:rounded-b-xl sm:rounded-r-xl">
            <a href="/cratecreator" className="text-[#238636] hover:underline text-sm">
              create_crate ↗
            </a>
          </div>
        </div>
      </div>
      <main>
        <h3 className="text-[#B6FF1B] text-sm ">// crates</h3>
        <h2 className="text-xl sm:text-2xl mb-4 text-gray-400">saved</h2>

        <div className="mb-6 md:mb-8 flex flex-wrap items-center gap-2 md:gap-4">
          <button
            onClick={() => handleSort('createdAt')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
              sortOption === 'createdAt'
                ? 'bg-[#B6FF1B] text-black shadow-lg shadow-[#B6FF1B]/20'
                : 'bg-[#1C2128] text-white hover:bg-[#2D3748] hover:shadow-md'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => handleSort('upvotes')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
              sortOption === 'upvotes'
                ? 'bg-[#B6FF1B] text-black shadow-lg shadow-[#B6FF1B]/20'
                : 'bg-[#1C2128] text-white hover:bg-[#2D3748] hover:shadow-md'
            }`}
          >
            Most Upvotes
          </button>
          <button
            onClick={() => handleSort('downvotes')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
              sortOption === 'downvotes'
                ? 'bg-[#B6FF1B] text-black shadow-lg shadow-[#B6FF1B]/20'
                : 'bg-[#1C2128] text-white hover:bg-[#2D3748] hover:shadow-md'
            }`}
          >
            Most Downvotes
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : bookmarkedCrates.length === 0 ? (
          <div className="text-xl sm:text-2xl bg-gradient-to-b from-[#494949] to-[#ffffff] bg-clip-text text-transparent mb-4 sm:mb-0">No saved crates yet &#58;&#40;</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {bookmarkedCrates.map((crate) => (
              <a href={`/crates/${crate.id}`} className="transform transition-all duration-300 hover:scale-105" key={crate.id}>
                <CrateCard
                  chartData={chartsData[crate.id]}
                  title={crate.name}
                  creator={crate.creator?.name || 'Unknown'} // Added a fallback in case creator is undefined
                  subtitle={`Created: ${new Date(crate.createdAt).toLocaleDateString()}`}
                  percentage={0} // Placeholder
                  tokens={crate.tokens}
                  weightedPriceChange={weightedPriceChanges[crate.id] || 0}
                  upvotes={crate.upvotes}
                  downvotes={crate.downvotes}
                />
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
