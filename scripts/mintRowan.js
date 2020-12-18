const mockToken = artifacts.require("MockRowanToken.sol");
const { toWei } = web3.utils;
const controller = process.env.CONTROLLER;

module.exports = function(cb) {
  mintRowan(cb);
};

async function mintRowan(cb) {
  try {
    const rowanContract = await mockToken.at(process.env.EROWAN);
    console.log("erowan address: " + rowanContract.address);
    const res = await rowanContract.mint(controller, toWei("8750000"));
    console.log('tx mint: ' + JSON.stringify(res));
  } catch (error) {
      console.log("ERROR:: ", error)
  }
  cb();
}
