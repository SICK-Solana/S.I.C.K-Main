import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import tokenData from '../../pages/createcrate/tokens.json';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TokenSplitProps {
  crateData: any;
}

const TokenSplit: React.FC<TokenSplitProps> = ({ crateData }) => {
  const pieData = {
    labels: crateData.tokens.map((token: any) => token.name),
    datasets: [
      {
        data: crateData.tokens.map((token: any) => token.quantity),
        backgroundColor: crateData.tokens.map(( index: number) => `hsl(${50 + index * 80 / crateData.tokens.length}, 70%, ${50 + index * 10 / crateData.tokens.length}%)`),
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
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-lime-400">Token Split</h2>
      <div className="flex flex-col md:flex-row">
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
        <div className="w-full md:w-40 h-40 md:h-40 mx-auto md:ml-16">
          <Doughnut data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default TokenSplit;