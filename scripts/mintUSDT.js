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
    console.log("USDT address:", usdtContract.address);
    const mintUsdtTx = await usdtContract.mint(user, toWei("33000000", "mwei"));
    console.log("mint USDT tx:", JSON.stringify(mintUsdtTx));
  } catch (error) {
    console.log("ERROR:", error)
  }
  cb();
}
