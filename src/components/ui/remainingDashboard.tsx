import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const RemainingDashboard = () => {
  interface TokenBalance {
    mint: string;
    symbol: string;
    amount: number;
    price: number;
    usdValue: number;
    icon?: string;
  }

  interface TokenInfo {
    address: string;
    symbol: string;
    logoURI: string;
  }

  const { publicKey } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [tokenList, setTokenList] = useState<TokenInfo[]>([]);

  // Shades of green for donut chart
  const COLORS = ['#00FF00', '#32CD32', '#3CB371', '#2E8B57', '#00FA9A', '#90EE90'];

  useEffect(() => {
    // Fetch token list with icons
    const fetchTokenList = async () => {
      try {
        const response = await fetch('https://tokens.jup.ag/tokens?tags=verified');
        const data = await response.json();
        setTokenList(data);
      } catch (error) {
        console.error("Error fetching token list:", error);
      }
    };

    fetchTokenList();
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) return;

      try {
        console.log("Fetching balances...");
        // Fetch balances using public key
        const balancesResponse = await fetch(`https://lite-api.jup.ag/ultra/v1/balances/${publicKey.toString()}`);
        let balancesData = await balancesResponse.json();
        
        // Replace "SOL" key with actual address
        const solAddress = "So11111111111111111111111111111111111111112";
        if (balancesData["SOL"]) {
          balancesData[solAddress] = balancesData["SOL"];
          delete balancesData["SOL"];
        }
        
        console.log("Balances data received:", balancesData);

        // Extract token IDs from balances response
        const tokenIds = Object.keys(balancesData);
        
        console.log("Fetching prices...");
        // Fetch prices using token IDs
        const pricesResponse = await fetch(`https://lite-api.jup.ag/price/v2?ids=${tokenIds.join(',')}`);
        const pricesData = await pricesResponse.json();
        console.log("Prices data received:", pricesData);

        // Fetch SOL price from CoinGecko
        const solPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
        const solPriceData = await solPriceResponse.json();
        const solPrice = solPriceData.solana.usd;
        console.log("SOL price:", solPrice);
        const processedBalances: TokenBalance[] = [];
        let total = 0;

        // Process balances and prices
        console.log("Processing balances and prices...");
        for (const [token, info] of Object.entries(balancesData)) {
          let price = parseFloat(pricesData.data[token]?.price || '0');
          const amount = (info as any).uiAmount;
          
          // If the token is SOL, use the CoinGecko price
          if (token.toLowerCase() === solAddress.toLowerCase()) {
            price = solPrice;
          }
          
          const value = price * amount;

          console.log(`Processing token: ${token}`, {
            price,
            amount,
            value
          });

          // Get token symbol and icon from token list
          let symbol = token;
          let icon;
          const tokenInfo = tokenList.find(t => t.address.toLowerCase() === token.toLowerCase());
          
          if (token.toLowerCase() === solAddress.toLowerCase()) {
            symbol = "SOL";
            icon = tokenInfo?.logoURI;
          } else if (tokenInfo) {
            symbol = tokenInfo.symbol;
            icon = tokenInfo.logoURI;
          }

          processedBalances.push({
            mint: token,
            symbol: symbol,
            amount: amount,
            price: price,
            usdValue: value,
            icon: icon
          });

          total += value;
        }

        console.log("Final processed balances:", processedBalances);
        console.log("Total portfolio value:", total);

        setBalances(processedBalances);
        setTotalValue(total);

      } catch (error) {
        console.error("Error fetching data:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    };

    fetchBalances();
  }, [publicKey, tokenList]);

  console.log("Rendering dashboard with balances:", balances);
  console.log("Current total value:", totalValue);

  const chartData = balances.map(balance => ({
    name: balance.symbol,
    value: balance.usdValue
  }));

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-[#0A1019]/50 backdrop-blur-sm border border-gray-800">
      <h2 className="text-4xl font-bold mb-8 text-white">Dashboard</h2>
      
      <div className="mb-8 p-6 rounded-xl bg-[#0A1019]/30 border border-gray-800">
        <div className="flex items-baseline">
          <span className="text-gray-200 text-2xl drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]">Total Bag size: </span>
          <span className="text-5xl font-bold ml-2 text-lime-300 drop-shadow-[0_0_15px_rgba(163,230,53,0.7)]">${totalValue.toFixed(2)}</span>
        </div>

        {/* Portfolio Distribution Donut Chart */}
        <div className="h-[300px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                 >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center mt-4 gap-4">
          {chartData
            .sort((a, b) => b.value - a.value) // Sort by value in descending order
            .map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-white">
                  {entry.name}: {((entry.value / totalValue) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          {balances.map((balance) => (
            <div key={balance.mint} className="p-4 rounded-lg bg-[#0A1019]/50 border border-gray-800">
              <div className="flex items-center gap-2">
                {balance.icon && <img src={balance.icon} alt={balance.symbol} className="w-8 h-8" />}
                <div className="text-xl font-medium text-white">{balance.symbol}</div>
              </div>
              <div className="text-green-400 text-lg">${balance.usdValue.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="space-y-4">
        {balances.map((balance) => (
          <div key={balance.mint} className="flex justify-between items-center p-5 rounded-lg bg-[#0A1019]/30 border border-gray-800">
            <div className="flex items-center">
              {balance.icon && <img src={balance.icon} alt={balance.symbol} className="w-8 h-8 mr-3" />}
              <span className="text-xl font-medium text-white">{balance.symbol}</span>
              <span className="text-gray-400 ml-3 text-lg">{balance.amount.toFixed(6)}</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-lg">
                ${balance.price.toFixed(2)}
              </span>
              <span className="text-green-400 font-medium text-xl">
                ${balance.usdValue.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default RemainingDashboard;