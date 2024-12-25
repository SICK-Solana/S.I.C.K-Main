import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {getTokenData} from '../../pages/createcrate/tokens.ts';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TokenSplitProps {
  crateData: any;
}

const TokenSplit: React.FC<TokenSplitProps> = ({ crateData }) => {
  const tokenData = getTokenData();
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB', '#FF6384'
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
              <div className="flex items-center">
                <img src={tokenData.find(t => t.symbol === token.symbol)?.logoURI || `/path/to/${token.symbol}-icon.png`} alt={token.symbol} className="w-10 h-10 border-2 border-lime-900 rounded-full mr-2" />
                <span className="text-lime-100 text-xl font-semibold">{token.name}</span>
                <span className="ml-auto">{token.quantity}%</span>
              </div>
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