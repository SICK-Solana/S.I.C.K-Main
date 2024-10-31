import React from 'react';
// import { Button } from "@/components/ui/button"
// import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import { Button } from "../../components/ui/button"

interface ReturnCalculatorProps {
  returnAmount: number;
  investmentPeriod: number;
  setInvestmentPeriod: (value: number) => void;
}

const ReturnCalculator: React.FC<ReturnCalculatorProps> = ({
  // returnAmount,
  // investmentPeriod,
  // setInvestmentPeriod,
}) => {


  const [amount, setAmount] = React.useState(169)
  const [period, setPeriod] = React.useState(6)
  const [frequency, setFrequency] = React.useState("monthly")

  // Calculate return based on amount and period
  const calculateReturn = () => {
    // This is a simple calculation for demonstration
    // You can replace this with your actual return calculation logic
    const monthlyRate = 0.05 // 5% monthly return rate
    const months = period
    return Math.round(amount * (1 + monthlyRate * months))
  }

  return (
    <div className="bg-gradient-to-b from-gray-800/10 to-green-800/10 rounded-xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl mb-4 font-sans">Return Calculator</h2>
      <div className="flex items-center justify-between mb-8">
        <span className="text-3xl font-bold text-[#4CAF50]">${amount}</span>
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger className="w-[120px] bg-transparent border-zinc-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Slider
        className="mb-8 "
        value={[amount]}
        min={0}
        max={1000}
        step={1}
        onValueChange={(value) => setAmount(value[0])}
      />
      <div className="space-y-4 flex items-center justify-between max-[1253px]:flex-col">
        <div className="text-sm text-zinc-400 text-center">Investment Period</div>
        <div className="flex gap-2">
          <Button
            variant={period === 6 ? "default" : "outline"}
            className={`flex-1 ${period === 6 ? 'bg-[#4CAF50] hover:bg-[#45a049]' : 'bg-transparent rounded-lg border-zinc-800'}`}
            onClick={() => setPeriod(6)}
          >
            6 months
          </Button>
          <Button
            variant={period === 12 ? "default" : "outline"}
            className={`flex-1 ${period === 12 ? 'bg-[#4CAF50] hover:bg-[#45a049]' : 'bg-transparent border-zinc-800'}`}
            onClick={() => setPeriod(12)}
          >
            1 year
          </Button>
          <Button
            variant={period === 36 ? "default" : "outline"}
            className={`flex-1 ${period === 36 ? 'bg-[#4CAF50] hover:bg-[#45a049]' : 'bg-transparent border-zinc-800'}`}
            onClick={() => setPeriod(36)}
          >
            3 years
          </Button>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2">
        <span className="text-zinc-200 font-semibold text-lg">Expected Return:</span>
        <span className="text-2xl font-bold text-[#74ff79] px-2 py-1 rounded-xl border border-green-800">${calculateReturn()}</span>
      </div>

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
      {/* <div className="flex flex-col mt-4">
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
      </div> */}
    </div>
  );
};

export default ReturnCalculator;