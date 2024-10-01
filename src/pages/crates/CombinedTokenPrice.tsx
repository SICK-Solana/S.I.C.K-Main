import React, { useState, useEffect } from 'react';

interface Token {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
}

interface CrateData {
  tokens: Token[];
}

const fetchTokenPrice = async (symbol: string): Promise<number | null> => {
  try {
    const response = await fetch(`https://price.jup.ag/v6/price?ids=${symbol}`);
    const { data } = await response.json();
    return data && data[symbol] ? data[symbol].price : null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
};

const calculateCombinedValueInUSDC = async (tokens: Token[]): Promise<number> => {
  let totalValue = 0;
  let totalQuantity = 0;

  for (const token of tokens) {
    let price = await fetchTokenPrice(token.symbol);
    let attempts = 0;
    
    // Retry up to 3 times if price is null
    while (price === null && attempts < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      price = await fetchTokenPrice(token.symbol);
      attempts++;
    }

    if (price !== null) {
      totalValue += price * (token.quantity / 100);
      totalQuantity += token.quantity / 100;
    } else {
      console.warn(`Unable to fetch price for token: ${token.symbol} after multiple attempts`);
    }
  }

  // Calculate average value per token
  const averageValue = totalQuantity > 0 ? totalValue / totalQuantity : 0;

  return averageValue;
};

const CrateValueDisplay: React.FC<{ crateData: CrateData }> = ({ crateData }) => {
  const [combinedValue, setCombinedValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCombinedValue();
  }, [crateData]);

  const fetchCombinedValue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const value = await calculateCombinedValueInUSDC(crateData.tokens);
      setCombinedValue(value);
    } catch (err) {
      setError("Failed to calculate combined value. Please try again.");
      console.error("Error in fetchCombinedValue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg md:text-xl font-semibold mx-4 bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] text-transparent bg-clip-text">
          {isLoading ? (
            'Loading...'
          ) : error ? (
            error
          ) : (
            <div className='flex items-center justify-start gap-2'>
              <div>Average Value: </div>
              ${combinedValue !== null ? combinedValue.toFixed(4) : 'N/A'}
              <img 
                width={20} 
                height={20} 
                src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png" 
                alt="usdc"
              />
            </div>
          )}
          <span className="text-xs md:text-sm font-semibold bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] text-transparent bg-clip-text">
            per token of this Crate
          </span>
        </h2>
      </div>
    </div>
  );
};

export default CrateValueDisplay;