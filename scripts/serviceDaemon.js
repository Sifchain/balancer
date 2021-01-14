const BPool = artifacts.require("BPool");
const shell = require("shelljs");
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { toWei, isHex, hexToNumberString} = web3.utils;
const { CONTROLLER, DEFAULT_GAS_PRICE, DEFAULT_GAS_AMOUNT, INFURA_KEY, NETWORK, PRIVATE_KEY, SLACK_KEY } = process.env;
const erowanAmount = 364583.333333;
let gasMultiplier = 2;

module.exports = function(cb) {
  addLiquidity(cb);
};

function getProvider() {
  const provider = new HDWalletProvider(PRIVATE_KEY, `https://${NETWORK}.infura.io/v3/${INFURA_KEY}`, 0, 1);
  return new Web3(provider);
}

async function getGasPrice(web3) {
  try {
    const currentGasPrice = await web3?.eth.getGasPrice();
    return Math.ceil(parseInt(currentGasPrice) * 1.5);
  } catch (e) {
    console.log("Failed to estimate gas price:", e);
    return DEFAULT_GAS_PRICE ? parseInt(DEFAULT_GAS_PRICE) : 250000000000;
  }
}

async function getGasAmount(web3, bPool) {
  try {
    const gasAmount = await bPool.joinswapExternAmountIn.estimateGas(toWei(erowanAmount.toFixed(6)), { from: CONTROLLER });
    return gasAmount * 2;
  } catch (e) {
    console.log("Failed to estimate gas amount:", e);
    return DEFAULT_GAS_AMOUNT ? parseInt(DEFAULT_GAS_AMOUNT) : 3900000;
  }
}

async function getPrevTxNonce(web3) {
  const logs = await web3?.eth.getPastLogs({ address: BPool.address });
  if (logs.length <= 0) {
    return 0;
  }
  const lastLog = logs[logs.length - 1];
  if (isHex(lastLog.data)) {
    const amount = hexToNumberString(lastLog.data);
    if (amount === toWei(erowanAmount.toFixed(6))) {
      const tx = await web3?.eth.getTransaction(lastLog.transactionHash);
      return tx.nonce;
    }
  }
  return 0;
}

async function addLiquidity(cb) {
  try {
    const web3 = getProvider();
    const bPool = await BPool.at(BPool.address);
    const gasPrice = await getGasPrice(web3);
    const gasAmount = await getGasAmount(web3, bPool);
    console.log("Gas price:", gasPrice);
    console.log("Gas amount:", gasAmount);
    const liquidityTx = await bPool.joinswapExternAmountIn(toWei(erowanAmount.toFixed(6)), { from: CONTROLLER, gasPrice: gasPrice, gas: gasAmount });
    console.log("\n\n\nLiquidity tx:", JSON.stringify(liquidityTx));
    shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"Successfully added liquidity to balancer pool!"}' https://hooks.slack.com/services/` + SLACK_KEY)
  } catch (error) {
    console.log("ERROR:", error);
    if (error.toString().includes("Transaction was not mined within")) {
      try {
        const web3 = getProvider();
        const previousTxNonce = await getPrevTxNonce(web3);
        if (previousTxNonce !== 0) {
          const bPool = await BPool.at(BPool.address);
          const gasPrice = await getGasPrice(web3);
          const gasAmount = await getGasAmount(web3, bPool);
          console.log("Previous liquidity tx is pending, try to speed it up");
          console.log("New gas price:", gasPrice);
          console.log("New gas amount:", gasAmount);
          const joinswapTx = await bPool.joinswapExternAmountIn(toWei(erowanAmount.toFixed(6)), { from: CONTROLLER, gasPrice: (gasPrice * gasMultiplier), gas: gasAmount, nonce: previousTxNonce });
          console.log("\n\n\nSpeed up liquidity tx:", JSON.stringify(joinswapTx));
          shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"Successfully added liquidity to balancer pool after speeding it up!"}' https://hooks.slack.com/services/` + SLACK_KEY)
        }
      } catch (e) {
        console.log("Failed to speed up tx:", e);
        shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"<!channel> Failed to speed up pending liquidity transaction: ` + e.message + `"}' https://hooks.slack.com/services/` + SLACK_KEY)
      }
    } else {
      shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"<!channel> Error adding liquidity to balancer pool: ` + error.message + `"}' https://hooks.slack.com/services/` + SLACK_KEY)
    }
  }
  cb();
}
