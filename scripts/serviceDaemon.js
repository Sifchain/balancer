const eRowan = artifacts.require("MockRowanToken");
const BPool = artifacts.require("BPool")

const { toWei, fromWei } = web3.utils;
const BN = require('bn.js');

const tokenAmount = 625000;
const tokenAmountBN = toWei(new BN(tokenAmount));

module.exports = function(cb) {
  addLiquidity(cb);
}

async function addLiquidity(cb) {
    try {
        const controller = process.env.ADDRESS;
        const eRowanContract = await eRowan.at(process.env.EROWAN);
        const bpool = await BPool.at(process.env.BPOOL);

        let resApprove = await eRowanContract.approve(bpool.address, tokenAmountBN, { from: controller });
        let resBpool = await bpool.joinswapExternAmountIn(tokenAmountBN, { from: controller });
        // pool.joinswapExternAmountIn(toWei('625000'), { from: user }),

        console.log('tx from bulk whitelisting: ' + JSON.stringify(resApprove));
        console.log('\n\n\n\n\n\n\ntx from bulk whitelisting: ' + JSON.stringify(resBpool));
      } catch (error) {
          console.log("ERROR:: ", error)
      }
    cb();
}
