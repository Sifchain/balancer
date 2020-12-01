const mockToken = artifacts.require("MockRowanToken.sol");
const { toWei } = web3.utils;
const user = process.env.USER_ACCOUNT;

module.exports = function(cb) {
  mintUSDT(cb);
};

async function mintUSDT(cb) {
  const networkType = await web3.eth.net.getNetworkType();
  if(networkType == "main") {
    console.log("This script should be used only for a test net");
    cb();
  }
  try {
    const usdtContract = await mockToken.at(process.env.USDT);
    console.log("USDT address: " + usdtContract.address);
    const res = await usdtContract.mint(user, toWei("99000000", "mwei"));
    console.log('tx mint: ' + JSON.stringify(res));
  } catch (error) {
    console.log("ERROR:: ", error)
  }
  cb();
}
