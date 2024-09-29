import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BackendApi from '../constants/api';
import Sidebar from '../components/ui/sidebar';
import SideBarPhone from '../components/ui/sidebarPhone';
import CombinedPriceChart from '../components/ui/CombinedPriceChart.tsx';

interface Token {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  createdAt: string;
  crateId: string;
}

interface CrateData {
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

const Graphtest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crateData, setCrateData] = useState<CrateData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!crateData) return <div>No crate data found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h2 className="text-2xl font-bold mb-2">{crateData.name}</h2>
        <img src={crateData.image} alt={crateData.name} className="w-full h-64 object-cover mb-4 rounded" />
        <p>Created: {new Date(crateData.createdAt).toLocaleDateString()}</p>
        <p>Upvotes: {crateData.upvotes} | Downvotes: {crateData.downvotes}</p>
      </div>

      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h3 className="text-xl font-bold mb-2">Tokens</h3>
        {crateData.tokens.map((token) => (
          <TokenBar key={token.id} token={token} />
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h3 className="text-xl font-bold mb-2">Combined Price Chart</h3>
        <div className="bg-gray-900 p-4 rounded-lg">
  <CombinedPriceChart tokens={crateData.tokens} />
</div>      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-20">
        <h3 className="text-xl font-bold mb-2">Buy Crate</h3>
        <input
          type="number"
          value={inputAmount}
          onChange={handleInputChange}
          placeholder="Enter USDC amount"
          className="w-full p-2 border rounded mb-4"
        />
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Put Your Life Savings in this Crate 🚀
        </button>
      </div>
      <Sidebar/>
      <SideBarPhone/>
    </div>
  );
};

interface TokenBarProps {
  token: Token;
}

const TokenBar: React.FC<TokenBarProps> = ({ token }) => {
  const barWidth = `${token.quantity}%`;
  const hue = Math.floor(Math.random() * 360);

  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{token.name} ({token.symbol})</span>
        <span className="text-sm font-medium">{token.quantity}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ width: barWidth, backgroundColor: `hsl(${hue}, 70%, 50%)` }}
        ></div>
      </div>
    </div>
  );
};

export default Graphtest;