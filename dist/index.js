"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fetchRaydiumPools = (page, pageSize) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('https://api-v3.raydium.io/pools/info/list', {
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
    }
    catch (error) {
        console.error('Error fetching Raydium pools:', error);
        return [];
    }
});
const calculateMarketCap = (pool) => {
    const tvl = parseFloat(pool.tvl.toString());
    return tvl;
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const pageSize = 1000;
    let page = 1;
    let hasNextPage = true;
    while (hasNextPage) {
        const pools = yield fetchRaydiumPools(page, pageSize);
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
});
main().catch((error) => {
    console.error('Error in main function:', error);
});
//# sourceMappingURL=index.js.map