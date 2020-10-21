const eRowan = artifacts.require("MockRowanToken");
const BPool = artifacts.require("BPool")

const { toWei, fromWei } = web3.utils;
const BN = require('bn.js');

const tokenAmount = 125000000;
const tokenAmountBN = toWei(new BN(tokenAmount));
const weightRowan = 10;
const swap_fee = 0.0;
const weightUsdt = 1;

module.exports = function(cb) {
  addLiquidity(cb);
}

async function addLiquidity(cb) {
    try {
      const controller = process.env.ADDRESS;
      const eRowanContract = await eRowan.at(process.env.EROWAN);
      const bpool = await BPool.at(process.env.BPOOL);

      // first approve and let the bpool have access to 120,000,000 eRowan tokens
      let resApprove = await eRowanContract.approve(bpool.address, tokenAmountBN, { from: controller });

      // then bind eRowan and USDT to the contract
      let resBpool = await bpool.bind(eRowanContract.address, tokenAmountBN, toWei(weightRowan.toString()), { from: controller });
      await bpool.bind(USDT, toWei('45000', 'mwei'), toWei(weightUsdt.toString()), { from: controller });

      // now finalize
      await bpool.setSwapFee(swap_fee, { from: controller });
      await bpool.finalize({ from: controller });
      await bpool.setTokenIntOut(USDT, ROWAN, { from: controller });

        console.log('tx from bulk whitelisting: ' + JSON.stringify(resApprove));
        console.log('\n\n\n\n\n\n\ntx from bulk whitelisting: ' + JSON.stringify(resBpool));
      } catch (error) {
          console.log("ERROR:: ", error)
      }
    cb();
}
