interface Mint {
    chainId: number;
    address: string;
    programId: string;
    logoURI: string;
    symbol: string;
    name: string;
    decimals: number;
    tags: string[];
    extensions: Record<string, any>;
  }
  
  interface PeriodData {
    volume: number;
    volumeQuote: number;
    volumeFee: number;
    apr: number;
    feeApr: number;
    priceMin: number;
    priceMax: number;
    rewardApr: any[];
  }
  
  interface Pool {
    type: string;
    programId: string;
    id: string;
    mintA: Mint;
    mintB: Mint;
    price: number;
    mintAmountA: number;
    mintAmountB: number;
    feeRate: number;
    openTime: string;
    tvl: number;
    day: PeriodData;
    week: PeriodData;
    month: PeriodData;
    pooltype: string[];
    rewardDefaultInfos: any[];
    farmUpcomingCount: number;
    farmOngoingCount: number;
    farmFinishedCount: number;
    marketId: string;
    lpMint: Mint;
    lpPrice: number;
    lpAmount: number;
  }
  
  interface RaydiumResponse {
    id: string;
    success: boolean;
    data: {
      count: number;
      data: Pool[];
      hasNextPage: boolean;
    };
  }

  interface TokenInfo {
    createdOn: string;
    description: string;
    image: string;
    name: string;
    showName: boolean;
    symbol: string;
    telegram: string;
    twitter: string;
    website: string;
  }

  interface TokenInfoResponse {
    data: TokenInfo
  }
  
  