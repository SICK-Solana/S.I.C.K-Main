import React from 'react';

interface ReturnCalculatorProps {
  returnAmount: number;
  investmentPeriod: number;
  setInvestmentPeriod: (value: number) => void;
}

const ReturnCalculator: React.FC<ReturnCalculatorProps> = ({
  returnAmount,
  investmentPeriod,
  setInvestmentPeriod,
}) => {
  return (
    <div className="bg-gradient-to-b from-gray-800/10 to-green-800/10 rounded-xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl mb-4 font-sans">Return Calculator</h2>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl md:text-2xl font-semibold text-lime-400">$169</span>
        <select className="bg-gray-700/10 rounded px-2 py-1">
          <option>Monthly</option>
        </select>
      </div>
      <input
        type="range"
        min="1"
        max="36"
        value={investmentPeriod}
        onChange={(e) => setInvestmentPeriod(parseInt(e.target.value))}
        className="w-full appearance-none bg-gray-700 h-1 rounded-full outline-none"
        style={{
          background: 'linear-gradient(to right, #84cc16 0%, #84cc16 ' + (investmentPeriod / 36 * 100) + '%, #4b5563 ' + (investmentPeriod / 36 * 100) + '%, #4b5563 100%)'
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: black;
          border: 2px solid #84cc16;
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: black;
          border: 2px solid #84cc16;
          cursor: pointer;
        }
      `}</style>
      <div className="flex flex-col mt-4">
        <div className="flex flex-col md:flex-row justify-between gap-2">
          <span className="mb-2">Investment Period</span>
          <div className="flex gap-2 md:gap-3">
            <button className="hover:bg-lime-700/50 text-lime-100 p-1 bg-lime-700 rounded-xl text-xs md:text-sm">6 months</button>
            <button className="hover:bg-lime-700/50 text-lime-100 p-1 bg-lime-700 rounded-xl text-xs md:text-sm">1 year</button>
            <button className="hover:bg-lime-700/50 text-lime-100 p-1 bg-lime-700 rounded-xl text-xs md:text-sm">3 years</button>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center md:text-left md:pl-10">
        <span className="text-xl md:text-2xl">Return: </span>
        <span className="text-xl md:text-2xl font-bold text-lime-400">${returnAmount}</span>
      </div>
    </div>
  );
};

export default ReturnCalculator;