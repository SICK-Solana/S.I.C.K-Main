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
window.location.href = '/crate/' + result.id;
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
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          Sign Up to Create a Crate
        </h1>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="Profile Image URL"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Sign Up
          </button>
        </form>
        {error && (
          <div style={{ backgroundColor: '#ffcccb', color: '#d8000c', padding: '10px', marginTop: '20px', borderRadius: '4px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Create a Crate</h1>
      
      <input
        type="text"
        value={crateName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCrateName(e.target.value)}
        placeholder="Enter crate name"
        style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '4px' }}
      />

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          onChange={handleSearchChange}
          placeholder=" or Search tokens"
          style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        {filteredTokens.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            zIndex: 1000,
          }}>
            {filteredTokens.map((token) => (
              <div
                key={token.address}
                onClick={() => handleTokenSelect(token)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                <img src={token.logoURI} alt={token.name} style={{ width: '24px', height: '24px', marginRight: '10px' }} />
                <span>{token.name} ({token.symbol})</span>
              </div>
            ))}
          </div>
        )}
        
      </div>
     <div style={{ marginBottom: '20px' }}>
  <select 
    onChange={handleSelectChange}
    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
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
        <div key={token.address} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <img src={token.logoURI} alt={token.name} style={{ width: '24px', height: '24px', marginRight: '10px' }} />
          <span style={{ flexGrow: 1 }}>{token.name} ({token.symbol})</span>
          <input
            type="number"
            value={token.allocation}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleAllocationChange(index, e.target.value)}
            style={{ width: '60px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            min="0"
            max="100"
          />
          <span style={{ marginLeft: '5px' }}>%</span>
        </div>
      ))}
      

      <div style={{ backgroundColor: '#f0f0f0', height: '20px', marginTop: '20px', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${totalAllocation}%`, height: '100%', backgroundColor: '#4CAF50', transition: 'width 0.3s ease-in-out' }}></div>
      </div>
      <div style={{ textAlign: 'right', marginTop: '5px' }}>{totalAllocation}% allocated</div>

      {error && (
        <div style={{ backgroundColor: '#ffcccb', color: '#d8000c', padding: '10px', marginTop: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <button 
        onClick={handleCreateCrate}
        disabled={totalAllocation !== 100 || selectedTokens.length === 0}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '20px',
          backgroundColor: totalAllocation === 100 && selectedTokens.length > 0 ? '#4CAF50' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: totalAllocation === 100 && selectedTokens.length > 0 ? 'pointer' : 'not-allowed'
        }}
      >
        Create Crate
      </button>
    </div>
  );
};

export default CrateCreator;