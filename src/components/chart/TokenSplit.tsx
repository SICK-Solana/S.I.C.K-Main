import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {getTokenData} from '../../pages/createcrate/tokens.ts';
import React, { useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TokenSplitProps {
  crateData: any;
}

const TokenSplit: React.FC<TokenSplitProps> = ({ crateData }) => {
  const tokenData = getTokenData();
  const colors = [
    '#008000', '#00FF00', '#32CD32', '#3CB371', '#2E8B57', '#006400', '#228B22', '#7FFF00', '#98FB98', '#ADFF2F'
  ];
  

  const pieData = {
    labels: crateData.tokens.map((token: any) => token.name),
    datasets: [
      {
        data: crateData.tokens.map((token: any) => token.quantity),
        backgroundColor: crateData.tokens.map((_: any, index: number) => colors[index % colors.length]),
        borderColor: '#228B22', // Forest Green for borders
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    cutout: '50%', // Makes it a donut chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const token = crateData.tokens[context.dataIndex];
            return `${token.name}: ${token.quantity}%`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  };

  const TokenRow: React.FC<{ token: any; tokenData: any[] }> = ({ token }) => {
    const [iconUrl, setIconUrl] = useState<string | undefined>();

    useEffect(() => {
      async function fetchTokenIcon(tokenId: string) {
        try {
          const response = await fetch(`https://datapi.jup.ag/v1/assets/search?query=${tokenId}`);
          if (!response.ok) return;
          const data = await response.json();
          if (data && data[0] && data[0].icon) {
            setIconUrl(data[0].icon);
          }
        } catch (e) {
          // fallback will be used
        }
      }
      if (token.coingeckoId) {
        fetchTokenIcon(token.coingeckoId);
      }
      if (token.symbol) {
        fetchTokenIcon(token.symbol);
      }
    }, [token.coingeckoId , token.symbol]);

    return (
      <div className="flex items-center">
        <img src={iconUrl} alt={token.symbol} className="w-10 h-10 border-2 border-lime-900 rounded-full mr-2" />
        <span className="text-lime-100 text-xl font-semibold">{token.name}</span>
        <span className="ml-auto">{token.quantity}%</span>
      </div>
    );
  };

  return (
    <div className="mt-8 bg-gradient-to-b from-lime-400/10 to-green-800/10 rounded-xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-10 text-lime-400">Token Split</h2>
      <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-40 h-40 md:h-40 mx-auto md:mr-16">
          <Doughnut data={pieData} options={pieOptions} />
        </div>
        <div className="space-y-2 flex-1 mb-4 md:mb-0">
          {crateData.tokens.map((token: any, index: any) => (
            <div key={token.id}>
              <TokenRow token={token} tokenData={tokenData} />
              {index < crateData.tokens.length - 1 && (
                <hr className="my-2 border-lime-400/30" />
              )}
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default TokenSplit;