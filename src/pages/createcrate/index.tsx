import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import debounce from 'lodash/debounce';
import BackendApi from '../../constants/api.ts';
import fetchUserData from '../../constants/fetchUserData.ts';
import SignUpPopup from './SignUpPopup.tsx' ; 
import { MdDelete } from 'react-icons/md';
import { useWallet } from "@solana/wallet-adapter-react"; 

interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  logoURI: string;
  tags: string[];
  isVerified: boolean;
  usdPrice: number;
  mcap: number;
  liquidity: number;
  holderCount: number;
  circSupply: number;
  totalSupply: number;
  fdv: number;
  cexes: string[];
  audit: {
    mintAuthorityDisabled: boolean;
    freezeAuthorityDisabled: boolean;
    topHoldersPercentage: number;
    highSingleOwnership: boolean;
  };
  stats24h: {
    priceChange: number;
    holderChange: number;
    liquidityChange: number;
  };
  organicScore: number;
  organicScoreLabel: string;
  ctLikes: number;
  smartCtLikes: number;
}

interface SelectedToken extends Token {
  allocation: number;
}

interface CrateData {
  name: string;
  tokens: {
    symbol: string;
    name: string;
    quantity: number;
  }[];
  totalCost: number;
  creatorId: string;
  picture: string;
}

