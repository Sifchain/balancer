const mockToken = artifacts.require("MockRowanToken.sol");
const { toWei } = web3.utils;
const controller = process.env.CONTROLLER;

module.exports = function(cb) {
  mintRowan(cb);
};

async function mintRowan(cb) {
  try {
    const erowanContract = await mockToken.at(process.env.EROWAN);
    console.log("erowan address:", erowanContract.address);
    const mintTx = await erowanContract.mint(controller, toWei("70000000"));
    console.log('mint tx:', JSON.stringify(mintTx));
  } catch (error) {
    console.log("ERROR:", error)
  }
  cb();
}
