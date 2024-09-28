import { Bookmark, HousePlus } from "lucide-react";

interface CrateCardProps {
    title: string;
    subtitle: string;
    percentage: number;
    tokens: { icon: string; percentage: number }[];
    isFilled?: any;
    handleClick?: any;
  }
  
const CrateCard = ({
    title,
    subtitle,
    percentage,
    tokens,
    isFilled,
    handleClick,
  }: CrateCardProps) => {
    return (
      <div
        className={`relative p-4 sm:p-6 rounded-3xl border border-gray-500 text-white shadow-lg ${
          percentage > 0
            ? "bg-gradient-to-b from-[#121019] to-[#070A12]"
            : "bg-gradient-to-b from-[#191010] to-[#070A12]"
        }`}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center cursor-pointer">
          {/* Icon and Title */}
          <div className="flex items-center space-x-2">
            <div className="p-2 sm:p-3 bg-gradient-to-b from-[#a09e9e] to-[#737373] rounded-2xl">
              <HousePlus size={20} />
            </div>
            <h1 className="text-lg sm:text-2xl font-mono">{title}</h1>
          </div>
  
          <Bookmark
            className={isFilled ? "text-blue-500" : "text-gray-400"}
            onClick={handleClick}
            size={20}
          />
        </div>
  
        <div className="mt-2">
          <span className="text-gray-400 bg-[#2e2e2e] rounded-2xl border border-gray-500 px-2 py-1 sm:px-3 sm:py-2 inline-block text-xs sm:text-sm">
            {subtitle}
          </span>
        </div>
  
        <div className="my-4">
          <div className="w-full h-16 sm:h-32 bg-transparent flex items-center">
            <div className="w-full h-[2px] bg-green-400 relative">
              <div className="h-[2px] bg-green-400 w-2/3"></div>
            </div>
          </div>
        </div>
  
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs sm:text-sm text-gray-400">token_split:</div>
          {tokens.map((token, index) => (
            <div className="flex items-center space-x-1" key={index}>
              <span className="w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center">
                <img
                  src={token.icon}
                  alt="token-icon"
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
              </span>
              {token.percentage > 0 && (
                <span className="text-gray-400  text-xs sm:text-sm">
                  {token.percentage}%
                </span>
              )}
            </div>
          ))}
        </div>
  
        {/* Growth Section */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 text-green-400">
          <span className="text-base sm:text-lg font-semibold">
            {percentage}%
          </span>
        </div>
      </div>
    );
  };
  
  export default CrateCard;