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

interface ChartDataPoint {
  timestamp: number;
  value: number;
}

interface JupiterToken {
  id: string;
  symbol: string;
  name: string;
  stats5m?: { priceChange: number };
  stats1h?: { priceChange: number };
  stats24h?: { priceChange: number };
  // ...other fields
}

const JUPITER_SEARCH_API = 'https://datapi.jup.ag/v1/assets/search?query=';

const useCrateCharts = (crates: Crate[]) => {
  const [chartsData, setChartsData] = useState<{ [crateId: string]: ChartDataPoint[] }>({});
  const [weightedPriceChanges, setWeightedPriceChanges] = useState<{ [crateId: string]: number }>({});

  // Helper to fetch a single symbol (uppercased)
  async function fetchJupiterTokenBySymbol(symbol: string): Promise<JupiterToken | undefined> {
    if (!symbol) return undefined;
    const query = symbol.toUpperCase();
    const response = await fetch(`${JUPITER_SEARCH_API}${encodeURIComponent(query)}`);
    if (!response.ok) return undefined;
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      // Debug output
      console.log('Jupiter API response for', query, ':', data);
      return data[0];
    }
    return undefined;
  }

  useEffect(() => {
    const fetchBatchPriceData = async () => {
      try {
        const processedWeightedPriceChanges: { [crateId: string]: number } = {};
        // Gather all unique symbols (uppercased)
        const allSymbols = Array.from(new Set(crates.flatMap(crate => crate.tokens.map(token => token.symbol.toUpperCase()))));
        // Fetch each symbol individually
        const allJupiterTokens: JupiterToken[] = [];
        for (const symbol of allSymbols) {
          const token = await fetchJupiterTokenBySymbol(symbol);
          if (token) allJupiterTokens.push(token);
        }
        // Debug output
        console.log('All Jupiter tokens fetched:', allJupiterTokens);
        // For each crate, compute weighted price change using stats1h (fallback to stats24h)
        for (const crate of crates) {
          let weightedChange = 0;
          let totalWeight = 0;
          crate.tokens.forEach(token => {
            const jupToken = allJupiterTokens.find(jt =>
              (jt.id && token.id && jt.id === token.id) ||
              (jt.symbol && token.symbol && jt.symbol.toUpperCase() === token.symbol.toUpperCase())
            );
            // Debug output for matching
            console.log('Crate token:', token, 'Matched Jupiter:', jupToken);
            let priceChange = 0;
            if (jupToken) {
              if (jupToken.stats1h && typeof jupToken.stats1h.priceChange === 'number') {
                priceChange = jupToken.stats1h.priceChange;
              } else if (jupToken.stats24h && typeof jupToken.stats24h.priceChange === 'number') {
                priceChange = jupToken.stats24h.priceChange;
              }
            }
            weightedChange += priceChange * (token.quantity / 100);
            totalWeight += token.quantity / 100;
          });
          processedWeightedPriceChanges[crate.id] = totalWeight > 0 ? weightedChange / totalWeight : 0;
        }
        setWeightedPriceChanges(processedWeightedPriceChanges);
        setChartsData({}); // No chart data, just for compatibility
      } catch (err) {
        console.error("Error fetching price data:", err);
      }
    };
    fetchBatchPriceData();
  }, [crates]);

  return { chartsData, weightedPriceChanges };
};

export default useCrateCharts;