const BPool = artifacts.require("BPool");
const iToken = artifacts.require("IERC20");
const poolAddress = BPool.address;
const { fromWei } = web3.utils;

module.exports = function(cb) {
  cashOut(cb);
};

async function cashOut(cb) {
  try {
    const controller = process.env.CONTROLLER;
    const eRowanContract = await iToken.at(process.env.EROWAN);
    const usdtContract = await iToken.at(process.env.USDT);
    const bpool = await BPool.at(poolAddress);
    let exitPoolTx = await bpool.exitPool([0, 0], { from: controller });
    console.log("exit pool tx:", JSON.stringify(exitPoolTx));
    const poolRowanBalance = await eRowanContract.balanceOf(poolAddress);
    const poolUsdtBalance = await usdtContract.balanceOf(poolAddress);
    console.log("\nerowan balance in the pool:", fromWei(poolRowanBalance));
    console.log("USDT balance in the pool:", fromWei(poolUsdtBalance, "mwei"));
    const rowanBalance = await eRowanContract.balanceOf(controller);
    const usdtBalance = await usdtContract.balanceOf(controller);
    console.log("erowan balance in controller account:", fromWei(rowanBalance));
    console.log("USDT balance in controller account:", fromWei(usdtBalance, "mwei"));
  } catch (error) {
    console.log("ERROR:", error);
  }
  cb();
}
