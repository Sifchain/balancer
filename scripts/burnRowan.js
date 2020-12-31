const mockToken = artifacts.require("MockRowanToken.sol");
const { fromWei } = web3.utils;

module.exports = function(cb) {
  burnRowan(cb);
};

async function burnRowan(cb) {
  try {
    const erowanContract = await mockToken.at(process.env.EROWAN);
    console.log("erowan address:", erowanContract.address);
    const erowanBalance = await erowanContract.balanceOf(process.env.CONTROLLER);
    console.log('erowan balance in controller account before burn:', fromWei(erowanBalance));
    const transferTx = await erowanContract.transfer('0x0000000000000000000000000000000000000001', erowanBalance);
    console.log('transfer tx:', JSON.stringify(transferTx));
    const erowanBalanceAfterBurn = await erowanContract.balanceOf(process.env.CONTROLLER);
    console.log('erowan balance in controller account after burn:', fromWei(erowanBalanceAfterBurn));
  } catch (error) {
    console.log("ERROR:", error)
  }
  cb();
}
