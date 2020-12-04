const eRowan = artifacts.require("MockRowanToken");
const BPool = artifacts.require("BPool");
const { toWei } = web3.utils;
const BN = require('bn.js');
const shell = require('shelljs');

const tokenAmount = 364583.333333;
const tokenAmountBN = toWei(new BN(tokenAmount));

module.exports = function(cb) {
  addLiquidity(cb);
};

async function addLiquidity(cb) {
    try {
        const controller = process.env.CONTROLLER;
        const eRowanContract = await eRowan.at(process.env.EROWAN);
        const bpool = await BPool.at(BPool.address);

        let resApprove = await eRowanContract.approve(bpool.address, tokenAmountBN, { from: controller });
        let resBpool = await bpool.joinswapExternAmountIn(tokenAmountBN, { from: controller });

        console.log('tx from bulk whitelisting: ' + JSON.stringify(resApprove));
        console.log('\n\n\n\n\n\n\ntx from bulk whitelisting: ' + JSON.stringify(resBpool));
        shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"Successfully added liquidity to balancer!"}' https://hooks.slack.com/services/` + process.env.SLACK_KEY)
      } catch (error) {
          console.log("ERROR:: ", error);
          shell.exec(`curl -X POST -H 'Content-type: application/json' --data '{"text":"<!channel> Error adding liquidity to balancer: ` + error.message + `"}' https://hooks.slack.com/services/` + process.env.SLACK_FAILURE_KEY)
      }
    cb();
}
