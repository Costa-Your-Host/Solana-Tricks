import WebSocket from 'ws';
import axios from 'axios';

// Define the payload type
interface SubscribePayload {
  method: string;
}

// Establish a WebSocket connection to the specified URL
const ws = new WebSocket('wss://pumpportal.fun/api/data');

ws.on('open', function open() {
  // Subscribing to token creation events
  const subscribeNewTokenPayload: SubscribePayload = {
    method: "subscribeNewToken"
  };
  ws.send(JSON.stringify(subscribeNewTokenPayload));
});

ws.on('message', async function message(data: WebSocket.Data) {
  try {
    const parsedData = JSON.parse(data.toString());
    // Assuming the token data contains a property 'ca' which is the contract address
    if (parsedData.mint) {
      fetchTokenInfo(parsedData.mint, parsedData);
    }
  } catch (error) {
    console.error('Error processing message data:', error);
  }
});

ws.on('error', function error(err: Error) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed');
});

// Function to fetch token info
export async function fetchTokenInfo(ca: string, token: JSON) {
    let tokenInfo;
    while(tokenInfo?.name == undefined || null){ 
      try {
          const response = await axios.get<{ data: TokenInfo }>(`https://pumpportal.fun/api/data/token-info`, {
            params: {
              ca
            }
          });
      
      tokenInfo = response.data.data as TokenInfo;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }
  console.log("Token: ", token)
  console.log("Name: ", tokenInfo?.name)
  console.log("Ticker: ", tokenInfo?.symbol)
}
