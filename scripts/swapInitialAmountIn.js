const iToken = artifacts.require("IERC20");
const BPool = artifacts.require("BPool");
const poolAddress = BPool.address;
const { toWei } = web3.utils;

// parameters
const totalErowanAmount = 70000000;
const initialErowanAmount = 8750000;
const totalUSDTAmount = 26250;
const weightRowan = 10;
const weightUsdt = 1;

module.exports = function(cb) {
  addLiquidity(cb);
};

async function addLiquidity(cb) {
  try {
    const controller = process.env.CONTROLLER;
    const eRowanContract = await iToken.at(process.env.EROWAN);
    const usdtContract = await iToken.at(process.env.USDT);
    const bpool = await BPool.at(poolAddress);
    console.log("Pool address:", poolAddress);
    console.log("erowan address:", eRowanContract.address);
    console.log("USDT address:", usdtContract.address);
    // approve total erowan amount (70,000,000) to avoid approving at each liquidity iteration
    const approveErowanTx = await eRowanContract.approve(poolAddress, toWei(totalErowanAmount.toString()), { from: controller });
    console.log("approve erowan tx:", JSON.stringify(approveErowanTx));
    const approveUsdtTx = await usdtContract.approve(poolAddress, toWei(totalUSDTAmount.toString(), "mwei"), { from: controller });
    console.log("\n\n\n\n\napprove USDT tx:", JSON.stringify(approveUsdtTx));
    // bind erowan and USDT to the contract
    const bindErowanTx = await bpool.bind(eRowanContract.address, toWei(initialErowanAmount.toString()), toWei(weightRowan.toString()), { from: controller });
    console.log("\n\n\n\n\nbind erowan tx:", JSON.stringify(bindErowanTx));
    const bindUsdtTx = await bpool.bind(usdtContract.address, toWei(totalUSDTAmount.toString(), "mwei"), toWei(weightUsdt.toString()), { from: controller });
    console.log("\n\n\n\n\nbind USDT tx:", JSON.stringify(bindUsdtTx));
    // set erowan and USDT as in/out tokens
    const setTokenInOutTx = await bpool.setTokenInOut(process.env.USDT, process.env.EROWAN, { from: controller });
    console.log("\n\n\n\n\nsetTokenInOut tx:", JSON.stringify(setTokenInOutTx));
  } catch (error) {
    console.log("ERROR:", error)
  }
  cb();
}
