const eRowan = artifacts.require("MockRowanToken");
const BPool = artifacts.require("BPool");
const BN = require('bn.js');
const shell = require('shelljs');
const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { toWei } = web3.utils;
const { CONTROLLER, DEFAULT_GAS_PRICE, EROWAN, INFURA_KEY, NETWORK, PRIVATE_KEY, SLACK_KEY } = process.env;
const tokenAmount = toWei(new BN(364583.333333));

module.exports = function(cb) {
  addLiquidity(cb);
};

async function getGasPrice() {
  try {
    const provider = new HDWalletProvider(PRIVATE_KEY, `https://${NETWORK}.infura.io/v3/${INFURA_KEY}`, 0, 1);
    const web3 = new Web3(provider);
    const currentGasPrice = await web3?.eth.getGasPrice();
    return Math.ceil(parseInt(currentGasPrice) * 1.2);
  } catch (e) {
    console.log(e);
    return DEFAULT_GAS_PRICE ? parseInt(DEFAULT_GAS_PRICE) : 100000000000;
  }
}

async function addLiquidity(cb) {
  try {
    const eRowanContract = await eRowan.at(EROWAN);
    const bPool = await BPool.at(BPool.address);
    const gasPrice = await getGasPrice();
    let approveTx = await eRowanContract.approve(bPool.address, tokenAmount, { from: CONTROLLER, gasPrice: gasPrice });
    console.log('tx from approving erowan:\n', JSON.stringify(approveTx));
    let joinswapTx = await bPool.joinswapExternAmountIn(tokenAmount, { from: CONTROLLER, gasPrice: gasPrice });
    console.log('\n\n\n\n\n\n\ntx from providing liquidity:\n', JSON.stringify(joinswapTx));
    shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"Successfully added liquidity to balancer!"}' https://hooks.slack.com/services/` + SLACK_KEY)
  } catch (error) {
    console.log("ERROR:: ", error);
    shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"<!channel> Error adding liquidity to balancer: ` + error.message + `"}' https://hooks.slack.com/services/` + SLACK_KEY)
  }
  cb();
}
