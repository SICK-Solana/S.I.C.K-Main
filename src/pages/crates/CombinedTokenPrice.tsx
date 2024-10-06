import { Bookmark } from 'lucide-react';
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

const CrateValueDisplay: React.FC<{ crateData: CrateData }> = ({ crateData }) => {
  const [combinedValue, setCombinedValue] = useState<number | null>(null);

  useEffect(() => {
   

    fetchCombinedValue();
  }, []);
  const fetchCombinedValue = async () => {
    const value = await calculateCombinedValueInUSDC(crateData.tokens);
    setCombinedValue(value);
  };

  const [isBookmarked, setIsBookmarked] = useState(false); 

  const userId = "cm1cdrdqa0007qzzifkxm0e47";
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

  return (
    <div className="space-y-8">
    <div>
      <h2 className="text-lg md:text-xl font-semibold mx-4 bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] text-transparent bg-clip-text">
        {combinedValue !== null ? (
          <div className="flex items-center justify-between gap-2">
          <span>Abstracted Value : ${combinedValue.toFixed(4)}</span>
          <Bookmark
          className={`w-6 h-6 cursor-pointer ${
            isBookmarked ? "text-yellow-500" : "text-white"
          }`}
          onClick={addBookMark}
        />        </div>
        
        ) : 'Loading...'}
        <span className="text-xs md:text-sm font-semibold bg-gradient-to-r from-[#4343FF] via-[#EC55FF] to-[#FFD939] text-transparent bg-clip-text">
          per token of this Crate
        </span>
      </h2>
    </div>
  </div>
  );
};

export default CrateValueDisplay;