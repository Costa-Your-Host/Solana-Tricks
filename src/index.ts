import axios from 'axios';

const fetchRaydiumPools = async (page: number, pageSize: number): Promise<Pool[]> => {
  try {
    const response = await axios.get<RaydiumResponse>('https://api-v3.raydium.io/pools/info/list', {
      params: {
        poolType: 'all',
        poolSortField: 'liquidity',
        sortType: 'desc',
        pageSize,
        page,
      },
    });

    const data = response.data;

    if (!data || !data.data || !Array.isArray(data.data.data)) {
      console.error('Unexpected response format:', data);
      return [];
    }

    return data.data.data;
  } catch (error) {
    console.error('Error fetching Raydium pools:', error);
    return [];
  }
};

const calculateMarketCap = (pool: Pool): number => {
  const tvl = parseFloat(pool.tvl.toString());
  return tvl;
};

const main = async () => {
  const pageSize = 1000;
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const pools = await fetchRaydiumPools(page, pageSize);

    if (!Array.isArray(pools)) {
      console.error('Unexpected response format:', pools);
      break;
    }

    for (const pool of pools) {
      console.log(pool);
    }

    hasNextPage = pools.length === pageSize;
    page += 1;
  }
};

main().catch((error) => {
  console.error('Error in main function:', error);
});
