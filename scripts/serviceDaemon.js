const BPool = artifacts.require("BPool");
const shell = require("shelljs");
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { toWei, isHex, hexToNumberString} = web3.utils;
const { CONTROLLER, DEFAULT_GAS_PRICE, INFURA_KEY, NETWORK, PRIVATE_KEY, SLACK_KEY } = process.env;
const erowanAmount = 364583.333333;
let fromBlock = '0x0';
let prevLiquidityTxTime = 0;

module.exports = function(cb) {
  addLiquidity(cb);
};

function getProvider() {
  const provider = new HDWalletProvider(PRIVATE_KEY, `https://${NETWORK}.infura.io/v3/${INFURA_KEY}`, 0, 1);
  return new Web3(provider);
}

async function getGasPrice() {
  try {
    const web3 = getProvider();
    const currentGasPrice = await web3?.eth.getGasPrice();
    return Math.ceil(parseInt(currentGasPrice) * 1.5);
  } catch (e) {
    console.log(e);
    return DEFAULT_GAS_PRICE ? parseInt(DEFAULT_GAS_PRICE) : 200000000000;
  }
}

async function isPrevLiquidityTxInTime() {
  const now = new Date().getTime();
  const minPrevLiquidityTxTime = now - (60 * 75 * 1000); // 75 minutes before now
  const logs = await web3?.eth.getPastLogs({fromBlock:fromBlock,address:BPool.address});
  logs.reverse();

  for (let i in logs) {
    const log = logs[i];
    if (isHex(log.data)) {
      const amount = hexToNumberString(log.data);
      if (amount === toWei(erowanAmount.toFixed(6))) {
        const block = await web3?.eth.getBlock(log.blockHash);
        prevLiquidityTxTime = block.timestamp;
        const prevLiquidityTxTimeMillis = prevLiquidityTxTime * 1000;
        if (prevLiquidityTxTimeMillis > minPrevLiquidityTxTime) {
          // previous liquidity iteration in time, update fromBlock to speed up subsequent checks
          fromBlock = block.hash;
          return true;
        }
      }
    }
  }
  return false;
}

async function addLiquidity(cb) {
  try {
    const bPool = await BPool.at(BPool.address);
    let gasPrice = await getGasPrice();
    let erowanAmountIn = erowanAmount;
    const prevLiquidityTxInTime = await isPrevLiquidityTxInTime();
    if (!prevLiquidityTxInTime) {
      gasPrice *= 2;
      erowanAmountIn *= 2;
    }
    let joinswapTx = await bPool.joinswapExternAmountIn(toWei(erowanAmountIn.toFixed(6)), { from: CONTROLLER, gasPrice: gasPrice });
    console.log('\n\n\n\n\n\n\ntx from providing liquidity:\n', JSON.stringify(joinswapTx));
    shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"Successfully added liquidity to balancer!"}' https://hooks.slack.com/services/` + SLACK_KEY)
  } catch (error) {
    console.log("ERROR:: ", error);
    shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"<!channel> Error adding liquidity to balancer: ` + error.message + `"}' https://hooks.slack.com/services/` + SLACK_KEY)
  }
  cb();
}
