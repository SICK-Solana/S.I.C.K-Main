import { SwapQuote } from '../../pages/crates/index';

interface BuySellSectionProps {
  inputAmount: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGetQuotes: () => void;
  swapQuotes: SwapQuote[];
  handleSwap: (quote: SwapQuote) => void;
}

const BuySellSection: React.FC<BuySellSectionProps> = ({
  inputAmount,
  handleInputChange,
  handleGetQuotes,
  swapQuotes,
  handleSwap,
}) => {




 
    
  return (
    <div className="bg-gradient-to-b from-gray-800/10 to-green-800/10 rounded-xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Buy / Sell</h2>
     
      <input
        type="number"
        placeholder="Enter amount"
        className="w-full bg-gray-700/30 text-white px-4 py-2 rounded-xl mb-4"
        value={inputAmount}
        onChange={handleInputChange}
      />
    
      <div className="flex gap-4">
        <button className="flex-1 text-red-700 border-2 border-red-700 bg-transparent px-4 py-2 rounded-xl">SELL</button>
        <button className="flex-1 bg-gradient-to-b from-lime-500 to-lime-700 text-black px-4 py-2 rounded-xl" onClick={handleGetQuotes}>BUY</button>
      </div>
    
      {swapQuotes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Swap Quotes:</h4>
          {swapQuotes.map((quote, index) => (
            <div key={index} className="bg-gray-100 p-3 mb-2 rounded">
              <p>{quote.symbol}: {quote.quote.outAmount} output tokens</p>
              <button
                onClick={() => handleSwap(quote)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mt-2"
              >
                Swap
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuySellSection;