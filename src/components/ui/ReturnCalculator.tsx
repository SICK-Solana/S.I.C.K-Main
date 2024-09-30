import React, { useState, useEffect } from 'react';
import { Slider } from './slider';

interface Token {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
}

interface PriceData {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
}

interface ReturnCalculatorProps {
  tokens: Token[];
}

const ReturnCalculator: React.FC<ReturnCalculatorProps> = ({ tokens }) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(100);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(30); // days
  const [estimatedReturn, setEstimatedReturn] = useState<number | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const ids = tokens.map(token => token.symbol.toLowerCase()).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=${tokens.length}&page=1&sparkline=false&price_change_percentage=24h,7d,30d,1y`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }

        const data: PriceData[] = await response.json();
        setPriceData(data);
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    };

    fetchPriceData();
  }, [tokens]);

  useEffect(() => {
    if (priceData.length > 0) {
      calculateEstimatedReturn();
    }
  }, [investmentAmount, investmentPeriod, priceData]);

  const calculateEstimatedReturn = () => {
    let totalReturn = 0;
    const totalQuantity = tokens.reduce((sum, token) => sum + token.quantity, 0);

    tokens.forEach((token, index) => {
      const tokenData = priceData[index];
      if (!tokenData) return;

      let changePercentage: number;
      if (investmentPeriod <= 1) {
        changePercentage = tokenData.price_change_percentage_24h;
      } else if (investmentPeriod <= 7) {
        changePercentage = tokenData.price_change_percentage_7d;
      } else if (investmentPeriod <= 30) {
        changePercentage = tokenData.price_change_percentage_30d;
      } else {
        changePercentage = tokenData.price_change_percentage_1y;
      }

      const weight = token.quantity / totalQuantity;
      totalReturn += (changePercentage * weight);
    });

    const estimatedValue = investmentAmount * (1 + totalReturn / 100);
    setEstimatedReturn(estimatedValue);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      {/* <Typography variant="h6" className="mb-4 text-white">Return Calculator</Typography> */}
      
      <div className="mb-6">
        {/* <Typography variant="body2" className="mb-2 text-gray-300">Investment Amount: ${investmentAmount}</Typography> */}
        <Slider
          value={[investmentAmount]}
          onValueChange={(value) => setInvestmentAmount(value[0])}
          max={1000}
          step={10}
          className="w-full"
        />
      </div>

      <div className="mb-6">
        {/* <Typography variant="body2" className="mb-2 text-gray-300"> */}
          Investment Period: {investmentPeriod === 365 ? '1 Year' : `${investmentPeriod} Days`}
        {/* </Typography> */}
        <Slider
          value={[investmentPeriod]}
          onValueChange={(value) => setInvestmentPeriod(value[0])}
          max={365}
          step={1}
          className="w-full"
        />
      </div>

      {estimatedReturn !== null && (
        <div className="text-white">
          {/* <Typography variant="body1" className="font-semibold"> */}
            Estimated Return: ${estimatedReturn.toFixed(2)}
          {/* </Typography> */}
          {/* <Typography variant="body2" className="text-gray-300"> */}
            Profit/Loss: ${(estimatedReturn - investmentAmount).toFixed(2)} 
            ({((estimatedReturn / investmentAmount - 1) * 100).toFixed(2)}%)
          {/* </Typography> */}
        </div>
      )}
    </div>
  );
};

export default ReturnCalculator;