const CrateCreator: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]); // static list for popular/trending
  const [searchResults, setSearchResults] = useState<Token[]>([]); // dynamic search
  const { publicKey } = useWallet();
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [crateName, setCrateName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalAllocation, setTotalAllocation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Fetch static token list for popular/trending
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://tokens.jup.ag/tokens?tags=verified');
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }
        const tokenData = await response.json();
        setTokens(tokenData);
      } catch (err) {
        console.error('Error fetching tokens:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTokens();
    checkLoginStatus();
  }, []);

  const searchTokens = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`https://datapi.jup.ag/v1/assets/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching tokens:', err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const distributeAllocations = (tokens: SelectedToken[]): SelectedToken[] => {
    const tokenCount = tokens.length;
    const equalAllocation = Math.floor(100 / tokenCount);
    const remainder = 100 % tokenCount;

    return tokens.map((token, index) => ({
      ...token,
      allocation: index === 0 ? equalAllocation + remainder : equalAllocation
    }));
  };

  const handleTokenSelect = (selectedToken: Token) => {
    if (selectedTokens.some(token => token.id === selectedToken.id)) {
      // Token is already selected, don't add it again
      return;
    }
    const newSelectedTokens = [...selectedTokens, { ...selectedToken, allocation: 0 }];
    const updatedTokens = distributeAllocations(newSelectedTokens);
    setSelectedTokens(updatedTokens);
    setTotalAllocation(100);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleAllocationChange = (index: number, value: string) => {
    const newSelectedTokens = [...selectedTokens];
    newSelectedTokens[index].allocation = Number(value);
    setSelectedTokens(newSelectedTokens);
    
    const newTotalAllocation = newSelectedTokens.reduce((sum, token) => sum + token.allocation, 0);
    setTotalAllocation(newTotalAllocation);
    
    if (newTotalAllocation > 100) {
      setError('Total allocation cannot exceed 100%');
    } else {
      setError('');
    }
  };

  const handleDeleteToken = (index: number) => {
    const newSelectedTokens = selectedTokens.filter((_, i) => i !== index);
    const updatedTokens = distributeAllocations(newSelectedTokens);
    setSelectedTokens(updatedTokens);
    setTotalAllocation(newSelectedTokens.length > 0 ? 100 : 0);
  };

  const checkLoginStatus = async () => {
    const creatorId = localStorage.getItem('creatorId');
  
    if (creatorId) {
      setIsLoggedIn(true);
    } else {
      let user;
        //@ts-nocheck
        console.log(publicKey?.toString());
        //@ts-nocheck
         user = await fetchUserData(publicKey?.toString());
      
      if (user) {
        localStorage.setItem('creatorId', user.id);
        setIsLoggedIn(true);
      }
    }
  };
  
  const handleCreateCrate = async () => {
    if (totalAllocation !== 100) {
      setError('Total allocation must be 100%');
      return;
    }

    const creatorId = localStorage.getItem('creatorId');
    if (!creatorId) {
      setError('Creator not found. Please log in again.');
      return;
    }

    const crateData: CrateData = {
      name: crateName,
      tokens: selectedTokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        quantity: token.allocation,
        coingeckoId: 'token.id' // The new API doesn't have coingeckoId, so we'll leave it empty
      })),
      totalCost: 0,
      creatorId,
      picture: selectedTokens[0].icon
    };
    setIsCreating(true);

    try {
      const response = await fetch(`${BackendApi}/crates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crateData)
      });

      if (!response.ok) throw new Error('Failed to create crate');

      const result = await response.json();
      console.log('Crate created:', result);
      window.location.href = '/';
    } catch (error) {
      if (error instanceof Error) {
        setError('Failed to create crate: ' + error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term);
        searchTokens(term);
      }, 300),
    []
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // For search dropdown
  const filteredTokens = useMemo(() => {
    if (!searchTerm) return [];
    return searchResults
      .filter(token => 
        !['SOL', 'WSOL', 'wSOL'].includes(token.symbol)
      )
      .slice(0, 20);
  }, [searchResults, searchTerm]);

  // For popular/trending sections
  const popularSymbols = [ 'ETH', 'JUP'];
  const trendingSymbols = [ 'PUMP'];
  const popularTokens = tokens.filter(token => popularSymbols.includes(token.symbol));
  const trendingTokens = tokens.filter(token => trendingSymbols.includes(token.symbol));

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-800 to-gray-900 text-white jersey-10-regular">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');
    </style>
    <div className="w-full  md:mt-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 mt-20 md:mt-32 sm:mb-12">
              <div className="flex items-center gap-4 mb-4 sm:mb-6">
                <img src="/forgeIcon.png" className="h-8 w-8 sm:h-12 sm:w-12 rounded-full" alt="Forge Icon" />
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-lime-400 to-green-500 text-transparent bg-clip-text">Crates</h1>
              </div>
              <h2 className="text-4xl sm:text-6xl mb-3 sm:mb-4">Forge your own crate</h2>
              <p className="text-gray-400 text-lg sm:text-xl">Create a custom token basket with your preferred allocations.</p>
            </div>
        {!isLoggedIn && <SignUpPopup />}

        <div className="space-y-6 sm:space-y-8">
        <input
            type="text"
            value={crateName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCrateName(e.target.value)}
            placeholder="Name your crate"
            className="w-full p-3 sm:p-4 bg-gray-800/30 border border-lime-500/30 rounded-xl text-white placeholder-gray-500 text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-300"
            />

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="relative">
            <input
              type="text"
              onChange={handleSearchChange}
              placeholder="Search tokens"
              className="w-full p-3 sm:p-4 bg-gray-800/30 border border-lime-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all duration-300"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lime-500"></div>
              </div>
            )}
            {filteredTokens.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-gray-800/90 backdrop-blur-md border border-lime-500/30 rounded-xl mt-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-lime-500/50 scrollbar-track-gray-800/50 z-10">
                {filteredTokens.map((token) => (
                  <div
                    key={token.id}
                    onClick={() => handleTokenSelect(token)}
                    className={`flex items-center p-4 hover:bg-gray-700/50 cursor-pointer border-b border-lime-500/30 last:border-b-0 transition-colors duration-200 ${
                      selectedTokens.some(selectedToken => selectedToken.id === token.id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <img src={token.icon} alt={token.name} className="w-8 h-8 mr-4 rounded-full" />
                    <span className="font-medium">{token.name} <span className="text-lime-400">({token.symbol})</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>

      
              <div className="p-4 bg-gray-800/30 border border-lime-500/30 rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Quick Search 🔍</h3>
                <p className="text-sm text-gray-400 mb-3">Type in the search box above to find tokens</p>
                <div className="text-sm text-lime-400">
                  <p>• Search by token name or symbol</p>
                  <p>• Real-time search results</p>
                </div>
              </div>

              <div className="p-4 bg-gray-800/30 border border-lime-500/30 rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Popular Tokens 💹</h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {popularTokens.map((token) => (
                    <label key={token.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={() => handleTokenSelect(token)}
                        checked={selectedTokens.some(t => t.id === token.id)}
                        disabled={selectedTokens.some(t => t.id === token.id)}
                        className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-lime-500 rounded focus:ring-lime-500 border-gray-300 bg-gray-700"
                      />
                      <div className="flex items-center space-x-2">
                        <img src={token.icon || token.logoURI} alt={token.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-600" />
                        <span className="text-sm sm:text-base">{token.symbol}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-800/30 border border-lime-500/30 rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Trending Tokens 🔥</h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {trendingTokens.map((token) => (
                    <label key={token.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={() => handleTokenSelect(token)}
                        checked={selectedTokens.some(t => t.id === token.id)}
                        disabled={selectedTokens.some(t => t.id === token.id)}
                        className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-lime-500 rounded focus:ring-lime-500 border-gray-300 bg-gray-700"
                      />
                      <div className="flex items-center space-x-2">
                        <img src={token.icon || token.logoURI} alt={token.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-600" />
                        <span className="text-sm sm:text-base">{token.symbol}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
      
          </div>

          {selectedTokens.map((token, index) => (
            <div key={token.id} className="flex items-center p-4 bg-gray-800/30 rounded-xl border border-lime-500/30 transition-all duration-300">
              <img src={token.icon} alt={token.name} className="w-10 h-10 mr-4 rounded-full" />
              <span className="flex-grow font-medium">{token.name} <span className="text-lime-400">({token.symbol})</span></span>
              <input
                type="number"
                value={token.allocation}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleAllocationChange(index, e.target.value)}
                className="w-24 p-2 bg-gray-700/50 border border-lime-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-white text-center"
                min="0"
                max="100"
              />
              <span className="ml-2 text-lime-400">%</span>
              <button
                onClick={() => handleDeleteToken(index)}
                className="p-2 bg-red-500 rounded-full ml-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
              >
                <MdDelete size={16} />
              </button>
            </div>
          ))}
                          
                       
                          <div className="mt-6 sm:mt-8">
                <div className="bg-gray-800/30 h-3 sm:h-4 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-lime-500 via-green-400 to-emerald-600 transition-all duration-500" style={{ width: `${totalAllocation}%` }}></div>
                </div>
                <div className="text-right text-lg sm:text-xl font-semibold text-lime-400 mt-2">   {totalAllocation}% allocated</div>
              </div>

          {error && (
            <div className="bg-red-900/30 text-red-200 p-4 rounded-xl border border-red-500/30 animate-pulse">
              {error}
            </div>
          )}

<div className="flex justify-center mt-8 sm:mt-12 pb-8 sm:pb-16">
<button 
              onClick={handleCreateCrate}
              disabled={totalAllocation !== 100 || selectedTokens.length === 0 || isCreating}
              className={`px-8 text-2xl py-4 rounded-xl transition-all duration-300 ${
                totalAllocation === 100 && selectedTokens.length > 0 && !isCreating
                  ? 'bg-gradient-to-r from-lime-400 via-lime-500 to-green-500 hover:from-lime-500 hover:via-green-400 hover:to-emerald-600 text-black font-bold cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl text-2xl'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Crate'}
            </button>
          </div>
        </div>
      </div>
     
    </div>
  );
};

export default CrateCreator;