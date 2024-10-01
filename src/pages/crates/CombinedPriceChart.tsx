import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Token {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
}

interface PriceData {
  id: string;
  sparkline_in_7d: { price: number[] };
  price_change_percentage_24h: number;
}

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

interface CombinedPriceChartProps {
  tokens: Token[];
}

const CombinedPriceChart: React.FC<CombinedPriceChartProps> = ({ tokens }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [priceChangeColor, setPriceChangeColor] = useState<string>("#4ade80"); // Default to green
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const ids = tokens.map(token => token.symbol.toLowerCase()).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=${tokens.length}&page=1&sparkline=true&price_change_percentage=24h`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }

        const data: PriceData[] = await response.json();
        const processedData = processChartData(data, tokens);
        setChartData(processedData);

        // Calculate the weighted average price change
        const totalQuantity = tokens.reduce((sum, token) => sum + token.quantity, 0);
        const weightedPriceChange = data.reduce((sum, coin, index) => {
          const weight = tokens[index].quantity / totalQuantity;
          return sum + (coin.price_change_percentage_24h * weight);
        }, 0);

        // Set color based on weighted price change
        setPriceChangeColor(weightedPriceChange >= 0 ? "#4ade80" : "#ef4444");
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [tokens]);

  const processChartData = (priceData: PriceData[], tokens: Token[]): ChartDataPoint[] => {
    const quantityMap = new Map(tokens.map(token => [token.symbol.toLowerCase(), token.quantity]));
    const combinedData: ChartDataPoint[] = [];

    // Assume all tokens have the same number of data points
    const dataPoints = priceData[0]?.sparkline_in_7d.price.length || 0;

    for (let i = 0; i < dataPoints; i++) {
      let combinedValue = 0;
      priceData.forEach(coin => {
        const quantity = quantityMap.get(coin.id) || 0;
        combinedValue += (coin.sparkline_in_7d.price[i] * quantity / 100);
      });

      combinedData.push({
        timestamp: Date.now() - (dataPoints - i) * 3600000, // Approximate hourly data
        value: combinedValue
      });
    }

    return combinedData;
  };

  if (loading) return <div>Loading chart data...</div>;
  if (error) return <div>Error loading chart data: {error}</div>;

  return (
    <ResponsiveContainer width="100%" >
      <LineChart data={chartData}>
        <XAxis 
          dataKey="timestamp" 
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          hide
        />
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Tooltip
          contentStyle={{ backgroundColor: '#2a2a2a', border: 'none' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Combined Value']}
          labelFormatter={(label) => new Date(label).toLocaleString()}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={priceChangeColor}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CombinedPriceChart;