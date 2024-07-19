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
const web3_js_1 = require("@solana/web3.js");
const readline_1 = __importDefault(require("readline"));
// Suppress deprecation warnings
process.env.NODE_NO_WARNINGS = '1';
const SOLANA_RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=00f7af21-e727-4112-afd7-0c71a7c49853';
function getConfirmedSignatures(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = new web3_js_1.Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
        const signatures = yield connection.getSignaturesForAddress(address);
        return signatures.map(sigInfo => sigInfo.signature);
    });
}
function getTransactionDetails(signature) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = new web3_js_1.Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
        const config = { maxSupportedTransactionVersion: 0 };
        return yield connection.getTransaction(signature, config);
    });
}
function analyzeTransaction(tx, address) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tx || !tx.meta || !tx.transaction || !tx.transaction.message.getAccountKeys)
            return;
        const accountKeys = tx.transaction.message.getAccountKeys({}).staticAccountKeys;
        const postBalances = tx.meta.postBalances;
        const preBalances = tx.meta.preBalances;
        if (accountKeys.length !== postBalances.length || postBalances.length !== preBalances.length) {
            return;
        }
        // Analyze the balance changes to determine if it's an incoming or outgoing transfer
        for (let i = 0; i < accountKeys.length; i++) {
            if (accountKeys[i].equals(address)) {
                const balanceChange = postBalances[i] - preBalances[i];
                if (balanceChange !== 0) {
                    const solAmount = Math.abs(balanceChange) / 1e9;
                    if (solAmount < 0.1) {
                        return; // Skip transactions with less than 0.1 SOL
                    }
                    const direction = balanceChange > 0 ? 'Incoming' : 'Outgoing';
                    let interactedWallet;
                    // Find the interacted wallet
                    for (let j = 0; j < accountKeys.length; j++) {
                        if (j !== i) {
                            const otherBalanceChange = postBalances[j] - preBalances[j];
                            if (otherBalanceChange === -balanceChange) {
                                interactedWallet = accountKeys[j];
                                break;
                            }
                        }
                    }
                    if (!interactedWallet) {
                        for (let j = 0; j < accountKeys.length; j++) {
                            if (j !== i && (postBalances[j] - preBalances[j]) !== 0) {
                                interactedWallet = accountKeys[j];
                                break;
                            }
                        }
                    }
                    console.log(`Transaction Signature: ${tx.transaction.signatures[0]}`);
                    console.log(`Direction: ${direction}`);
                    if (direction === 'Incoming') {
                        console.log(`From: ${interactedWallet === null || interactedWallet === void 0 ? void 0 : interactedWallet.toBase58()}`);
                    }
                    else {
                        console.log(`To: ${interactedWallet === null || interactedWallet === void 0 ? void 0 : interactedWallet.toBase58()}`);
                    }
                    console.log(`Amount of SOL: ${solAmount}`);
                    console.log('------------------------------------------');
                }
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Please enter the Solana address to query: ', (solanaAddress) => __awaiter(this, void 0, void 0, function* () {
            rl.close();
            try {
                const address = new web3_js_1.PublicKey(solanaAddress);
                const signatures = yield getConfirmedSignatures(address);
                console.log(`Transactions involving direct SOL transfers for address ${solanaAddress}:`);
                for (const signature of signatures) {
                    const txDetails = yield getTransactionDetails(signature);
                    yield analyzeTransaction(txDetails, address);
                }
            }
            catch (error) {
                console.error('Error:', error);
            }
        }));
    });
}
main().catch(console.error);
//# sourceMappingURL=GetSolTransactions.js.map