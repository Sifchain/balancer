const iToken = artifacts.require("IERC20");
const BPool = artifacts.require("BPool");
const poolAddress = BPool.address;
const { toWei } = web3.utils;

const totalErowanAmount = 61250000;

module.exports = function(cb) {
  approveErowan(cb);
};

async function approveErowan(cb) {
  try {
    const controller = process.env.CONTROLLER;
    const eRowanContract = await iToken.at(process.env.EROWAN);
    const approveErowanTx = await eRowanContract.approve(poolAddress, toWei(totalErowanAmount.toString()), { from: controller });
    console.log("approve erowan tx:", JSON.stringify(approveErowanTx));
  } catch (error) {
    console.log("ERROR:", error)
  }
  cb();
}
