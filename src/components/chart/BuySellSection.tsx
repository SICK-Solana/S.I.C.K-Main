


import '../../App.css';


interface BuySellSectionProps {
  inputAmount: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGetQuotes: () => Promise<void>;
}

const BuySellSection: React.FC<BuySellSectionProps> = ({
  inputAmount,
  handleInputChange,
  handleGetQuotes,
}) => {
  return (
    <div className="bg-gradient-to-b from-gray-100/10 to-green-500/10 rounded-xl p-4 md:p-6">
   
    <div className="mb-4 md:flex md:justify-between relative text-xl">
      <input
        type="number"
        placeholder="Enter amount"
        className="w-full bg-gray-700/30 text-white px-4 py-2 rounded-xl pr-16"
        value={inputAmount}
        onChange={handleInputChange}
      />
      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-100">
        SOL
      </span>
    </div>
    <div className="flex justify-center">
      <button 
        className="jersey-10-regular pixel-button bg-gradient-to-b from-lime-500 to-emerald-800 rounded-xl px-4 py-2 text-green-950 font-semibold text-6xl md:text-6xl" 
        style={{fontFamily: "'Jersey 10', serif", fontWeight: '100'}}
      >
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');
        </style>
        BUY
      </button>
    </div>
  </div>
  );
};

export default BuySellSection;
