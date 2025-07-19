import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Token {
  coingeckoId: string;
  id: string; // This is the mint address
  symbol: string;
  name: string;
  quantity: number;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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
  const [priceChangeColor, setPriceChangeColor] = useState<string>("#4ade80");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 1]);

  // Helper to get mint address by symbol
  async function getMintAddressBySymbol(symbol: string): Promise<string | undefined> {
    if (!symbol) return undefined;
    const response = await fetch(`https://datapi.jup.ag/v1/assets/search?query=${symbol}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0].id) {
        return data[0].id;
      }
    }
    return undefined;
  }

  useEffect(() => {
    const fetchJupiterChartData = async (mint: string, interval = '15_MINUTE', to = Date.now(), candles = 114) => {
      const url = `https://datapi.jup.ag/v2/charts/${mint}?interval=${interval}&to=${to}&candles=${candles}&type=price`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch chart data');
      const data = await response.json();
      return data.candles as Candle[];
    };

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        // Resolve mint addresses for each token by symbol
        const mintAddresses = await Promise.all(tokens.map(token => getMintAddressBySymbol(token.symbol)));
        // Fetch candles for each token
        const now = Date.now();
        const numCandles = 114; // ~1 day of 15m candles
        const allCandles = await Promise.all(
          mintAddresses.map(mint => mint ? fetchJupiterChartData(mint, '15_MINUTE', now, numCandles) : [])
        );
        // Find the minimum length (in case some tokens have less data)
        const minLen = Math.min(...allCandles.map(candles => candles.length));
        // Combine weighted
        const combinedData: ChartDataPoint[] = [];
        for (let i = 0; i < minLen; i++) {
          let combinedValue = 0;
          let timestamp = allCandles[0][i].time * 1000; // Jupiter returns seconds
          tokens.forEach((token, idx) => {
            const weight = token.quantity / 100;
            combinedValue += (allCandles[idx][i].close * weight);
          });
          combinedData.push({ timestamp, value: combinedValue });
        }
        setChartData(combinedData);
        // Calculate price change color
        if (combinedData.length > 1) {
          const change = (combinedData[combinedData.length - 1].value - combinedData[0].value) / combinedData[0].value;
          setPriceChangeColor(change >= 0 ? "#4ade80" : "#ef4444");
        }
        // Set Y axis domain
        const minValue = Math.min(...combinedData.map((d) => d.value));
        const maxValue = Math.max(...combinedData.map((d) => d.value));
        setYAxisDomain([minValue * 0.99, maxValue * 1.01]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [tokens]);

  const formatYAxis = (value: number) => {
    if (value >= 1) return value.toFixed(2);
    if (value >= 0.01) return value.toFixed(4);
    return value.toFixed(8);
  };

  if (loading) return <div className="text-sm">Loading chart data...</div>;

  return (
    <>
      {error ? (
        <div className="mb-6">
          <img
            src="/errorgraph.png"
            className="h-48 mx-auto opacity-50"
            alt=""
          />
          <h1 className="text-sm text-white font-bold text-center">
            Sorry, we couldn't fetch any graphs {":("}
          </h1>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) =>
                new Date(timestamp).toLocaleDateString()
              }
              hide
            />
            <YAxis domain={yAxisDomain} tickFormatter={formatYAxis} hide />
            <Tooltip
              contentStyle={{ backgroundColor: "#2a2a2a", border: "none" }}
              itemStyle={{ color: "#fff", fontSize: "0.75rem" }}
              formatter={(value: number) => [
                `$${formatYAxis(value)}`,
                "Combined Value",
              ]}
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={priceChangeColor}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default CombinedPriceChart;
