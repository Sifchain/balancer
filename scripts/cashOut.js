const BPool = artifacts.require("BPool");
const iToken = artifacts.require("IERC20");
const pool_address = BPool.address;

module.exports = function(cb) {
  cashOut(cb);
}

async function cashOut(cb) {
    try {
      const controller = process.env.CONTROLLER;
      const eRowanContract = await iToken.at(process.env.EROWAN);
      const usdtContract = await iToken.at(process.env.USDT);
      const bpool = await BPool.at(pool_address);
      let res = await bpool.exitPool([0, 0], { from: controller });
      console.log('tx exit Pool: ' + JSON.stringify(res));
      const rowanBalance = await eRowanContract.balanceOf(controller);
      const usdtBalance = await usdtContract.balanceOf(controller);
      console.log('eRowan balance in controller account: ' + rowanBalance);
      console.log('USDT balance in controller account: ' + usdtBalance);
      } catch (error) {
          console.log("ERROR:: ", error);
      }
    cb();
}
