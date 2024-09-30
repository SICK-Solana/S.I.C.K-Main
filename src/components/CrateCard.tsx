import { Bookmark, ArrowBigUp, ArrowBigDown } from "lucide-react";

interface CrateCardProps {
  title: string;
  subtitle: string;
  percentage: number;
  tokens: { icon: string; percentage: number }[];
  isFilled?: boolean;
  handleClick?: () => void;
  upvotes: number;
  downvotes: number;

}

const CrateCard = ({
  title,
  subtitle,
  percentage,
  tokens,
  isFilled,
  handleClick,
  upvotes,
  downvotes,
  
}: CrateCardProps) => {
  const isPositive = percentage > 0;
  
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
        {/* Replace this with actual chart component */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-green-500 opacity-20"></div>
      </div>
      
      <div className="flex items-center space-x-1 mb-4">
        {tokens.slice(0, 3).map((token, index) => (
          <div key={index} className="flex items-center space-x-1">
            <img src={token.icon} alt={`Token ${index + 1}`} className="w-5 h-5 rounded-full" />
            <span className="text-xs text-gray-400">{token.percentage}%</span>
          </div>
        ))}
        {tokens.length > 3 && (
          <span className="text-xs text-gray-400">+{tokens.length - 3}</span>
        )}
      </div>
      
      <div className={`absolute bottom-4 right-4 text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(percentage)}%
      </div>
    </div>
  );
};

export default CrateCard;