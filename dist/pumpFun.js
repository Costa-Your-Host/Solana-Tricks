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
exports.fetchTokenInfo = fetchTokenInfo;
const ws_1 = __importDefault(require("ws"));
const axios_1 = __importDefault(require("axios"));
// Establish a WebSocket connection to the specified URL
const ws = new ws_1.default('wss://pumpportal.fun/api/data');
ws.on('open', function open() {
    // Subscribing to token creation events
    const subscribeNewTokenPayload = {
        method: "subscribeNewToken"
    };
    ws.send(JSON.stringify(subscribeNewTokenPayload));
});
ws.on('message', function message(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const parsedData = JSON.parse(data.toString());
            // Assuming the token data contains a property 'ca' which is the contract address
            if (parsedData.mint) {
                fetchTokenInfo(parsedData.mint, parsedData);
            }
        }
        catch (error) {
            console.error('Error processing message data:', error);
        }
    });
});
ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});
ws.on('close', function close() {
    console.log('WebSocket connection closed');
});
// Function to fetch token info
function fetchTokenInfo(ca, token) {
    return __awaiter(this, void 0, void 0, function* () {
        let tokenInfo;
        while ((tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.name) == undefined || null) {
            try {
                const response = yield axios_1.default.get(`https://pumpportal.fun/api/data/token-info`, {
                    params: {
                        ca
                    }
                });
                tokenInfo = response.data.data;
            }
            catch (error) {
                console.error('Error fetching token info:', error);
                return null;
            }
        }
        console.log("Token: ", token);
        console.log("Name: ", tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.name);
        console.log("Ticker: ", tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.symbol);
    });
}
//# sourceMappingURL=pumpFun.js.map