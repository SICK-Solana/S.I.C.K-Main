
interface BuySellSectionProps {
  inputAmount: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGetQuotes: () => Promise<void>;
  selectedCurrency: 'USDC' | 'SOL';
  setSelectedCurrency: (currency: 'USDC' | 'SOL') => void;
}

const BuySellSection: React.FC<BuySellSectionProps> = ({
  inputAmount,
  handleInputChange,
  handleGetQuotes,
  selectedCurrency,
  setSelectedCurrency,
}) => {
  return (
    <div className="bg-gradient-to-b from-gray-800/10 to-green-800/10 rounded-xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Buy / Sell</h2>
      
      <div className="flex gap-4 mb-4 max-[1253px]:flex-col">
        <select 
          value={selectedCurrency} 
          onChange={(e) => setSelectedCurrency(e.target.value as 'USDC' | 'SOL')}
          className="flex-1 bg-gray-700/30 text-white px-4 py-2 rounded-xl"
        >
          <option value="USDC">USDC</option>
          <option value="SOL">SOL</option>
        </select>
        
        <input
          type="number"
          placeholder={`Enter amount in ${selectedCurrency}`}
          className="flex-1 bg-gray-700/30 text-white px-4 py-2 rounded-xl"
          value={inputAmount}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="flex gap-4">
        <button className="flex-1 text-red-700 border-2 border-red-700 bg-transparent px-4 py-2 rounded-xl">
          SELL
        </button>
        <button 
          className="flex-1 bg-gradient-to-b from-lime-500 to-lime-700 text-black px-4 py-2 rounded-xl" 
          onClick={handleGetQuotes}
        >
          BUY
        </button>
      </div>
      
      {/* Remove the swap quotes display section */}
    </div>
  );
};

export default BuySellSection;