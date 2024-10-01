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

const calculateCombinedValueInUSDC = async (tokens: Token[]): Promise<number> => {
  let combinedValue = 0;

  try {
    for (const token of tokens) {
      const response = await fetch(`https://price.jup.ag/v6/price?ids=${token.symbol}`);
      const { data } = await response.json();
// console.log(data);
      if (data && data[token.symbol]) {
        const tokenPriceInUSDC = data[token.symbol].price;
        const tokenQuantity = token.quantity;
        // console.log(`Price not found for tosken: ${token.symbol} , ${tokenPriceInUSDC} , ${tokenQuantity}`);
        combinedValue += tokenPriceInUSDC * (tokenQuantity / 100);
      } else {
        console.warn(`Price not found for token: ${token.symbol}`);
      }
    }
  } catch (error) {
    console.error("Error calculating combined value in USDC:", error);
  }

  return combinedValue;
};

const CrateValueDisplay: React.FC<{ crateData: CrateData }> = ({ crateData }) => {
  const [combinedValue, setCombinedValue] = useState<number | null>(null);

  useEffect(() => {
   

    fetchCombinedValue();
  }, []);
  const fetchCombinedValue = async () => {
    const value = await calculateCombinedValueInUSDC(crateData.tokens);
    setCombinedValue(value);
  };

  return (
    <div className="space-y-8">
      <div>

        <h2 className="text-lg md:text-xl font-semibold mx-4 bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] text-transparent bg-clip-text">
    {combinedValue !== null ? <div className='flex items-center justify-start gap-2'><div>Abstracted Value  : </div> ${combinedValue.toFixed(4)}  <img width={20} height={20} src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png" alt="usdc"/> </div> : 'Loading...'}           <span className="text-xs md:text-sm font-semibold bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] text-transparent bg-clip-text" >per token of this Crate </span>

</h2>
      
      </div>
    </div>
  );
};

export default CrateValueDisplay;