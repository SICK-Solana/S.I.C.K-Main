import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import tokenData from './tokens.json';
import debounce from 'lodash/debounce';

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
  created_at: string;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  minted_at: string | null;
  extensions: {
    coingeckoId: string;
  };
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
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [crateName, setCrateName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalAllocation, setTotalAllocation] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');

  useEffect(() => {
    setTokens(tokenData);
    checkLoginStatus();
  }, []);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedToken = tokens.find(token => token.address === e.target.value);
    if (selectedToken) {
      handleTokenSelect(selectedToken);
    }
  };

  const checkLoginStatus = async () => {
    const creatorId = localStorage.getItem('creatorId');
    const walletAddress = localStorage.getItem('tipLink_pk_connected');

    if (creatorId) {
      setIsLoggedIn(true);
    } else if (walletAddress) {
      try {
        const response = await fetch('https://sickb.vercel.app/api/login-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('creatorId', data.creatorId);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error logging in with wallet:', error);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
   
    const walletAddress = localStorage.getItem('tipLink_pk_connected');
     console.log(walletAddress);
   
     if (!walletAddress) {
      setError('Wallet address not found. Please connect your wallet.');
      return;
    }

    try {
      const response = await fetch('https://sickb.vercel.app/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, username, profileImage, walletAddress }),
      });

      if (!response.ok) throw new Error('Signup failed');

      const data = await response.json();
      localStorage.setItem('creatorId', data.id);
      setIsLoggedIn(true);
      setError('');
    } catch (error) {
      setError('Signup failed. Please try again.');
    }
  };

  const handleTokenSelect = (selectedToken: Token) => {
   
    setSelectedTokens([...selectedTokens, { ...selectedToken, allocation: 0 }]);
    setSearchTerm('');
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
        quantity: token.allocation
      })),
      totalCost: 0,
      creatorId,
      picture: selectedTokens[0].logoURI
    };

    try {
      const response = await fetch('https://sickb.vercel.app/api/crates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crateData)
      });

      if (!response.ok) throw new Error('Failed to create crate');

      const result = await response.json();
      console.log('Crate created:', result);
window.location.href = '/crates/' + result.id;
    } catch (error) {
      if (error instanceof Error) {
        setError('Failed to create crate: ' + error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term);
      }, 300),
    []
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const filteredTokens = useMemo(() => {
    if (!searchTerm) return [];
    return tokens.filter(
      token =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20); // Limit to 5 suggestions
  }, [tokens, searchTerm]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Sign Up to Create a Crate
        </h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="Profile Image URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-300 ease-in-out"
          >
            Sign Up
          </button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-900 rounded-xl shadow-lg text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-lime-400">Create a Crate</h1>
      
      <input
        type="text"
        value={crateName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCrateName(e.target.value)}
        placeholder="Enter crate name"
        className="w-full p-4 mb-6 bg-gray-800 border border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-100"
      />

      <div className="relative mb-6">
        <input
          type="text"
          onChange={handleSearchChange}
          placeholder="Search tokens"
          className="w-full p-4 bg-gray-800 border border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-100"
        />
        {filteredTokens.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-green-700 rounded-lg shadow-lg z-10">
            {filteredTokens.map((token) => (
              <div
                key={token.address}
                onClick={() => handleTokenSelect(token)}
                className="flex items-center p-4 hover:bg-green-900 cursor-pointer transition duration-150 ease-in-out"
              >
                <img src={token.logoURI} alt={token.name} className="w-8 h-8 mr-4" />
                <span className="text-lime-200">{token.name} ({token.symbol})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <select 
          onChange={handleSelectChange}
          className="w-full p-4 bg-gray-800 border border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-100"
        >
          <option value="">Select a token</option>
          {tokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.name} ({token.symbol})
            </option>
          ))}
        </select>
      </div>

      {selectedTokens.map((token, index) => (
        <div key={token.address} className="flex items-center mb-4 bg-green-900 p-4 rounded-lg shadow">
          <img src={token.logoURI} alt={token.name} className="w-8 h-8 mr-4" />
          <span className="flex-grow text-lime-200">{token.name} ({token.symbol})</span>
          <input
            type="number"
            value={token.allocation}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleAllocationChange(index, e.target.value)}
            className="w-20 p-2 bg-gray-800 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-100"
            min="0"
            max="100"
          />
          <span className="ml-2 text-lime-400">%</span>
        </div>
      ))}
      
      <div className="mt-8 bg-green-900 h-4 rounded-full overflow-hidden">
        <div 
          className="h-full bg-lime-500 transition-all duration-300 ease-in-out"
          style={{ width: `${totalAllocation}%` }}
        ></div>
      </div>
      <div className="text-right mt-2 text-lime-400">{totalAllocation}% allocated</div>

      {error && (
        <div className="mt-6 p-4 bg-red-900 border border-red-700 text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <button 
        onClick={handleCreateCrate}
        disabled={totalAllocation !== 100 || selectedTokens.length === 0}
        className={`w-full p-4 mt-8 text-gray-900 font-semibold rounded-lg transition duration-300 ease-in-out ${
          totalAllocation === 100 && selectedTokens.length > 0
            ? 'bg-lime-500 hover:bg-lime-600 cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        Create Crate
      </button>
    </div>
  );
};

export default CrateCreator;