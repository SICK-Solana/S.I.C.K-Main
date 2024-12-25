
interface Token {
  symbol: string;
  address: string;
  decimals?: number;
  name?: string;
  logoURI?: string; 
  // Add other token properties as needed
}

let tokenCache: Token[] = [];

const fetchTokenData = async (): Promise<Token[]> => {
  try {
    const response = await fetch('https://tokens.jup.ag/tokens?tags=verified');
    if (!response.ok) {
      throw new Error('Failed to fetch tokens');
    }
    const data = await response.json();
    tokenCache = data;
    return data;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
};

// Initialize the data fetch when the module is imported
fetchTokenData();

// Export a function to get the latest token data
export const getTokenData = (): Token[] => tokenCache;

// Export a function to force refresh the data if needed
export const refreshTokenData = async (): Promise<Token[]> => {
  return await fetchTokenData();
};

export default getTokenData;