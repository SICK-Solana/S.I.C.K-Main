import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/sidebar.tsx';
import SideBarPhone from '../../components/ui/sidebarPhone.tsx';
import CrateCard from '../../components/CrateCard';


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
  tokens: { icon: string; percentage: number }[];
}

const ExploreCrate: React.FC = () => {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [sortOption, setSortOption] = useState<string>('createdAt');

  useEffect(() => {
   
    const fetchCrates = async () => {
      try {
        const response = await fetch('https://sickb.vercel.app/api/crates');
        const data = await response.json();
        setCrates(data);
      } catch (error) {
        console.error('Error fetching crates:', error);
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
    <div className="flex flex-col md:flex-row bg-[#0D1117] text-white min-h-screen">
      <Sidebar  />
      <div className="flex-1 p-4 md:p-8 md:ml-20 mb-20 md:mb-0">
        <h1 className="text-4xl md:text-6xl mb-6 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#B6FF1B] to-[#1c9b00] font-sans">explore<span className="text-lime-500">_</span>Crates</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {crates.map((crate) => (
         <a href={`/crates/${crate.id}`} className="transform transition-all duration-300 hover:scale-105">   
           <CrateCard
              key={crate.id}
              title={crate.name}
              subtitle={`Created: ${new Date(crate.createdAt).toLocaleDateString()}`}
              percentage={0} // Placeholder
              tokens={[]} // Placeholder
              upvotes={crate.upvotes}
              downvotes={crate.downvotes}
            />
          </a>
          ))}
        </div>
      </div>
      <SideBarPhone  />
    </div>
  );
};

export default ExploreCrate;