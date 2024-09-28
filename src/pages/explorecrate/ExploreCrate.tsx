import React, { useState, useEffect } from 'react';
import { Bookmark, HousePlus, ThumbsUp, ThumbsDown } from 'lucide-react';
import Sidebar from '../../components/ui/sidebar.tsx';
import SideBarPhone from '../../components/ui/sidebarPhone.tsx';

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
}

interface CrateCardProps {
  title: string;
  subtitle: string;
  percentage: number;
  tokens: { icon: string; percentage: number }[];
  isFilled?: boolean;
  handleClick?: () => void;
  upvotes: number;
  downvotes: number;
  onUpvote: () => void;
  onDownvote: () => void;
}

const CrateCard: React.FC<CrateCardProps> = ({
  title,
  subtitle,
  percentage,
  tokens,
  isFilled,
  handleClick,
  upvotes,
  downvotes,
  onUpvote,
  onDownvote,
}) => {
  return (
    <div
      className={`p-4 rounded-lg cursor-pointer ${
        isFilled
          ? "bg-gradient-to-b from-[#121019] to-[#070A12]"
          : "bg-gradient-to-b from-[#191010] to-[#070A12]"
      }`}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        {/* Icon and Title */}
        <div className="flex items-center">
          <HousePlus className="mr-2" />
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <Bookmark onClick={handleClick} />
      </div>
      <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
      {/* Token Split Section */}
      <div className="mb-4">
        <p className="text-sm font-semibold mb-2">Token Split:</p>
        {tokens.map((token, index) => (
          <div key={index} className="flex items-center mb-1">
            <img src={token.icon} alt="Token Icon" className="w-4 h-4 mr-2" />
            {token.percentage > 0 && (
              <span className="text-sm">{token.percentage}%</span>
            )}
          </div>
        ))}
      </div>
      {/* Growth Section */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold">Growth</span>
        <span className="text-sm font-bold text-green-500">{percentage}%</span>
      </div>
      {/* Voting Section */}
      <div className="flex justify-between items-center mt-4">
        <button onClick={onUpvote} className="flex items-center">
          <ThumbsUp size={16} className="mr-1" />
          <span>{upvotes}</span>
        </button>
        <button onClick={onDownvote} className="flex items-center">
          <ThumbsDown size={16} className="mr-1" />
          <span>{downvotes}</span>
        </button>
      </div>
    </div>
  );
};

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

  const handleUpvote = (id: string) => {
    setCrates(crates.map(crate => 
      crate.id === id ? { ...crate, upvotes: crate.upvotes + 1 } : crate
    ));
  };

  const handleDownvote = (id: string) => {
    setCrates(crates.map(crate => 
      crate.id === id ? { ...crate, downvotes: crate.downvotes + 1 } : crate
    ));
  };

  return (
    <div className="flex text-white">
      <Sidebar />
      <div className="flex-1 p-4 md:ml-20 mb-20 md:mb-0">
        <h1 className="text-2xl font-bold mb-4 text-black">Explore Crates</h1>
        <div className="mb-4">
          <label htmlFor="sort" className="mr-2 text-black">Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => handleSort(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded"
          >
            <option value="createdAt">Newest</option>
            <option value="upvotes">Most Upvotes</option>
            <option value="downvotes">Most Downvotes</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crates.map((crate) => (
         <a href={`/crates/${crate.id}`}>   <CrateCard
              key={crate.id}
              title={crate.name}
              subtitle={`Created: ${new Date(crate.createdAt).toLocaleDateString()}`}
              percentage={0} // Placeholder
              tokens={[]} // Placeholder
              upvotes={crate.upvotes}
              downvotes={crate.downvotes}
              onUpvote={() => handleUpvote(crate.id)}
              onDownvote={() => handleDownvote(crate.id)}
            />
            </a>
          ))}
        </div>
      </div>
      <SideBarPhone />
    </div>
  );
};

export default ExploreCrate;