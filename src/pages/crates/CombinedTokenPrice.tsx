import { Bookmark, Share, Copy, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 50 50"
    className={className}
    fill="currentColor"
  >
    <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
  </svg>
);

const CrateValueDisplay: React.FC<{ crateData: CrateData }> = ({ crateData }) => {
  const [combinedValue, setCombinedValue] = useState<number | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false); 

  useEffect(() => {
   

    fetchCombinedValue();
  }, []);
  const fetchCombinedValue = async () => {
    const value = await calculateCombinedValueInUSDC(crateData.tokens);
    setCombinedValue(value);
  };

  const user = localStorage.getItem("user");
  console.log(user);
  const userId = user ? JSON.parse(user).id : "cm1cdrdqa0007qzzifkxm0e47";
  const { id } = useParams<{ id: string }>();

  const addBookMark= async()=>{
    try {
      const response = await fetch(
        `https://sickb.vercel.app/api/crates/${id}/bookmark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userId, // Passing the user ID in the body
          }),
        }
      );
      if (response.ok) {
        console.log("Book mark added successful"); // Debug
        setIsBookmarked(true); // Set bookmark state
      } else {
        throw new Error('Failed to upvote. Status: ${response.status}');
      }
    } catch (error) {
      console.log(error)
    }
  }

  const toggleShareMenu = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareOnX = () => {
    const text = `Check out this Crate on Blinks!`;
    const url = `https://dial.to/?action=solana-action:https://blinks.sickfreak.club/api/actions/buy?crateId=${id}`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = () => {
    const url = `https://dial.to/?action=solana-action:https://blinks.sickfreak.club/api/actions/buy?crateId=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg md:text-xl font-semibold mx-4 text-white text-transparent bg-clip-text">
          {combinedValue !== null ? (
            <div className="flex items-center justify-between gap-2">
              <span>Abstracted Value : ${combinedValue.toFixed(4)}</span>
              <div className="relative">
                <Share 
                  className="w-6 h-6 cursor-pointer text-white"
                  onClick={toggleShareMenu}
                />
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={shareOnX}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <XIcon className="w-4 h-4 mr-2" />
                          Share on X
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={copyLink}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 mr-2 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <Bookmark
                className={`w-6 h-6 cursor-pointer ${
                  isBookmarked ? "text-yellow-500" : "text-white"
                }`}
                onClick={addBookMark}
              />
            </div>
          ) : 'Loading...'}
          <span className="text-xs md:text-sm font-semibold text-white text-transparent bg-clip-text">
            per token of this Crate
          </span>
        </h2>
      </div>
    </div>
  );
};

export default CrateValueDisplay;
