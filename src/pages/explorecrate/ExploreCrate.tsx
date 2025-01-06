// @ts-nocheck
import '../../index.css'
import React, { useState, useEffect } from 'react';
// import Sidebar from '../../components/ui/sidebar.tsx';
// import SideBarPhone from '../../components/ui/sidebarPhone.tsx';
import CrateCard from '../../components/CrateCard';
import Loader from '../../components/Loading';
import useCrateCharts from './useCrateCharts.tsx';



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
  [x: string]: any;
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

const ExploreCrate: React.FC = () => {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [sortOption, setSortOption] = useState<string>('createdAt');
  const [loading, setLoading] = useState<boolean>(true);
  const {  chartsData , weightedPriceChanges } = useCrateCharts(crates);
   useEffect(() => {
    const fetchCrates = async () => {
      try {
        const response = await fetch('https://sickb.vercel.app/api/crates');
        const data = await response.json();
        // Sort by 'createdAt' by default
        const sortedData = data.sort((a: Crate, b: Crate) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setCrates(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crates:', error);
        setLoading(false);
      }
    };

    fetchCrates();
  }, []);

  const handleSort = (option: string) => {
    setSortOption(option);
    const sortedCrates = [...crates].sort((a, b) => {
      if (option === 'upvotes') return b.upvotes - a.upvotes;
      if (option === 'downvotes') return b.downvotes - a.downvotes;
      if (option === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
    setCrates(sortedCrates);
  };




  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-b from-[#0A1019] to-[#02050A] text-white min-h-screen pt-20 md:pt-32">
      
      <div className="flex-1 pr-4 pl-4 pb-4 md:ml-20 mb-20 md:mb-0">
        
           
        
        <div className='flex justify-between items-center'>
        
        <h1 className="text-4xl md:text-6xl mb-6 md:mb-12 text-lime-100 jersey-10-regular">explore<span className="text-lime-500">_</span>Crates <span role="img" className='text-md md:text-md' aria-label="compass">🧭</span></h1>
        </div>
      
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
        ) : (
          <>
 {console.log(crates)}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {crates.map((crate) => (
             
              <a href={`/crates/${crate.id}`} className="transform transition-all duration-300 hover:scale-105" key={crate.id}>
                <CrateCard
                  chartData={chartsData[crate.id]}
                  title={crate.name}
                  creator={crate.creator.name}
                  subtitle={`Created: ${new Date(crate.createdAt).toLocaleDateString()}`}
                  percentage={0} // Placeholder
                  tokens={crate.tokens}
                  weightedPriceChange={weightedPriceChanges[crate.id] || 0} // Placeholder
                  upvotes={crate.upvotes}
                  downvotes={crate.downvotes}
                />
              </a>
            ))}
          </div>
          </>
        )}
      </div>
      
    </div>
  );
};

export default ExploreCrate;