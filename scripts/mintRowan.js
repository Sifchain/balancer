const mockToken = artifacts.require("MockRowanToken.sol");
const { toWei } = web3.utils;
const controller = process.env.CONTROLLER;

module.exports = function(cb) {
  mintRowan(cb);
}

async function mintRowan(cb) {
  const networkType = await web3.eth.net.getNetworkType();
  if(networkType == "mainnet") {
    console.log("This script should be used only for a test net");
    cb();
  }
  try {
    const rowanContract = await mockToken.at(process.env.EROWAN);
    console.log("Rowan address: " + rowanContract.address);
    const res = await rowanContract.mint(controller, toWei("120000000"));
    console.log('tx mint: ' + JSON.stringify(res));
  } catch (error) {
      console.log("ERROR:: ", error)
  }
  cb(); 
}
