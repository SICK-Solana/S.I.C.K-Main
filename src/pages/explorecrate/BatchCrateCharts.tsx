import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface Token {
  coingeckoId: string;
  id: string;
  symbol: string;
  name: string;
  quantity: number;
}

interface Crate {
  id: string;
  name: string;
  tokens: Token[];
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

interface BatchCrateChartsProps {
  crates: Crate[];
}

const BatchCrateCharts: React.FC<BatchCrateChartsProps> = ({ crates }) => {
  const [chartsData, setChartsData] = useState<{ [crateId: string]: ChartDataPoint[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatchPriceData = async () => {
      try {
        const allCoingeckoIds = new Set(
          crates.flatMap(crate => crate.tokens.map(token => token.coingeckoId))
        );
        const ids = Array.from(allCoingeckoIds).join(',');

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=${allCoingeckoIds.size}&page=1&sparkline=true&price_change_percentage=24h`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }

        const data: PriceData[] = await response.json();
        
        const processedData: { [crateId: string]: ChartDataPoint[] } = {};
        crates.forEach(crate => {
          processedData[crate.id] = processChartData(data, crate.tokens);
        });

        setChartsData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBatchPriceData();
  }, [crates]);

  const processChartData = (priceData: PriceData[], tokens: Token[]): ChartDataPoint[] => {
    const quantityMap = new Map(tokens.map(token => [token.coingeckoId, token.quantity]));
    const combinedData: ChartDataPoint[] = [];

    const dataPoints = priceData[0]?.sparkline_in_7d.price.length || 0;

    for (let i = 0; i < dataPoints; i++) {
      let combinedValue = 0;
      priceData.forEach(coin => {
        const quantity = quantityMap.get(coin.id) || 0;
        combinedValue += (coin.sparkline_in_7d.price[i] * quantity) / 100;
      });

      combinedData.push({
        timestamp: Date.now() - (dataPoints - i) * 3600000,
        value: combinedValue,
      });
    }

    return combinedData;
  };

  const renderChart = (crateId: string) => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading chart</div>;

    const data = chartsData[crateId];
    if (!data) return null;

    const isPositive = data[0].value <= data[data.length - 1].value;
    const color = isPositive ? "#4ade80" : "#ef4444";

    return (
      <ResponsiveContainer width="100%" height={128}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div>
      {crates.map(crate => (
        <div key={crate.id}>
          <h3>{crate.name}</h3>
          {renderChart(crate.id)}
        </div>
      ))}
    </div>
  );
};

export default BatchCrateCharts;
