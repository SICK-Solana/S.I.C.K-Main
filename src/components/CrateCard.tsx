// @ts-nocheck
import React from 'react';
import { Bookmark, ArrowBigUp, ArrowBigDown } from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {getTokenData} from '../pages/createcrate/tokens.ts';
import truncate from '../constants/truncate';

// Initialize dayjs relative time plugin
dayjs.extend(relativeTime);

interface Token {
  symbol: string;
  quantity: number;
  icon: string;
  percentage: number;
}

interface CrateCardProps {
  title: string;
  creator: string;
  subtitle: string;
  percentage: number;
  tokens: Token[];
  isFilled?: boolean;
  handleClick?: () => void;
  upvotes: number;
  downvotes: number;
  weightedPriceChange: number;
  createdAt: Date | string | number; // Can accept various date formats
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
  weightedPriceChange,
  createdAt,
}) => {
  const tokenData = getTokenData();
  const timeAgo = dayjs(createdAt).fromNow();

  return (
    <div className={`relative w-full max-w-sm rounded-2xl border p-4 text-white shadow-lg transform transition-transform hover:scale-105 ${
      weightedPriceChange >= 0 
        ? "bg-gradient-to-t from-[#0D1117] to-green-800/30 border-green-900"
        : "bg-gradient-to-t from-[#0D1117] to-red-800/30 border-red-900"
    }`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center space-x-2">
          {/* <div className="flex items-center space-x-1"> */}
{/*           
            <ArrowBigUp size={16} className="text-green-500" />
            <span className="text-xs text-gray-400">{upvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
          
            <ArrowBigDown size={16} className="text-red-500" />
            <span className="text-xs text-gray-400">{downvotes}</span>
          </div> */}
         
          <Bookmark
            className={`cursor-pointer ${isFilled ? "text-blue-500" : "text-gray-400"}`}
            onClick={handleClick}
            size={20}
          />
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-4 text-center">{subtitle}</div>

      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center justify-center space-x-12 mb-6">
          {tokens.slice(0, 2).map((token, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={
                  tokenData.find((t) => t.symbol === token.symbol)?.logoURI ||
                  `/path/to/${token.symbol}-icon.png`
                }
                alt={token.symbol}
                className="w-20 h-20 border-4 border-lime-900 rounded-full shadow-lg"
              />
              <span className="text-sm text-gray-400 mt-2">{token.quantity}%</span>
            </div>
          ))}
          {tokens.length > 2 && (
            <span className="text-sm text-gray-400">+{tokens.length - 2}</span>
          )}
        </div>

        <span className={`text-4xl font-bold ${weightedPriceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {weightedPriceChange >= 0 ? '▲ ' : '▼ '}{weightedPriceChange.toFixed(2)}%
        </span>
      </div>

      <div className="text-center flex flex-col space-y-1">
        <span className="text-[#b7ff1b98] text-xs">
          Created by: <span className="underline text-medium text-sm text-[#B6FF1B]">
            {truncate(creator, 10)}
          </span>
        </span>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>
    </div>
  );
};

export default CrateCard;