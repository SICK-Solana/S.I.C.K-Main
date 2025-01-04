// import React from 'react';
// // import { Button } from "@/components/ui/button"
// // import { Slider } from "@/components/ui/slider"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../components/ui/select"
// import { useEffect } from 'react';
// import { Slider } from "../../components/ui/slider"
// import { Button } from "../../components/ui/button"

// // interface ReturnCalculatorProps {
// //   returnAmount: number;
// //   investmentPeriod: number;
// //   setInvestmentPeriod: (value: number) => void;
// // }

// interface TokenSplitProps {
//   crateData: any;
// }

// const ReturnCalculator: React.FC<TokenSplitProps> = ({crateData}) => {
//   const [crateTokenSymbols, setCrateTokenSymbols] = React.useState<string[]>([]);
//   const [amount, setAmount] = React.useState(169)
//   const [frequency, setFrequency] = React.useState("monthly")
//   const [returnAmount, setReturnAmount] = React.useState(0)



 

//   // Calculate return based on amount and period


//   useEffect(() => {
//     const symbols = crateData.tokens.map((token: { symbol: any; }) => token.symbol);
//     setCrateTokenSymbols(symbols);
//   }, []);
//   const [days,setDays] = React.useState(90);

//   const [tokenPrices, setTokenPrices] = React.useState<any>({});

//   const fetchTokenPrices = async (days: number) => {
//     const results = await Promise.all(
//       crateTokenSymbols.map(async (symbol) => {
//         try {
//           const cleanSymbol = symbol.replace('$', '');
          
//           const response = await fetch(
//             `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${cleanSymbol}&tsym=USD&limit=${days}`
//           );
//           const data = await response.json();
//           const prices = data.Data.Data.map((day: { close: any }) => day.close);
          
//           const firstDay = prices[0];
//           const lastDay = prices[prices.length - 1];
//           const factor = firstDay === 0 ? 1 : lastDay/firstDay;
//           const percentage = firstDay === 0 ? 0 : ((lastDay - firstDay) / firstDay) * 100;

//           console.log({
//             symbol,
//             firstDay,
//             lastDay,
//             factor: isFinite(factor) ? factor : 1,
//             percentage: isFinite(percentage) ? percentage.toFixed(2) : '0.00'
//           })
          
//           return {
//             symbol,
//             firstDay,
//             lastDay,
//             factor: isFinite(factor) ? factor : 1,
//             percentage: isFinite(percentage) ? percentage.toFixed(2) : '0.00'
//           };
//         } catch (e) {
//           console.error(`Error fetching data for ${symbol}:`, e);
//           return null;
//         }
//       })
//     );
    
//     return results.filter(result => result !== null);
//   };

//   useEffect(() => {
//     const getPrices = async () => {
//       const daysMap = {
//         90: '3months',
//         180: '6months',
//         365: '1year'
//       };
      
//       const prices = await fetchTokenPrices(days);
//       setTokenPrices({
//         ...tokenPrices,
//         [daysMap[days as keyof typeof daysMap]]: prices
//       });
//     };

//     getPrices();
//   }, [days, crateTokenSymbols]); // Run when days or tokens change

//   const amountDilution = () => {
//     const daysMap = {
//       90: '3months',
//       180: '6months',
//       365: '1year'
//     };
    
//     const periodKey = daysMap[days as keyof typeof daysMap];
//     const tokens = tokenPrices[periodKey];
    
//     if (!tokens) {
//       return amount;
//     }

//     const totalQuantity = crateData.tokens.reduce((sum: number, token: any) => sum + token.quantity, 0);

//     console.log("Total quantity across all tokens:", totalQuantity);

//     // Calculate weighted return for each token
//     const totalReturn = crateData.tokens.reduce((acc: number, token: any) => {
//       const tokenWeight = token.quantity / totalQuantity;
//       const tokenData = tokens.find((t: { symbol: any; }) => t.symbol === token.symbol);
//       const tokenFactor = tokenData?.factor || 1;
      
//       console.log(`Token: ${token.symbol}`);
//       console.log(`- Quantity: ${token.quantity}`);
//       console.log(`- Weight: ${(tokenWeight * 100).toFixed(2)}%`);
//       console.log(`- Factor: ${tokenFactor}`);
//       console.log(`- Contribution: $${(amount * tokenWeight * tokenFactor).toFixed(2)}`);
      
