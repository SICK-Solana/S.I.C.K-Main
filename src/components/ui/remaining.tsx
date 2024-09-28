import { Button } from "./button";
import { Bookmark, HousePlus, ShoppingCart, Wallet } from "lucide-react";

export default function CryptoDashboard() {

  // Get user data directly from localStorage (will only run once when the component is initialized)
  const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userData ? JSON.parse(userData) : { name: "User" };
 // Truncate the username if it's longer than 10 characters
 const truncatedName = user.name.length > 10 ? user.name.substring(0, 10) + "..." : user.name;


  return (
    <>
      <div className="bg-[#0d1117] w-full md:w-[calc(100%-5rem)] min-h-screen p-4 sm:p-6 md:ml-20  font-mono text-white">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-xl sm:text-2xl bg-gradient-to-b from-[#FFFFFF] to-[#494949] bg-clip-text text-transparent mb-4 sm:mb-0">
          hello_{truncatedName} (&gt;_•)
          </h1>
          <div className="flex items-center">
            <Button className="text-gray-400 hover:text-white">
              <ShoppingCart />
            </Button>
            <Button className="text-gray-400 hover:text-white ml-2">
              <Wallet />
            </Button>
            <div className="w-8 h-8 ml-4 bg-gray-300 rounded-full">
              <img
                src="https://imgs.search.brave.com/6PN65lJBy4NhRQ01F3qEaPE0lg-6nrHcwPfeIWQAAJE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YnJpdGFubmljYS5j/b20vNDUvMjIzMDQ1/LTA1MC1BNjQ1M0Q1/RC9UZWxzYS1DRU8t/RWxvbi1NdXNrLTIw/MTQuanBnP3c9Mzg1"
                alt="lol"
                className="h-8 w-8 rounded-full"
              />
            </div>
          </div>
        </header>

        <main>
          <div className="bg-gradient-to-b from-[#111817] to-[#070C14]   font-mono mb-10 ">
            <div className="grid grid-cols-1 sm:grid-cols-3">
              <div className="border p-4 sm:p-6 border-[#223115]">
                <p className="text-[#238636] text-sm mb-2">▲ 10.0%</p>
                <h2 className="text-4xl sm:text-6xl font-semibold bg-gradient-to-b from-[#B7FC24] to-[#486900] bg-clip-text text-transparent">
                  $1980
                </h2>
                <p className="text-gray-400 mt-2">current_value</p>
              </div>
              <div className="border p-4 sm:p-6 border-[#223115] text-sm sm:text-md text-center">
                <p className="mb-2 text-gray-400">invested_value: $1800</p>
                <p className="mb-2 text-gray-400">
                  total_returns:{" "}
                  <span className="text-[#B6FF1B]">+$180 (10%)</span>
                </p>
                <p className="mb-2 text-gray-400">
                  1D_returns: <span className="text-[#B6FF1B]">+$1 (0.6%)</span>
                </p>
                <p className="text-gray-400">
                  XIRR: <span className="text-[#B6FF1B]">78.4%</span>
                </p>
              </div>
              <div className="text-right p-4 sm:p-6 border border-[#223115]">
                <a href="#" className="text-[#238636] hover:underline text-sm">
                  view_dashboard ↗
                </a>
              </div>
            </div>
          </div>

          <h3 className="text-[#B6FF1B] text-sm ">// crates</h3>
          <h2 className="text-xl sm:text-2xl mb-4 text-gray-400">popular</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
            <CrateCard
              title="Solana Mid Cap"
              subtitle="Mid Cap: 8"
              percentage={12.2}
              tokens={[
                {
                  icon: "https://cryptologos.cc/logos/solana-sol-logo.png",
                  percentage: 14.2,
                },
                {
                  icon: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
                  percentage: 7.38,
                },
                {
                  icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
                  percentage: 7.38,
                },
              ]}
            />
            <CrateCard
              title="Meme Crate"
              subtitle="Meme Tokens: 4"
              percentage={-12.2}
              tokens={[
                {
                  icon: "https://cryptologos.cc/logos/solana-sol-logo.png",
                  percentage: 14.2,
                },
                {
                  icon: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
                  percentage: 7.38,
                },
                {
                  icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
                  percentage: 7.38,
                },
              ]}
            />
          </div>
        </main>
      </div>
    </>
  );
}

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
