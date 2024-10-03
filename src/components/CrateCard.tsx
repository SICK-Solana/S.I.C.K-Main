import React, {  useState, useEffect, useMemo } from 'react';
import { Bookmark, ArrowBigUp, ArrowBigDown } from "lucide-react";
import tokenData from '../pages/createcrate/tokens.json';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import truncate from '../constants/truncate';

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

interface CrateCardProps {
  title: string;
  creator: string;
  subtitle: string;
  percentage: number;
  tokens: {
    symbol: string | undefined;
    quantity: number;
    icon: string;
    percentage: number;
  }[];
  isFilled?: boolean;
  handleClick?: () => void;
  upvotes: number;
  downvotes: number;
  chartData: ChartDataPoint[];
}

const CrateCard: React.FC<CrateCardProps> = ({
  title,
  subtitle,
  creator,
  tokens,
  isFilled,
  handleClick,
  upvotes,
  downvotes,
  chartData,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [yAxisDomain, setYAxisDomain] = useState<number[]>([0, 0]);

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const minValue = Math.min(...chartData.map((d) => d.value));
      const maxValue = Math.max(...chartData.map((d) => d.value));
      setYAxisDomain([minValue * 0.99, maxValue * 1.01]);
    }else{
      setError('No data found');
    }
  }, [chartData]);

  const formatYAxis = (value: number) => value.toFixed(2);

  const priceChangeColor = useMemo(() => {
    if (!chartData || chartData.length === 0) return "#ffffff";
    const isChartPositive = chartData[0].value <= chartData[chartData.length - 1].value;
    return isChartPositive ? "#4ade80" : "#ef4444";
  }, [chartData]);

  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null;

    return (
      <>
        {error ? (
          <div className="mb-10">
            <img src="/errorgraph.png" className="h-96 mx-auto opacity-50" alt="Error Graph" />
            <h1 className="text-xl max-sm:text-base text-white font-bold text-center">
              Sorry, We couldn't fetch any graphs {":("}
            </h1>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={130}>
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
                formatter={(value: number) => [`$${formatYAxis(value)}`, "Combined Value"]}
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

  return (
    <div className="relative w-full max-w-sm bg-[#0D1117] rounded-2xl border border-gray-800 p-4 text-white">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <ArrowBigUp size={16} className="text-green-500" />
            <span className="text-xs text-gray-400">{upvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowBigDown size={16} className="text-red-500" />
            <span className="text-xs text-gray-400">{downvotes}</span>
          </div>
          <Bookmark
            className={`cursor-pointer ${isFilled ? "text-blue-500" : "text-gray-400"}`}
            onClick={handleClick}
            size={20}
          />
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-4">{subtitle}</div>

      <div className="relative h-32 mb-4">
        {renderChart()}
      </div>

      <div className="flex items-center space-x-1">
        {tokens.slice(0, 3).map((token, index) => (
          <div key={index} className="flex items-center space-x-1">
            <img
              src={
                tokenData.find((t) => t.symbol === token.symbol)?.logoURI ||
                `/path/to/${token.symbol}-icon.png`
              }
              alt={token.symbol}
              className="w-5 h-5 border-2 border-lime-900 rounded-full"
            />
            <span className="text-xs text-gray-400">{token.quantity}%</span>
          </div>
        ))}
        {tokens.length > 3 && (
          <span className="text-xs text-gray-400">+{tokens.length - 3}</span>
        )}
      </div>

      <span className="text-[#b7ff1b98] absolute bottom-4 right-4">
        Created by: <span className="underline text-medium text-[#B6FF1B]">
          {truncate(creator, 10)}
        </span>
      </span>
    </div>
  );
};

export default CrateCard;
