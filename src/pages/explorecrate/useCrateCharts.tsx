import { useState, useEffect } from 'react';

interface Token {
  coingeckoId: string;
  id: string;
  symbol: string;
  name: string;
  quantity: number;
}

interface Crate {
  id: string;
  name: string;
  tokens: Token[];
}

interface PriceData {
  id: string;
  sparkline_in_7d: { price: number[] };
  price_change_percentage_24h: number;
}

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

const useCrateCharts = (crates: Crate[]) => {
  const [chartsData, setChartsData] = useState<{ [crateId: string]: ChartDataPoint[] }>({});

  useEffect(() => {
    const fetchBatchPriceData = async () => {
      try {
        const allCoingeckoIds = new Set(
          crates.flatMap(crate => crate.tokens.map(token => token.coingeckoId))
        );
        const ids = Array.from(allCoingeckoIds).join(',');
        if (ids) {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=${allCoingeckoIds.size}&page=1&sparkline=true&price_change_percentage=24h`,
              {
                headers: {
                  accept: 'application/json',
                  'x-cg-pro-api-key': 'CG-pQUizaXSABJu6ipTw8UFJ8ny'
                }
              }
            );
            const data: PriceData[] = await response.json();

        const processedData: { [crateId: string]: ChartDataPoint[] } = {};

        crates.forEach(crate => {
          const  chartData  = processChartData(data, crate.tokens);
          processedData[crate.id] = chartData;
        });

        setChartsData(processedData);
            // Handle response data (if necessary)
            if (!response.ok) {
                throw new Error('Failed to fetch price data');
              }
          }
       

   

      } catch (err) {
      } finally {
      }
    };

    fetchBatchPriceData();
  }, [crates]);
  const processChartData = (
    priceData: PriceData[],
    tokens: Token[]
  ): ChartDataPoint[] => {
    const quantityMap = new Map(
      tokens.map((token) => [token.coingeckoId, token.quantity])
    ); // Percentage, not actual quantity
    const combinedData: ChartDataPoint[] = [];

    const dataPoints = priceData[0]?.sparkline_in_7d.price.length || 0;

    for (let i = 0; i < dataPoints; i++) {
      let combinedValue = 0;
      priceData.forEach((coin) => {
        const quantityPercentage = quantityMap.get(coin.id) || 0; // This is a percentage (0-100)
        combinedValue +=
          (coin.sparkline_in_7d.price[i] * quantityPercentage) / 100; // Adjust for percentage
      });

      combinedData.push({
        timestamp: Date.now() - (dataPoints - i) * 3600000,
        value: combinedValue,
      });
    }

    return  combinedData 
};

  return { chartsData };
};

export default useCrateCharts;