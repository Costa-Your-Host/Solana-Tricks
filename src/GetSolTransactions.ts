import { Connection, PublicKey, TransactionSignature, VersionedTransactionResponse } from '@solana/web3.js';
import readline from 'readline';

// Suppress deprecation warnings
process.env.NODE_NO_WARNINGS = '1';

const SOLANA_RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=00f7af21-e727-4112-afd7-0c71a7c49853';

async function getConfirmedSignatures(address: PublicKey): Promise<TransactionSignature[]> {
    const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
    const signatures = await connection.getSignaturesForAddress(address);
    return signatures.map(sigInfo => sigInfo.signature);
}

async function getTransactionDetails(signature: TransactionSignature): Promise<VersionedTransactionResponse | null> {
    const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
    const config = { maxSupportedTransactionVersion: 0 };
    return await connection.getTransaction(signature, config);
}

async function analyzeTransaction(tx: VersionedTransactionResponse | null, address: PublicKey): Promise<void> {
    if (!tx || !tx.meta || !tx.transaction || !tx.transaction.message.getAccountKeys) return;

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
                let interactedWallet: PublicKey | undefined;

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
                    console.log(`From: ${interactedWallet?.toBase58()}`);
                } else {
                    console.log(`To: ${interactedWallet?.toBase58()}`);
                }
                console.log(`Amount of SOL: ${solAmount}`);
                console.log('------------------------------------------');
            }
        }
    }
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Please enter the Solana address to query: ', async (solanaAddress) => {
        rl.close();

        try {
            const address = new PublicKey(solanaAddress);
            const signatures = await getConfirmedSignatures(address);

            console.log(`Transactions involving direct SOL transfers for address ${solanaAddress}:`);

            for (const signature of signatures) {
                const txDetails = await getTransactionDetails(signature);
                await analyzeTransaction(txDetails, address);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

main().catch(console.error);
