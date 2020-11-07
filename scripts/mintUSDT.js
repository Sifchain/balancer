const mockToken = artifacts.require("MockRowanToken.sol");
const { toWei } = web3.utils;
const controller = process.env.CONTROLLER;

module.exports = function(cb) {
  mintUSDT(cb);
}

async function mintUSDT(cb) {
  try {
    const usdtContract = await mockToken.at(process.env.USDT);
    console.log("USDT address: " + usdtContract.address);
    const res = await usdtContract.mint(controller, toWei("1000", "mwei"));
    console.log('tx mint: ' + JSON.stringify(res));
  } catch (error) {
      console.log("ERROR:: ", error)
  }
  cb(); 
}
