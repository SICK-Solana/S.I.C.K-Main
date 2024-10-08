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
  const [priceChangeColor, setPriceChangeColor] = useState<string>("#4ade80");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const ids = tokens.map((token) => token.coingeckoId).join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=${tokens.length}&page=1&sparkline=true&price_change_percentage=24h`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch price data");
        }

        const data: PriceData[] = await response.json();
        const processedData = processChartData(data, tokens);
        setChartData(processedData);

        // Calculate the weighted average price change
        const totalQuantity = tokens.reduce(
          (sum, token) => sum + token.quantity,
          0
        );
        const weightedPriceChange = data.reduce((sum, coin, index) => {
          const weight = (tokens[index].quantity * totalQuantity) / 100;
          return sum + coin.price_change_percentage_24h * weight;
        }, 0);

        setPriceChangeColor(weightedPriceChange >= 0 ? "#4ade80" : "#ef4444");

        // Set Y-axis domain
        const minValue = Math.min(...processedData.map((d) => d.value));
        const maxValue = Math.max(...processedData.map((d) => d.value));
        setYAxisDomain([minValue * 0.99, maxValue * 1.01]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, []);

  const processChartData = (
    priceData: PriceData[],
    tokens: Token[]
  ): ChartDataPoint[] => {
    const quantityMap = new Map(
      tokens.map((token) => [token.coingeckoId, token.quantity])
    ); // Percentage, not actual quantity
    const combinedData: ChartDataPoint[] = [];

    const dataPoints = priceData[0]?.sparkline_in_7d.price.length || 0;

    for (let i = 0; i < dataPoints; i++) {
      let combinedValue = 0;
      priceData.forEach((coin) => {
        const quantityPercentage = quantityMap.get(coin.id) || 0; // This is a percentage (0-100)
        combinedValue +=
          (coin.sparkline_in_7d.price[i] * quantityPercentage) / 100; // Adjust for percentage
      });

      combinedData.push({
        timestamp: Date.now() - (dataPoints - i) * 3600000,
        value: combinedValue,
      });
    }

    return combinedData;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1) return value.toFixed(2);
    if (value >= 0.01) return value.toFixed(4);
    return value.toFixed(8);
  };

  if (loading) return <div>Loading chart data...</div>;

  return (
    <>
      {error ? (
        <div className=" mb-10">
          <img src="/errorgraph.png" className="h-96 mx-auto opacity-50" alt="" />
          <h1 className="text-xl max-sm:text-base text-white font-bold text-center">Sorry,We couldn't fetch any graphs {":("}</h1>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
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
              itemStyle={{ color: "#fff" }}
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
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default CombinedPriceChart;
