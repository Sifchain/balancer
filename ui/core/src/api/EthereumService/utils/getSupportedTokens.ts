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
  const entries = Object.entries(jobj.networks);
  const [last] = entries.slice(-1);
  const { address } = last[1];
  return createToken(decimals, symbol, name, ChainId.ETHEREUM, address);
}

export async function getSupportedTokens(): Promise<Token[]> {
  // gonna load the json and parse the code for all our fake tokens
  const rowanToken = require("../../../../../../build/contracts/TestRowanToken.json");
  const usdtToken = require("../../../../../../build/contracts/TestUsdtToken.json");

  // Return the tokens parsed as assets
  return [
    parseTruffleJson(18, "Test eRowan", "tRWN", rowanToken),
    parseTruffleJson(6, "Test Tether USD", "tUSDT", usdtToken),
  ];
}
