const mockToken = artifacts.require("MockRowanToken.sol");
const { fromWei } = web3.utils;

module.exports = function(cb) {
  burnRowan(cb);
};

async function burnRowan(cb) {
  try {
    const rowanContract = await mockToken.at(process.env.EROWAN);
    console.log("Rowan address: " + rowanContract.address);
    const rowanBalance = await rowanContract.balanceOf(process.env.CONTROLLER);
    console.log('eRowan balance in controller account: ' + fromWei(rowanBalance));
    const res = await rowanContract.transfer('0x0000000000000000000000000000000000000001', rowanBalance);
    console.log('tx transfer: ' + JSON.stringify(res));
  } catch (error) {
      console.log("ERROR:: ", error)
  }
  cb();
}