//       return acc + (amount * tokenWeight * tokenFactor);
//     }, 0);

//     const roundedReturn = Math.round(totalReturn);
//     console.log(`Initial Amount: $${amount}`);
//     console.log(`Final Return: $${roundedReturn}`);

//     setReturnAmount(roundedReturn);
//     return roundedReturn;
//   };

//   // Call amountDilution whenever tokenPrices or amount changes
//   useEffect(() => {
//     amountDilution();
//   }, [tokenPrices, amount, days]);

//   return (
//     <div className="bg-gradient-to-b from-gray-800/10 to-green-800/10 rounded-xl p-4 md:p-6">
//       <h2 className="text-lg md:text-xl mb-4 font-sans">Return Calculator</h2>
//       <div className="flex items-center justify-between mb-8">
//         <span className="text-3xl font-bold text-[#4CAF50]">${amount}</span>
//         <Select value={frequency} onValueChange={setFrequency}>
//           <SelectTrigger className="w-[120px] bg-transparent border-zinc-800">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="monthly">Monthly</SelectItem>
//             <SelectItem value="yearly">Yearly</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//       <Slider
//         className="mb-8 "
//         value={[amount]}
//         min={0}
//         max={1000}
//         step={1}
//         onValueChange={(value:any) => setAmount(value[0])}
//       />
//       <div className="space-y-4 flex items-center justify-between max-[1253px]:flex-col">
//         <div className="text-sm text-zinc-400 text-center">Investment Period</div>
//         <div className="flex gap-2">
//           <Button
//             variant={days === 90 ? "default" : "outline"}
//             className={`flex-1 ${days === 90 ? 'bg-[#4CAF50] hover:bg-[#45a049]' : 'bg-transparent rounded-lg border-zinc-800'}`}
//             onClick={() => setDays(90)}
//           >
//             3 months
//           </Button>
//           <Button
//             variant={days === 180 ? "default" : "outline"}
//             className={`flex-1 ${days === 180 ? 'bg-[#4CAF50] hover:bg-[#45a049]' : 'bg-transparent border-zinc-800'}`}
//             onClick={() => setDays(180)}
//           >
//             6 months
//           </Button>
//           <Button
//             variant={days === 365 ? "default" : "outline"}
//             className={`flex-1 ${days === 365 ? 'bg-[#4CAF50] hover:bg-[#45a049]' : 'bg-transparent border-zinc-800'}`}
//             onClick={() => setDays(365)}
//           >
//             1 year
//           </Button>
//         </div>
//       </div>
//       <div className="mt-8 flex items-center gap-2">
//         <span className="text-zinc-200 font-semibold text-lg">Expected Return:</span>
//         <span className="text-2xl font-bold text-[#74ff79] px-2 py-1 rounded-xl border border-green-800">${returnAmount}</span>
//       </div>

//       <style>{`
//         input[type=range]::-webkit-slider-thumb {
//           -webkit-appearance: none;
//           appearance: none;
//           width: 16px;
//           height: 16px;
//           border-radius: 50%;
//           background: black;
//           border: 2px solid #84cc16;
//           cursor: pointer;
//         }
//         input[type=range]::-moz-range-thumb {
//           width: 16px;
//           height: 16px;
//           border-radius: 50%;
//           background: black;
//           border: 2px solid #84cc16;
//           cursor: pointer;
//         }
//       `}</style>
//       {/* <div className="flex flex-col mt-4">
//         <div className="flex flex-col md:flex-row justify-between gap-2">
//           <span className="mb-2">Investment Period</span>
//           <div className="flex gap-2 md:gap-3">
//             <button className="hover:bg-lime-700/50 text-lime-100 p-1 bg-lime-700 rounded-xl text-xs md:text-sm">6 months</button>
//             <button className="hover:bg-lime-700/50 text-lime-100 p-1 bg-lime-700 rounded-xl text-xs md:text-sm">1 year</button>
//             <button className="hover:bg-lime-700/50 text-lime-100 p-1 bg-lime-700 rounded-xl text-xs md:text-sm">3 years</button>
//           </div>
//         </div>
//       </div>
//       <div className="mt-4 text-center md:text-left md:pl-10">
//         <span className="text-xl md:text-2xl">Return: </span>
//         <span className="text-xl md:text-2xl font-bold text-lime-400">${returnAmount}</span>
//       </div> */}
      
//     </div>
//   );
// };

// export default ReturnCalculator;