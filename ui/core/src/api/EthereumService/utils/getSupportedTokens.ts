import { ChainId, createToken, Token } from "../../../entities";

// Parse Truffle json for the most recent address
function parseTruffleJson(
  decimals: number,
  name: string,
  symbol: string,
  jobj: {
    networks: { [s: string]: { address: string } };
  }
) {
  // const entries = Object.entries(jobj.networks);
  // const [last] = entries.slice(-1);
  // const { address } = last[1];
  // TODO use correct address
  return createToken(decimals, symbol, name, ChainId.ETHEREUM, "0xdac17f958d2ee523a2206206994597c13d831ec7");
}

export async function getSupportedTokens(): Promise<Token[]> {
  // gonna load the json and parse the code for all our fake tokens
  const rowanToken = require("../../../../../../build/contracts/RowanToken.json");
  const usdtToken = require("../../../../../../build/contracts/MockRowanToken.json");

  // Return the tokens parsed as assets
  return [
    parseTruffleJson(18, "eRowan", "RWN", rowanToken),
    parseTruffleJson(6, "Tether USD", "USDT", usdtToken),
  ];
}
